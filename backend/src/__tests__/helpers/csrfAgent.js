// test/helpers/csrfAgent.js
import supertest from 'supertest';
import app from '../../app.js';

export const createCsrfAgent = () => {
  const agent = supertest.agent(app);

  const getCsrfToken = async () => {
    const res = await agent.get('/api/auth/csrf-token');
    if (!res.body?.csrfToken) throw new Error('CSRF token not found in JSON');
    return res.body.csrfToken;
  };

  // Resolves to a supertest Request object — caller must NOT await before chaining
  const buildCsrfRequest = async (method, url) => {
    const token = await getCsrfToken();
    // Return request configuration instead of executing
    return {
      method: method,
      url: url,
      token: token
    };
  };


  return { agent, getCsrfToken, buildCsrfRequest };
};