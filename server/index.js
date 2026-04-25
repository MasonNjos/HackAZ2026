const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const { checkJwt } = require('./auth0');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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

// Auth0-protected test route (send Authorization: Bearer <access_token>)
app.get('/api/private', checkJwt, (req, res) => {
  res.json({ ok: true, message: 'You are authenticated with Auth0.' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkins', require('./routes/checkins'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;