const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

// Get all rides for user
router.get('/', async (req, res) => {
    try {
        const userId = 1; // Mock user ID for MVP
        const result = await pool.query(
            'SELECT * FROM rides WHERE user_id = $1 ORDER BY date ASC, time ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Post a new ride
router.post('/', async (req, res) => {
    try {
        const userId = 1; // Mock user ID
        const { pickup, destination, date, time, wheelchair, reason } = req.body;

        if (!pickup || !destination || !date || !time) {
            return res.status(400).json({ error: { message: 'Missing required fields' } });
        }

        const result = await pool.query(
            `INSERT INTO rides (user_id, pickup, destination, date, time, wheelchair, reason)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, pickup, destination, date, time, wheelchair || false, reason || null]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Server error' } });
    }
});

module.exports = router;
