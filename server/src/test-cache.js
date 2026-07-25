import { getCachedAudit, setCachedAudit } from './services/cacheService.js';
import { runAudit } from './services/auditService.js';

const url = 'https://example.com';

let cached = await getCachedAudit(url);
console.log('First check (expect null):', cached);

const fresh = await runAudit(url);
await setCachedAudit(url, fresh);
console.log('Cached audit saved.');

cached = await getCachedAudit(url);
console.log('Second check (expect cached result):', cached ? 'HIT' : 'MISS');

process.exit();