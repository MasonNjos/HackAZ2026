const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

// GET patient profile for user
router.get('/', async (req, res) => {
  try {
    const userId = 1; // mock for MVP
    const result = await pool.query(
      'SELECT * FROM patients WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

// POST create/update patient profile
router.post('/', async (req, res) => {
  try {
    const userId = 1; // mock for MVP
    const {
      name,
      sex,
      height_in,
      weight_lbs,
      date_of_birth,
      diseases,
      tobacco_vaping,
      drinking_times_per_week,
    } = req.body ?? {};

    const result = await pool.query(
      `INSERT INTO patients 
        (user_id, name, sex, height_in, weight_lbs, date_of_birth, diseases, tobacco_vaping, drinking_times_per_week)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        sex = EXCLUDED.sex,
        height_in = EXCLUDED.height_in,
        weight_lbs = EXCLUDED.weight_lbs,
        date_of_birth = EXCLUDED.date_of_birth,
        diseases = EXCLUDED.diseases,
        tobacco_vaping = EXCLUDED.tobacco_vaping,
        drinking_times_per_week = EXCLUDED.drinking_times_per_week
       RETURNING *`,
      [userId, name, sex, height_in, weight_lbs, date_of_birth, diseases, tobacco_vaping, drinking_times_per_week]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;