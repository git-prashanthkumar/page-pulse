import express from 'express';
import { isValidUrl } from '../utils/validators.js';
import { runAudit } from '../services/auditService.js';
import crypto from 'crypto';
import { getCachedAudit, setCachedAudit } from '../services/cacheService.js';

const router = express.Router();

router.post('/audit', async (req, res) => {
  const requestId = crypto.randomUUID();
  const { url } = req.body;

  console.log(JSON.stringify({ requestId, event: 'audit_request', url }));

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      requestId,
      error: 'INVALID_URL',
      message: 'Please provide a valid http or https URL in the "url" field.',
    });
  }

  try {
    const cached = await getCachedAudit(url);
    if (cached) {
      console.log(JSON.stringify({ requestId, event: 'cache_hit', url }));
      return res.status(200).json({ requestId, cached: true, result: cached });
    }

    const result = await runAudit(url);
    await setCachedAudit(url, result);

    console.log(JSON.stringify({ requestId, event: 'audit_success', url }));
    return res.status(200).json({ requestId, cached: false, result });

  } catch (err) {
    console.error(JSON.stringify({ requestId, event: 'audit_error', url, error: err.message }));

    if (err.message === 'TIMEOUT') {
      return res.status(504).json({
        requestId,
        error: 'TIMEOUT',
        message: 'The target URL took too long to respond.',
      });
    }

    return res.status(502).json({
      requestId,
      error: 'FETCH_FAILED',
      message: 'Could not reach the target URL.',
    });
  }
});

export default router;