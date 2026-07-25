import express from 'express';
import auditRoutes from './routes/auditRoutes.js';
import { auditRateLimiter } from './middleware/rateLimiter.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, '../client')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', auditRateLimiter, auditRoutes);

export default app;