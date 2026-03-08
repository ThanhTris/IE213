const request = require('supertest');
const app = require('../../backend/src/app');

describe('Health Check', () => {
  it('GET /health should return 200 with status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('API Root', () => {
  it('GET /api should return welcome message', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Welcome to IE213 API');
  });
});

describe('404 Handler', () => {
  it('GET /unknown should return 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toBe(404);
  });
});
