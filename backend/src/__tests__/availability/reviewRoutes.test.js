import request from 'supertest';
import app from '../server.js';

describe('GET /api/items/:itemId/reviews', () => {
  it('returns 400 when itemId is invalid', async () => {
    const res = await request(app)
      .get('/api/items/invalid-id/reviews');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/items/:itemId/reviews', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when rating is missing', async () => {
    const res = await request(app)
      .post('/api/items/123/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ comment: 'Great item!' }); // missing rating
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is not a number', async () => {
    const res = await request(app)
      .post('/api/items/123/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 'five', comment: 'Great item!' }); // invalid rating type
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is out of range', async () => {
    const res = await request(app)
      .post('/api/items/123/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 6, comment: 'Too high!' }); // rating > 5
    expect(res.status).toBe(400);
  });
});