import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('GET /api/items/:itemId/reviews', () => {
  it('returns 400 when itemId is missing', async () => {
    const res = await request(app).get('/api/items//reviews')
    expect(res.status).toBe(400)
  })

  it('returns 400 when itemId is invalid', async () => {
    const res = await request(app).get('/api/items/invalid-id/reviews')
    expect(res.status).toBe(400)
  })
})

describe('POST /api/items/:itemId/reviews', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when itemId is missing', async () => {
    const res = await agent.post('/api/items//reviews').send({})
    expect(res.status).toBe(400)
  })

  it('returns 400 when rating is missing', async () => {
    const res = await agent.post('/api/items/item123/reviews').send({})
    expect(res.status).toBe(400)
  })

  it('returns 400 when rating is out of range', async () => {
    const res = await agent.post('/api/items/item123/reviews').send({ rating: 6 })
    expect(res.status).toBe(400)
  })

  it('returns 400 when rating is not a number', async () => {
    const res = await agent.post('/api/items/item123/reviews').send({ rating: 'five' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when comment is too long', async () => {
    const res = await agent
      .post('/api/items/item123/reviews')
      .send({ rating: 5, comment: 'a'.repeat(501) })
    expect(res.status).toBe(400)
  })
})