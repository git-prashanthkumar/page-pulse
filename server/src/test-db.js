import { initDb } from './config/db.js';
initDb().then(() => process.exit());