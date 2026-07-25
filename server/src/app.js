import express from 'express';
import auditRoutes from './routes/auditRoutes.js';
import { auditRateLimiter } from './middleware/rateLimiter.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', auditRateLimiter, auditRoutes);

export default app;