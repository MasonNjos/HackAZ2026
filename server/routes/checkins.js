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
            `INSERT INTO daily_checkins 
              (user_id, checkin_date, blood_sugar, insulin_taken, medications_taken, symptoms, mood, systolic, diastolic, activity_done, activity_details, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
            [userId, checkinDate, bloodSugarNum, insulinNum, medsText, symptomsText,
             req.body.mood || null,
             req.body.systolic || null,
             req.body.diastolic || null,
             req.body.activity_done || false,
             req.body.activity_details || null,
             req.body.notes || null]
          );

        // Update streak logic
        const streakResult = await pool.query(`
          UPDATE users SET 
            streak = CASE 
              WHEN last_checkin_date = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1 
              WHEN last_checkin_date = CURRENT_DATE THEN streak 
              ELSE 1 
            END, 
            last_checkin_date = CURRENT_DATE 
          WHERE id = $1 RETURNING streak, last_checkin_date;
        `, [userId]);

        const updatedStreak = streakResult.rows[0]?.streak || 1;

        // Award credits (10 base + 5 for streak > 3)
        const creditAmount = updatedStreak >= 3 ? 15 : 10;
        await pool.query(
            'INSERT INTO credits_ledger (user_id, transaction_type, amount, description) VALUES ($1, $2, $3, $4)',
            [userId, 'earned', creditAmount, `Daily check-in completed (Streak: ${updatedStreak})`]
        );

        res.json({ checkin: result.rows[0], awarded_credits: creditAmount, streak: updatedStreak });

        // Trigger AI analysis asynchronously (don't await so we don't block the response)
        const { analyzePatientData } = require('../services/aiService');
        analyzePatientData(userId).catch(e => console.error("AI Analysis failed:", e));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: 'Server error' } });
    }
});

module.exports = router;