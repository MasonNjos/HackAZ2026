const { pool } = require('../../db/pool');

async function getBalance(userId) {
  const result = await pool.query(
    'SELECT COALESCE(SUM(amount), 0) AS balance FROM credits_ledger WHERE user_id = $1',
    [userId]
  );
  return Number(result.rows?.[0]?.balance ?? 0);
}

async function awardCredits({ userId, amount, description }) {
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) throw new Error('awardCredits requires a positive numeric amount');

  const result = await pool.query(
    'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, 'earned', Math.trunc(amt), description || 'Credits awarded']
  );
  return result.rows[0];
}

async function redeemCredits({ userId, cost, rewardType }) {
  const c = Number(cost);
  if (!Number.isFinite(c) || c <= 0) throw new Error('redeemCredits requires a positive numeric cost');

  const balance = await getBalance(userId);
  if (balance < c) {
    const err = new Error('Insufficient balance');
    err.code = 'INSUFFICIENT_BALANCE';
    err.details = { balance, cost: c };
    throw err;
  }

  // v1: off-chain only. v2: call Solana here and store tx signature in DB.
  const description = rewardType ? `Redeemed for ${rewardType}` : 'Redeemed credits';
  const result = await pool.query(
    'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, 'redeemed', -Math.trunc(c), description]
  );

  const voucher = {
    reward_type: rewardType || 'voucher',
    cost: Math.trunc(c),
    issued_at: new Date().toISOString(),
    status: 'issued',
  };

  // Add points to user balances
  if (rewardType === 'Banner Bucks') {
    await pool.query('UPDATE users SET banner_bucks = banner_bucks + $1 WHERE id = $2', [Math.trunc(c), userId]);
  } else if (rewardType === 'Groceries Credit') {
    await pool.query('UPDATE users SET grocery_credit = grocery_credit + $1 WHERE id = $2', [Math.trunc(c), userId]);
  }

  return { ledgerEntry: result.rows[0], voucher, balance_after: balance - c };
}

module.exports = { getBalance, awardCredits, redeemCredits };
