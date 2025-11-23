import { Pool } from 'pg';
import { config } from '../config.js';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Force IPv4 to avoid IPv6 issues with Supabase
  family: 4,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
