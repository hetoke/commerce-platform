import { describe, it, expect, beforeAll } from 'vitest';
import { createCsrfAgent } from '../helpers/csrfAgent.ts';

describe('POST /api/uploads/image', () => {
  let csrfAgent;

  beforeAll(async () => {
    csrfAgent = createCsrfAgent();
    await csrfAgent.agent.post('/api/auth/login').send({
      identifier: 'admin',
      password: 'admin123'
    });
  });

  it('returns 400 when image field is missing', async () => {
    const config = await csrfAgent.buildCsrfRequest('post', '/api/uploads/image');
    const res = await csrfAgent.agent[config.method](config.url)
      .set('X-CSRF-Token', config.token)
      .field('dummy', 'value');
    expect(res.status).toBe(400);
  });

  it('returns 400 when no file is provided in multipart request', async () => {
    const config = await csrfAgent.buildCsrfRequest('post', '/api/uploads/image');
    const res = await csrfAgent.agent[config.method](config.url)
      .set('X-CSRF-Token', config.token)
      .send(); // This sends the request with no body
    expect(res.status).toBe(400);
  });
});
