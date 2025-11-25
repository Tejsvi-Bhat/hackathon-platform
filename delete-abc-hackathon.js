import pool from './lib/db/index.js';

async function deleteHackathon() {
  try {
    const result = await pool.query(
      "DELETE FROM hackathons WHERE name = 'ABC' RETURNING id, name"
    );
    
    if (result.rows.length > 0) {
      console.log('Successfully deleted hackathon:', result.rows[0]);
    } else {
      console.log('No hackathon found with name "ABC"');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting hackathon:', error);
    process.exit(1);
  }
}

deleteHackathon();
