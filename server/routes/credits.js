const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

function getPagination(req) {
  const limitRaw = req.query.limit;
  const offsetRaw = req.query.offset;

  const limit = limitRaw === undefined ? 50 : Number(limitRaw);
  const offset = offsetRaw === undefined ? 0 : Number(offsetRaw);

  return {
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    offset: Number.isFinite(offset) ? Math.max(offset, 0) : 0,
  };
}

// GET /api/credits/balance
router.get('/balance', async (req, res) => {
  try {
    const userId = 1; // MVP mock user
    const result = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS balance FROM credits_ledger WHERE user_id = $1',
      [userId]
    );
    const userRes = await pool.query(
      'SELECT streak, banner_bucks, grocery_credit FROM users WHERE id = $1',
      [userId]
    );
    const balance = Number(result.rows?.[0]?.balance ?? 0);
    const user = userRes.rows?.[0] || {};
    res.json({ 
      balance,
      streak: user.streak || 0,
      banner_bucks: user.banner_bucks || 0,
      grocery_credit: user.grocery_credit || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// GET /api/credits/ledger?limit=50&offset=0
router.get('/ledger', async (req, res) => {
  try {
    const userId = 1; // MVP mock user
    const { limit, offset } = getPagination(req);

    const result = await pool.query(
      `SELECT id, transaction_type, amount, description, transaction_date
       FROM credits_ledger
       WHERE user_id = $1
       ORDER BY transaction_date DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ items: result.rows, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;
