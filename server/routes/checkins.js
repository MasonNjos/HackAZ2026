const express = require('express');
const router = express.Router();
const pool = require('../index'); // Wait, better to export pool

// Actually, import pool properly
const { Pool } = require('pg');
const poolInstance = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'health_credits',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

// Get checkins for user
router.get('/', async (req, res) => {
    try {
        // Mock user_id for MVP
        const userId = 1;
        const result = await poolInstance.query('SELECT * FROM daily_checkins WHERE user_id = $1 ORDER BY checkin_date DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Post new checkin
router.post('/', async (req, res) => {
    try {
        const { blood_sugar, insulin_taken, medications_taken, symptoms } = req.body;
        const userId = 1; // Mock
        const checkinDate = new Date().toISOString().split('T')[0]; // Today

        const result = await poolInstance.query(
            'INSERT INTO daily_checkins (user_id, checkin_date, blood_sugar, insulin_taken, medications_taken, symptoms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, checkinDate, blood_sugar, insulin_taken, medications_taken, symptoms]
        );

        // Award credits
        await poolInstance.query(
            'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4)',
            [userId, 'earned', 10, 'Daily check-in completed']
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;