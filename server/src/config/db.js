import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(-1);
});

async function initDb() {
  const query = `
    CREATE TABLE IF NOT EXISTS audit_cache (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL UNIQUE,
      result JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_audit_cache_url ON audit_cache(url);
    CREATE INDEX IF NOT EXISTS idx_audit_cache_expires ON audit_cache(expires_at);
  `;
  await pool.query(query);
  console.log('Database initialized: audit_cache table ready');
}

export { pool, initDb };