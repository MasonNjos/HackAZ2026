const { pool } = require('./server/db/pool');

async function removeLimit() {
  try {
    // We will drop any unique constraint on daily_checkins that involves checkin_date
    const res = await pool.query(`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'daily_checkins'::regclass
      AND contype = 'u';
    `);
    
    for (const row of res.rows) {
      console.log('Dropping constraint:', row.conname);
      await pool.query(`ALTER TABLE daily_checkins DROP CONSTRAINT ${row.conname};`);
    }
    
    // Also check if the index is unique and drop it
    const idxRes = await pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'daily_checkins'
      AND indexdef LIKE '%UNIQUE%';
    `);
    
    for (const row of idxRes.rows) {
      if (row.indexname.includes('pkey')) continue;
      console.log('Dropping unique index:', row.indexname);
      await pool.query(`DROP INDEX IF EXISTS ${row.indexname};`);
    }

    console.log('Successfully removed daily limits from database!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

removeLimit();
