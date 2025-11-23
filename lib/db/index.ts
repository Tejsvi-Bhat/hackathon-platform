import { Pool } from 'pg';
import { config } from '../config.js';

// Use connection string if DATABASE_URL is provided, otherwise use individual params
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
  : {
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.host.includes('supabase.co') ? {
        rejectUnauthorized: false
      } : undefined
    };

const pool = new Pool({
  ...connectionConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
