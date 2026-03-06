import request from 'supertest';
import app from '../server.js';

describe('GET /api/purchases', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  // No validation errors possible for GET /api/purchases (no body or params required)
  // No explicit 500 case in swagger, so no 500 test needed
});

describe('POST /api/purchases', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
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
      .send({ itemId: 123 }); // itemId should be string
    expect(res.status).toBe(400);
  });

  // No explicit 500 case in swagger, so no 500 test needed
});

describe('DELETE /api/purchases/:purchaseId', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when purchaseId is not provided', async () => {
    const res = await request(app)
      .delete('/api/purchases/') // missing purchaseId in path
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('returns 400 when purchaseId is invalid format', async () => {
    const res = await request(app)
      .delete('/api/purchases/invalid-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  // No explicit 500 case in swagger, so no 500 test needed
});