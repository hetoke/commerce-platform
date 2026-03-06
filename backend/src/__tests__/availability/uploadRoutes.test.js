import request from 'supertest';
import app from '../server.js';

describe('POST /api/uploads/image', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when no image file is provided', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // missing image file
    expect(res.status).toBe(400);
  });

  it('returns 400 when image field is not a file', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .field('image', 'not-a-file'); // sending text instead of file
    expect(res.status).toBe(400);
  });
});