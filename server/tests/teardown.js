import { pool } from '../src/config/db.js';

export default async function globalTeardown() {
  await pool.end();
}