require('dotenv').config();
const { pool } = require('./db/pool');

const run = async () => {
  try {
    await pool.query('ALTER TABLE daily_checkins DROP CONSTRAINT IF EXISTS daily_checkins_user_id_checkin_date_key;');
    console.log('Constraint dropped successfully');
  } catch (err) {
    console.error('Error dropping constraint:', err.message);
  } finally {
    pool.end();
  }
};

run();
