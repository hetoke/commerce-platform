import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.js';
import { testIds } from '../../scripts/seedData.js';
import request from 'supertest';
import app from '../../app.js';

describe('Item reviews', () => {
  // -----------------------------
  // GET /api/items/:itemId/reviews
  // -----------------------------
  describe('GET /api/items/:itemId/reviews', () => {
    it('returns 404 when itemId is missing', async () => {
      const res = await request(app).get('/api/items//reviews');
      expect(res.status).toBe(404);
    });

    it('returns 400 when itemId is invalid', async () => {
      const res = await request(app).get('/api/items/invalid-id/reviews');
      expect(res.status).toBe(400);
    });
  });

  // -----------------------------
  // POST /api/items/:itemId/reviews
  // -----------------------------
  describe('POST /api/items/:itemId/reviews', () => {
    let csrfAgent;
    let validItemId;

    beforeAll(async () => {
      csrfAgent = createCsrfAgent();

      // pick a valid item ID from seeded test data
      validItemId = testIds.items[0];

      // login with CSRF-aware agent
      await csrfAgent.agent.post('/api/auth/login').send({
        identifier: 'bob',
        password: 'customer123'
      });
    });

    it('returns 404 when itemId is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', '/api/items//reviews');
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(404);
    });

    it('returns 400 when rating is missing', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', `/api/items/${validItemId}/reviews`);
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({});
      expect(res.status).toBe(400);
    });

    it('returns 400 when rating is out of range', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', `/api/items/${validItemId}/reviews`);
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ rating: 6 });
      expect(res.status).toBe(400);
    });

    it('returns 400 when rating is not a number', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', `/api/items/${validItemId}/reviews`);
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ rating: 'five' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when comment is too long', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', `/api/items/${validItemId}/reviews`);
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({
          rating: 5,
          comment: 'a'.repeat(501)
        });
      expect(res.status).toBe(400);
    });

    it('returns 400 when itemId is not a valid Mongo ID', async () => {
      const config = await csrfAgent.buildCsrfRequest('post', `/api/items/invalid-id/reviews`);
      const res = await csrfAgent.agent[config.method](config.url)
        .set('X-CSRF-Token', config.token)
        .send({ rating: 3 });
      expect(res.status).toBe(400);
    });
  });
});
