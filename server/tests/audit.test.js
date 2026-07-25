import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/audit', () => {
  it('rejects missing url', async () => {
    const res = await request(app).post('/api/audit').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_URL');
  });

  it('rejects invalid url', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_URL');
  });

  it('rejects non-http protocols', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'ftp://example.com' });
    expect(res.status).toBe(400);
  });

  it('returns a successful audit for a valid url', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'https://example.com' });
    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('statusCode');
    expect(res.body.result).toHaveProperty('title');
    expect(res.body).toHaveProperty('requestId');
  }, 15000); // longer timeout since this makes a real network call

  it('returns cached:true on second identical request', async () => {
    const first = await request(app).post('/api/audit').send({ url: 'https://example.com' });
    const second = await request(app).post('/api/audit').send({ url: 'https://example.com' });
    expect(second.body.cached).toBe(true);
  }, 15000);
});