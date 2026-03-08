import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.js';

describe('Account routes with CSRF', () => {
  let csrfAgent;

  beforeAll(async () => {
    csrfAgent = createCsrfAgent();

    // Login first
    const res = await csrfAgent.agent
      .post('/api/auth/login')
      .send({ identifier: 'bob', password: 'customer123' });

    expect(res.status).toBeLessThan(400);
  });

  describe('PUT /api/account/update-username', () => {
    it('returns 400 when newUsername is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/update-username');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when newUsername is too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/update-username');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ newUsername: 'ab' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when newUsername is too long', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/update-username');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ newUsername: 'a'.repeat(31) });
      expect(res.status).toBe(400);
    });

    it('returns 400 when newUsername contains invalid characters', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/update-username');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ newUsername: 'abc def' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/account/change-password', () => {
    it('returns 400 when currentPassword is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/change-password');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ newPassword: 'NewPass123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when newPassword is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/change-password');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ currentPassword: 'customer123' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when newPassword is too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/account/change-password');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ currentPassword: 'customer123', newPassword: 'Short1' });
      expect(res.status).toBe(400);
    });
  });
});
