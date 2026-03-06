import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('POST /api/uploads/image', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
    token = res.body.token;
  });

  it('returns 400 when no image file is provided', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .field('otherField', 'value');
    expect(res.status).toBe(400);
  });

  it('returns 400 when image field is missing in multipart form data', async () => {
    const res = await request(app)
      .post('/api/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('wrongFieldName', Buffer.from('fake image'), 'test.png');
    expect(res.status).toBe(400);
  });
});