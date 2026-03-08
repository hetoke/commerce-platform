// tests/availability/authRoutes.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.js';

describe('Auth routes', () => {
  let csrfAgent;

  beforeAll(async () => {
    // Initialize CSRF-aware agent
    csrfAgent = createCsrfAgent();

    // Login first (no CSRF required)
    const res = await csrfAgent.agent
      .post('/api/auth/login')
      .send({ identifier: 'bob', password: 'customer123' });
    expect(res.status).toBeLessThan(400);
  });

  // -----------------------------
  // LOGOUT
  // -----------------------------
  describe('POST /api/auth/logout', () => {
    it('always succeeds and ignores invalid fields', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/logout');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ invalidField: true });
      expect(res.status).toBe(200);
    });
  });

  // -----------------------------
  // SIGNUP
  // -----------------------------
  describe('POST /api/auth/signup', () => {
    it('returns 400 when email is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ username: 'newuser', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when username is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', username: 'newuser' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when email format is invalid', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'invalid-email', username: 'newuser', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when username too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', username: 'ab', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', username: 'newuser', password: '123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when email is not a string', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 123, username: 'newuser', password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when username is not a string', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', username: 123, password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is not a string', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/signup');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ email: 'test@example.com', username: 'newuser', password: 123 });
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // GOOGLE LOGIN
  // -----------------------------
  describe('POST /api/auth/google', () => {
    it('returns 401 when credential is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/google');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(401);
    });

    it('returns 401 when credential is not a string', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/auth/google');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ credential: 12345 });
      expect(res.status).toBe(401);
    });
  });

  // -----------------------------
  // LOGIN (no CSRF)
  // -----------------------------
  describe('POST /api/auth/login', () => {
    it('returns 400 when identifier is missing', async () => {
      const res = await csrfAgent.agent
        .post('/api/auth/login')
        .send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is missing', async () => {
      const res = await csrfAgent.agent
        .post('/api/auth/login')
        .send({ identifier: 'testuser' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when identifier is not a string', async () => {
      const res = await csrfAgent.agent
        .post('/api/auth/login')
        .send({ identifier: 123, password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when password is not a string', async () => {
      const res = await csrfAgent.agent
        .post('/api/auth/login')
        .send({ identifier: 'testuser', password: 123 });
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // REFRESH
  // -----------------------------
  describe('POST /api/auth/refresh', () => {
    it('returns 403 when no refresh token provided', async () => {
      const res = await csrfAgent.agent
        .post('/api/auth/refresh')
        .send({});
      expect(res.status).toBe(403);
    });
  });

  // -----------------------------
  // ME
  // -----------------------------
  describe('GET /api/auth/me', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await csrfAgent.agent
        .get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
