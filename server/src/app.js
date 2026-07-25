import express from 'express';
import auditRoutes from './routes/auditRoutes.js';
import { auditRateLimiter } from './middleware/rateLimiter.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(express.json());


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', auditRateLimiter, auditRoutes);

export default app;