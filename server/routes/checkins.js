const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

function badRequest(res, message, details) {
    return res.status(400).json({ error: { message, details } });
}

function toNumberOrNull(value) {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

// Get checkins for user
router.get('/', async (req, res) => {
    try {
        // Mock user_id for MVP
        const userId = 1;
        const result = await pool.query(
            'SELECT * FROM daily_checkins WHERE user_id = $1 ORDER BY checkin_date DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Post new checkin
router.post('/', async (req, res) => {
    try {
        const { blood_sugar, insulin_taken, medications_taken, symptoms } = req.body ?? {};
        const userId = 1; // Mock
        const checkinDate = new Date().toISOString().split('T')[0]; // Today

        const bloodSugarNum = toNumberOrNull(blood_sugar);
        const insulinNum = toNumberOrNull(insulin_taken);

        if (bloodSugarNum === null) {
            return badRequest(res, '`blood_sugar` is required');
        }
        if (Number.isNaN(bloodSugarNum)) {
            return badRequest(res, '`blood_sugar` must be a number');
        }
        if (bloodSugarNum < 20 || bloodSugarNum > 600) {
            return badRequest(res, '`blood_sugar` is out of expected range', { min: 20, max: 600 });
        }

        if (insulinNum !== null) {
            if (Number.isNaN(insulinNum)) return badRequest(res, '`insulin_taken` must be a number');
            if (insulinNum < 0 || insulinNum > 200) {
                return badRequest(res, '`insulin_taken` is out of expected range', { min: 0, max: 200 });
            }
        }

        const medsText = medications_taken === undefined || medications_taken === null ? null : String(medications_taken);
        const symptomsText = symptoms === undefined || symptoms === null ? null : String(symptoms);

        const result = await pool.query(
            'INSERT INTO daily_checkins (user_id, checkin_date, blood_sugar, insulin_taken, medications_taken, symptoms) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, checkinDate, bloodSugarNum, insulinNum, medsText, symptomsText]
        );

        // Award credits
        await pool.query(
            'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4)',
            [userId, 'earned', 10, 'Daily check-in completed']
        );

        res.json({ checkin: result.rows[0], awarded_credits: 10 });
    } catch (err) {
        if (err && err.code === '23505') {
            return res.status(409).json({
                error: {
                    message: 'Check-in already exists for today',
                    details: { constraint: err.constraint },
                },
            });
        }
        console.error(err);
        res.status(500).json({ error: { message: 'Server error' } });
    }
});

module.exports = router;