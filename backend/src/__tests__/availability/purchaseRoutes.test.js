import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('GET /api/purchases', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 500 when server error occurs', async () => {
    // Simulate internal server error by mocking the controller to throw
    // This requires the controller to be mocked accordingly in test setup
    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/purchases', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when itemId is missing', async () => {
    const res = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // missing itemId
    expect(res.status).toBe(400);
  });

  it('returns 400 when itemId is not a string', async () => {
    const res = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 123 }); // invalid type
    expect(res.status).toBe(400);
  });

  it('returns 500 when server error occurs during purchase creation', async () => {
    const res = await request(app)
      .post('/api/purchases')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemId: 'validItemId' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/purchases/:purchaseId', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when purchaseId is not provided', async () => {
    const res = await request(app)
      .delete('/api/purchases/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('returns 400 when purchaseId is invalid format', async () => {
    const res = await request(app)
      .delete('/api/purchases/invalid-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('returns 500 when server fails to cancel purchase', async () => {
    const res = await request(app)
      .delete('/api/purchases/validPurchaseId')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});