import { runAudit } from './services/auditService.js';

try {
  const result = await runAudit('https://example.com');
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error('Audit failed:', err.message);
}