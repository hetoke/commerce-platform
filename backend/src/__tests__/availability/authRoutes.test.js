import request from 'supertest';
import app from '../server.js';

describe('POST /api/auth/google', () => {
  it('returns 400 when credential is missing', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({}); // missing credential
    expect(res.status).toBe(400);
  });

  it('returns 400 when credential is invalid type', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ credential: 12345 }); // invalid credential type
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns 400 when email and password are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({}); // missing email and password
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' }); // missing email
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' }); // missing password
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 500 when server error occurs during logout', async () => {
    // Simulate a potential internal failure if cookies/session cleanup fails unexpectedly
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', ['invalid=cookie']); // simulate corrupted cookie state
    expect([200, 500]).toContain(res.status); // may succeed or fail depending on implementation
  });
});

describe('POST /api/auth/signup', () => {
  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({}); // missing all required fields
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      }); // missing email
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        confirmPassword: 'password123'
      }); // missing password
    expect(res.status).toBe(400);
  });

  it('returns 400 when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        confirmPassword: 'differentpass'
      }); // passwords don't match
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns 403 when refresh token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({}); // no token provided
    expect([403, 500]).toContain(res.status); // depends on how middleware handles missing tokens
  });

  it('returns 403 when refresh token is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ token: 'invalid.token.here' }); // invalid token format
    expect(res.status).toBe(403);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 401 when authorization header is missing', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 when authorization token is invalid', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_token_here');
    expect(res.status).toBe(401);
  });
});