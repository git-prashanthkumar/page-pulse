import { initDb } from '../src/config/db.js';

export default async function globalSetup() {
  await initDb();
}