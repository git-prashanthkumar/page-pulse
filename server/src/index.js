import dotenv from 'dotenv';
import { initDb } from './config/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Page Pulse server running on port ${PORT}`);
  });
}

start();