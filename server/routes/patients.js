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
    const {
      name,
      sex,
      height_in,
      weight_lbs,
      date_of_birth,
      diseases,
      tobacco_vaping_times_per_week, // matches what Onboarding.js sends
      drinking_times_per_week,
    } = req.body ?? {};

    // Insert a new patient row each time (no mock user_id conflict)
    const result = await pool.query(
      `INSERT INTO patients 
        (user_id, name, sex, height_in, weight_lbs, date_of_birth, diseases, tobacco_vaping_times_per_week, drinking_times_per_week)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        null, // user_id is null until Auth0 is wired up
        name,
        sex,
        height_in,
        weight_lbs,
        date_of_birth === '' ? null : date_of_birth,
        diseases,
        tobacco_vaping_times_per_week,
        drinking_times_per_week,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Server error' } });
  }
});

module.exports = router;