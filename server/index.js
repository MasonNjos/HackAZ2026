const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./db/pool');
const { optionalAuth0 } = require('./middleware/auth0Optional');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors(
    corsOrigin
      ? {
          origin: corsOrigin.split(',').map((s) => s.trim()),
          credentials: true,
        }
      : undefined
  )
);
app.use(express.json());
app.use(optionalAuth0());

// Ensure pool is initialized on startup
pool
  .query('SELECT 1')
  .then(() => {})
  .catch((err) => console.error('PostgreSQL connection error', err));

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
app.use('/api/credits', require('./routes/credits'));
app.use('/api/events', require('./routes/events'));
app.use('/api/redeem', require('./routes/redeem'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/patients', require('./routes/patients'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;