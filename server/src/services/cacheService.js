import { pool } from '../config/db.js';

const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

export async function getCachedAudit(url) {
  const result = await pool.query(
    'SELECT result, expires_at FROM audit_cache WHERE url = $1',
    [url]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const isExpired = new Date(row.expires_at) < new Date();

  if (isExpired) return null;

  return row.result;
}

export async function setCachedAudit(url, auditResult) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000);

  await pool.query(
    `INSERT INTO audit_cache (url, result, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (url)
     DO UPDATE SET result = $2, expires_at = $3, created_at = NOW()`,
    [url, auditResult, expiresAt]
  );
}