// test/helpers/csrfAgent.js
import supertest from 'supertest';
import app from '../../app.ts';

export const createCsrfAgent = () => {
  const agent = supertest.agent(app);
  let cachedToken = null;

  const getCsrfToken = async () => {
    if (cachedToken) return cachedToken;
    const res = await agent.get('/api/auth/csrf-token');
    if (!res.body?.csrfToken) throw new Error('CSRF token not found in JSON');
    cachedToken = res.body.csrfToken;
    return cachedToken;
  };

  const buildCsrfRequest = async (method, url) => {
    const token = await getCsrfToken();
    return { method, url, token };
  };

  const resetToken = () => { cachedToken = null; };

  return { agent, getCsrfToken, buildCsrfRequest, resetToken };
};