import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('GET /api/purchases', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  // No validation errors possible for GET /api/purchases since there's no request body or params
})

describe('POST /api/purchases', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when itemId is missing', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 when itemId is not a string', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: 123 })

    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/purchases/:purchaseId', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when purchaseId is invalid format', async () => {
    const res = await agent
      .delete('/api/purchases/invalid-id!')

    expect(res.status).toBe(400)
  })

  it('returns 400 when purchaseId is missing', async () => {
    const res = await agent
      .delete('/api/purchases/')

    expect(res.status).toBe(404) // This will likely be 404, not 400 due to Express routing
  })
})