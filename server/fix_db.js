require('dotenv').config();
const { pool } = require('./db/pool');

async function fixDb() {
  try {
    console.log("Dropping constraint...");
    await pool.query(`ALTER TABLE daily_checkins DROP CONSTRAINT IF EXISTS daily_checkins_user_id_checkin_date_key`);
    console.log("Constraint dropped.");

    console.log("Creating patient_alerts table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          alert_reason TEXT NOT NULL,
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("patient_alerts table created.");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixDb();
