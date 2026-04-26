const express = require('express');
const router = express.Router();
const { pool } = require('../db/pool');

// Middleware to ensure user is a doctor
// (In a real app, you would verify the JWT token email here)
const verifyDoctor = (req, res, next) => {
    // For MVP, we trust the frontend or we can pass email in headers
    const email = req.headers['x-user-email'];
    if (!email || !email.toLowerCase().endsWith('@banner.org')) {
        return res.status(403).json({ error: 'Access denied. Medical professionals only.' });
    }
    next();
};

// GET all active Gemini AI alerts
router.get('/alerts', verifyDoctor, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT pa.id, pa.alert_reason, pa.is_read, pa.created_at, u.name, u.email
            FROM patient_alerts pa
            JOIN users u ON pa.user_id = u.id
            WHERE pa.is_read = false
            ORDER BY pa.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching alerts:', err);
        res.status(500).json({ error: 'Server error fetching alerts' });
    }
});

// GET all patients
router.get('/patients', verifyDoctor, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.email 
            FROM patients p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ error: 'Server error fetching patients' });
    }
});

// Mark alert as read
router.post('/alerts/:id/read', verifyDoctor, async (req, res) => {
    try {
        await pool.query(
            'UPDATE patient_alerts SET is_read = true WHERE id = $1',
            [req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error marking alert as read:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
