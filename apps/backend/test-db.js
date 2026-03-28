require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log(`Connecting to: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')}`);
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    try {
      const res = await client.query('SELECT count(*) FROM agencies');
      console.log(`✅ Table "agencies" exists. Count: ${res.rows[0].count}`);
    } catch (e) {
      console.error('❌ Error querying "agencies" table:', e.message);
    }
    client.release();
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
