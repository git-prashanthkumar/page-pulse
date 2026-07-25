import rateLimit from 'express-rate-limit';

export const auditRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many audit requests. Please wait before trying again.',
  },
});