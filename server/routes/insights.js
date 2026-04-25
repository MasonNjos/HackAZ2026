const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');
const { analyzeCheckins } = require('../services/gemmaMock');

// GET /api/insights?days=7
router.get('/', async (req, res) => {
  try {
    const userId = 1; // MVP mock user
    const days = req.query.days === undefined ? 7 : Number(req.query.days);
    const windowDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 30) : 7;

    const result = await pool.query(
      `SELECT checkin_date, blood_sugar, insulin_taken, medications_taken, symptoms
       FROM daily_checkins
       WHERE user_id = $1 AND checkin_date >= (CURRENT_DATE - ($2::int || ' days')::interval)
       ORDER BY checkin_date ASC`,
      [userId, windowDays]
    );

    const alerts = analyzeCheckins(result.rows);
    res.json({ window_days: windowDays, alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;
