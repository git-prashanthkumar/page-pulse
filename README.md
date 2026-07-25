# Page Pulse — URL Audit Service

A production-grade URL audit API that checks a website's status, performance, and basic SEO/security signals. Built for the Digital Heroes SDE qualification task.

**Live app:** https://page-pulse-n8eu.onrender.com
**Note:** hosted on Render's free tier — if the service has been idle, the first request may take 30–50 seconds while it wakes up.

## What it checks
- HTTP status code and response time
- Page title, meta description
- Viewport meta tag (mobile-friendliness signal)
- Canonical link presence
- Key response headers: Content-Type, Server, X-Frame-Options, Strict-Transport-Security

## Architecture
- **Backend:** Node.js + Express (ES modules)
- **Database:** PostgreSQL — stores cached audit results with a TTL
- **Caching:** repeat audits of the same URL within a configurable window (default 5 minutes) are served from cache instead of refetching
- **Rate limiting:** 20 requests/minute per IP
- **Logging:** structured JSON logs with a unique request ID per request, for traceability
- **Tests:** Jest + Supertest, covering validation, success paths, and caching behavior
- **CI:** GitHub Actions runs the full test suite against a real disposable Postgres container on every push

## API Contract

### `POST /api/audit`
Runs (or returns cached) an audit for a given URL.

**Request body:**
```json
{ "url": "https://example.com" }
```

**Success response — `200 OK`:**
```json
{
  "requestId": "uuid",
  "cached": false,
  "result": {
    "url": "https://example.com",
    "statusCode": 200,
    "responseTimeMs": 123,
    "contentLengthBytes": 559,
    "title": "Example Domain",
    "metaDescription": null,
    "viewportPresent": true,
    "canonicalPresent": false,
    "headers": {
      "contentType": "text/html",
      "server": "cloudflare",
      "xFrameOptions": null,
      "strictTransportSecurity": null
    },
    "auditedAt": "2026-07-25T10:00:00.000Z"
  }
}
```

**Error responses:**
| Status | Error | Meaning |
|---|---|---|
| 400 | `INVALID_URL` | Missing or malformed URL, or non-http(s) protocol |
| 429 | `RATE_LIMITED` | More than 20 requests/minute from this IP |
| 502 | `FETCH_FAILED` | Target URL could not be reached |
| 504 | `TIMEOUT` | Target URL took longer than 8 seconds to respond |

### `GET /health`
Returns `{ "status": "ok" }` — used to verify the service is running.

## Running locally
```bash
cd server
npm install
# create a .env file with DATABASE_URL, PORT, CACHE_TTL_SECONDS
npm run dev
```
Open `client/index.html` in a browser (or via a local server) — update `API_BASE` in the script if pointing at a different backend.

## Testing
```bash
cd server
npm test
```

## Known tradeoffs / next steps
- Rate limiting is per-server-instance (in-memory) — would move to a Redis-backed limiter for multi-instance deployments.
- HTML parsing uses targeted regex rather than a full DOM parser (e.g. cheerio) — sufficient for the current fixed set of checks, would swap if the audit scope grows.
- No scheduled cleanup job for expired cache rows yet — expired rows are simply skipped on read, not deleted.