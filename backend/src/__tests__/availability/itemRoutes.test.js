import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('GET /api/items/:itemId', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when itemId is invalid format', async () => {
    const res = await request(app)
      .get('/api/items/invalid-id!')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('returns 500 when unexpected error occurs during fetch', async () => {
    // Assuming a specific itemId that triggers internal error
    const res = await request(app)
      .get('/api/items/internal-error-trigger')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});

describe('POST /api/items', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // Missing all required fields
    expect(res.status).toBe(400);
  });

  it('returns 500 when unexpected error occurs during creation', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: "Test Item",
        description: "A test item"
      }); // Valid data but assume backend fails
    expect(res.status).toBe(500);
  });
});

describe('PUT /api/items/:itemId', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when itemId is not provided or invalid', async () => {
    const res = await request(app)
      .put('/api/items/')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when request body has validation errors', async () => {
    const res = await request(app)
      .put('/api/items/123')
      .set('Authorization', `Bearer ${token}`)
      .send({ invalidField: '' }); // Invalid field structure
    expect(res.status).toBe(400);
  });

  it('returns 500 when unexpected error occurs during update', async () => {
    const res = await request(app)
      .put('/api/items/error-trigger-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Valid Name' });
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/items/:itemId', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when itemId is missing', async () => {
    const res = await request(app)
      .delete('/api/items/')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it('returns 500 when unexpected error occurs during deletion', async () => {
    const res = await request(app)
      .delete('/api/items/error-trigger-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});