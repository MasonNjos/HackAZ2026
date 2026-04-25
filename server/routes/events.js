const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

function unauthorized(res, message) {
  return res.status(401).json({ error: { message } });
}

// POST /api/events/blackboard
// MVP: require a shared secret header (EVENTS_SHARED_SECRET)
router.post('/blackboard', async (req, res) => {
  try {
    const expected = process.env.EVENTS_SHARED_SECRET;
    if (expected) {
      const provided = req.headers['x-events-secret'];
      if (!provided || provided !== expected) return unauthorized(res, 'Invalid events secret');
    }

    const { module_id, completed_at } = req.body ?? {};
    if (!module_id) {
      return res.status(400).json({ error: { message: '`module_id` is required' } });
    }

    const completedAt = completed_at ? new Date(completed_at) : new Date();
    if (Number.isNaN(completedAt.getTime())) {
      return res.status(400).json({ error: { message: '`completed_at` must be a valid date' } });
    }

    const userId = 1; // MVP mock user

    const insertEvent = await pool.query(
      `INSERT INTO learning_completions (user_id, module_id, completed_at, source)
       VALUES ($1, $2, $3, 'blackboard')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [userId, String(module_id), completedAt.toISOString()]
    );

    const inserted = insertEvent.rows[0] || null;
    if (!inserted) {
      return res.status(200).json({ status: 'duplicate', awarded_credits: 0 });
    }

    const awardAmount = 25;
    await pool.query(
      'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4)',
      [userId, 'earned', awardAmount, `Completed module: ${module_id}`]
    );

    res.json({ status: 'ok', completion: inserted, awarded_credits: awardAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;
