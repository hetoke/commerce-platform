// tests/availability/itemRoutes.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.js';

describe('Item routes', () => {
  let csrfAgent;
  let agent; // Declare agent separately

  beforeAll(async () => {
    // Initialize CSRF-aware agent
    csrfAgent = createCsrfAgent();
    agent = csrfAgent.agent; // Assign agent here after csrfAgent is created
  });

  // -----------------------------
  // GET /api/items/:itemId
  // -----------------------------
  describe('GET /api/items/:itemId', () => {
    beforeAll(async () => {
      await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' });
    });

    it('returns 400 when itemId is invalid', async () => {
      const res = await agent.get('/api/items/invalid-id!');
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // POST /api/items
  // -----------------------------
  describe('POST /api/items', () => {
    beforeAll(async () => {
      await csrfAgent.agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' });
    });

    it('returns 400 when required field "name" is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/items');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ description: 'test item' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when request body is malformed', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/items');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // PUT /api/items/:itemId
  // -----------------------------
  describe('PUT /api/items/:itemId', () => {
    beforeAll(async () => {
      await csrfAgent.agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' });
    });

    it('returns 400 when itemId is invalid', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/items/invalid-id!');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ name: 'updatedName' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when request body is empty', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/items/123');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when name is too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/items/123');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ name: 'ab' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when price is negative', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/items/123');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ price: -5 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when location is too short', async () => {
      const config = await csrfAgent.buildCsrfRequest('put', '/api/items/123');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ location: 'a' });
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // DELETE /api/items/:itemId
  // -----------------------------
  describe('DELETE /api/items/:itemId', () => {
    beforeAll(async () => {
      await csrfAgent.agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' });
    });

    it('returns 400 when itemId is invalid', async () => {
      const config = await csrfAgent.buildCsrfRequest('delete', '/api/items/invalid-id!');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token);
      expect(res.status).toBe(400);
    });
  });
});
