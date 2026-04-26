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
// Ensure pool is initialized on startup and create tables
const initDb = async () => {
  try {
    await pool.query(`
      SELECT 1;
      
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          auth0_id VARCHAR(255) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          name VARCHAR(255),
          streak INTEGER DEFAULT 0,
          last_checkin_date DATE,
          banner_bucks INTEGER DEFAULT 0,
          grocery_credit INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_checkin_date DATE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_bucks INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS grocery_credit INTEGER DEFAULT 0;

      -- Daily check-ins table
      CREATE TABLE IF NOT EXISTS daily_checkins (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          checkin_date DATE NOT NULL,
          blood_sugar DECIMAL(5,2),
          insulin_taken DECIMAL(5,2),
          medications_taken TEXT,
          symptoms TEXT,
          mood VARCHAR(50),
          systolic INTEGER,
          diastolic INTEGER,
          activity_done BOOLEAN DEFAULT false,
          activity_details TEXT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Credits ledger table
      CREATE TABLE IF NOT EXISTS credits_ledger (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          transaction_type VARCHAR(50) NOT NULL, -- 'earned', 'redeemed'
          amount INTEGER NOT NULL,
          description TEXT,
          transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Index for performance
      CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON daily_checkins(user_id, checkin_date);
      CREATE INDEX IF NOT EXISTS idx_credits_user ON credits_ledger(user_id);

      -- Blackboard / learning module completion events
      CREATE TABLE IF NOT EXISTS learning_completions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          module_id VARCHAR(255) NOT NULL,
          completed_at TIMESTAMP NOT NULL,
          source VARCHAR(50) DEFAULT 'blackboard',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, module_id, completed_at)
      );

      CREATE INDEX IF NOT EXISTS idx_learning_user_completed ON learning_completions(user_id, completed_at);

      -- new patient table
      CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name VARCHAR(255),
          sex VARCHAR(50),
          height_in DECIMAL(5,2),
          weight_lbs DECIMAL(5,2),
          date_of_birth DATE,
          diseases TEXT[],
          tobacco_vaping_times_per_week INTEGER,
          drinking_times_per_week INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE patients ADD COLUMN IF NOT EXISTS tobacco_vaping_times_per_week INTEGER;
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS drinking_times_per_week INTEGER;


    CREATE TABLE IF NOT EXISTS health_credits (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        amount INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rides (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          pickup VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          wheelchair BOOLEAN DEFAULT false,
          reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auto-seed mock user for MVP
    await pool.query(`
      INSERT INTO users (id, auth0_id, email, name)
      VALUES (1, 'mock-auth0-id', 'test@test.com', 'Test User')
      ON CONFLICT DO NOTHING;
    `);
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('PostgreSQL connection error or table creation error', err);
  }
};

initDb();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Health Credits API is running' });
});
// Auth0-protected test route (send Authorization: Bearer <access_token>)
//app.get('/api/private', checkJwt, (req, res) => {
//  res.json({ ok: true, message: 'You are authenticated with Auth0.' });
//});
//app.use('/api/auth', require('./routes/auth'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/events', require('./routes/events'));
app.use('/api/redeem', require('./routes/redeem'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/ai', require('./routes/ai')); // <── NEW AI ROUTE
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;