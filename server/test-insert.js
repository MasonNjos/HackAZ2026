require('dotenv').config();
const { pool } = require('./db/pool');
const run = async () => {
  try {
    const result = await pool.query(
      `INSERT INTO patients 
        (user_id, name, sex, height_in, weight_lbs, date_of_birth, diseases, tobacco_vaping_times_per_week, drinking_times_per_week)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [null, 'Test', 'Male', 70, 160, '1990-01-01', ['Diabetes Type 1'], 0, 0]
    );
    console.log('Success:', result.rows[0]);
  } catch(e) {
    console.error('DB Error:', e.message);
  } finally {
    pool.end();
  }
};
run();
