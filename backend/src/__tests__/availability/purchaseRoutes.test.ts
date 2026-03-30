// tests/availability/purchaseRoutes.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.ts';
import { testIds } from '../../scripts/seedData.ts';

describe('Purchase routes', () => {
  let csrfAgent;
  let validItemId;

  beforeAll(async () => {
    csrfAgent = createCsrfAgent();
    validItemId = testIds.items[0];

    // Login once for the agent
    await csrfAgent.agent.post('/api/auth/login').send({
      identifier: 'bob',
      password: 'customer123'
    });
  });

  // -----------------------------
  // POST /api/purchases
  // -----------------------------
  describe('POST /api/purchases', () => {
    it('returns 400 when itemId is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ quantity: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when itemId is not a string', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ itemId: 123, quantity: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when itemId is not a valid MongoDB ObjectId', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ itemId: 'invalid-object-id', quantity: 1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ itemId: validItemId });
      expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is not a number', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ itemId: validItemId, quantity: 'two' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when quantity is less than 1', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/purchases');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ itemId: validItemId, quantity: 0 });
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // DELETE /api/purchases/:purchaseId
  // -----------------------------
  describe('DELETE /api/purchases/:purchaseId', () => {
    it('returns 400 when purchaseId is invalid format', async () => {
      const config = await csrfAgent.buildCsrfRequest('delete', '/api/purchases/invalid-id!');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token);
      expect(res.status).toBe(400);
    });

    it('returns 404 when purchaseId is not provided', async () => {
      // Express treats missing param as 404
      const res = await csrfAgent.agent.delete('/api/purchases/');
      expect(res.status).toBe(404);
    });

    it('returns 400 when purchaseId is not a valid MongoDB ObjectId', async () => {
      const config = await csrfAgent.buildCsrfRequest('delete', '/api/purchases/not-a-valid-id');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token);
      expect(res.status).toBe(400);
    });
  });
});
