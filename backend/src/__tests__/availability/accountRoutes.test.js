import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('PUT /api/account/update-username', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when newUsername is missing', async () => {
    const res = await request(app)
      .put('/api/account/update-username')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // missing newUsername
    expect(res.status).toBe(400);
  });

  it('returns 400 when newUsername is too short', async () => {
    const res = await request(app)
      .put('/api/account/update-username')
      .set('Authorization', `Bearer ${token}`)
      .send({ newUsername: 'ab' }); // less than 3 characters
    expect(res.status).toBe(400);
  });

  it('returns 400 when newUsername contains invalid characters', async () => {
    const res = await request(app)
      .put('/api/account/update-username')
      .set('Authorization', `Bearer ${token}`)
      .send({ newUsername: 'invalid@username' }); // contains @
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/account/change-password', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when currentPassword is missing', async () => {
    const res = await request(app)
      .put('/api/account/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ newPassword: 'NewPass123' }); // missing currentPassword
    expect(res.status).toBe(400);
  });

  it('returns 400 when newPassword is too short', async () => {
    const res = await request(app)
      .put('/api/account/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword', newPassword: 'short' }); // less than 8 characters
    expect(res.status).toBe(400);
  });

  it('returns 400 when newPassword lacks required character types', async () => {
    const res = await request(app)
      .put('/api/account/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'oldpassword', newPassword: 'weakpass' }); // no uppercase or number
    expect(res.status).toBe(400);
  });
});

describe('GET /api/account/profile', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app)
      .get('/api/account/profile');
    expect(res.status).toBe(401);
  });
});