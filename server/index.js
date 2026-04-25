const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'health_credits',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

// Test DB connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL');
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Health Credits API is running' });
});

// Placeholder for checkins route
app.use('/api/checkins', require('./routes/checkins'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;