import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import { testIds } from '../../scripts/seedData.js'

describe('POST /api/purchases', () => {
  const agent = request.agent(app)
  let validItemId

  beforeAll(async () => {
    validItemId = testIds.items[0]
    await agent.post('/api/auth/login').send({
      identifier: 'bob',
      password: 'customer123'
    })
  })

  it('returns 400 when itemId is missing', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ quantity: 1 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when itemId is not a string', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: 123, quantity: 1 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when itemId is not a valid MongoDB ObjectId', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: 'invalid-object-id', quantity: 1 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when quantity is missing', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: validItemId })

    expect(res.status).toBe(400)
  })

  it('returns 400 when quantity is not a number', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: validItemId, quantity: 'two' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when quantity is less than 1', async () => {
    const res = await agent
      .post('/api/purchases')
      .send({ itemId: validItemId, quantity: 0 })

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

  it('returns 404 when purchaseId is not provided', async () => {
    const res = await agent
      .delete('/api/purchases/')

    expect(res.status).toBe(404) // Express handles this as 404
  })

  it('returns 400 when purchaseId is not a valid MongoDB ObjectId', async () => {
    const res = await agent
      .delete('/api/purchases/not-a-valid-id')

    expect(res.status).toBe(400)
  })
})