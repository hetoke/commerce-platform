import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('GET /api/items', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 500 when internal server error occurs', async () => {
    const res = await agent.get('/api/items')
    expect(res.status).toBe(500)
  })
})

describe('GET /api/items/:itemId', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when itemId is invalid', async () => {
    const res = await agent.get('/api/items/invalid-id!')
    expect(res.status).toBe(400)
  })

  it('returns 500 when internal server error occurs', async () => {
    const res = await agent.get('/api/items/123')
    expect(res.status).toBe(500)
  })
})

describe('POST /api/items', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' })
  })

  it('returns 400 when required field "name" is missing', async () => {
    const res = await agent
      .post('/api/items')
      .send({ description: 'test item' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when request body is malformed', async () => {
    const res = await agent
      .post('/api/items')
      .send(null)

    expect(res.status).toBe(400)
  })

  it('returns 500 when internal server error occurs', async () => {
    const res = await agent
      .post('/api/items')
      .send({ name: 'validName', description: 'validDescription' })

    expect(res.status).toBe(500)
  })
})

describe('PUT /api/items/:itemId', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' })
  })

  it('returns 400 when itemId is invalid', async () => {
    const res = await agent
      .put('/api/items/invalid-id!')
      .send({ name: 'updatedName' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when request body is empty', async () => {
    const res = await agent
      .put('/api/items/123')
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 500 when internal server error occurs', async () => {
    const res = await agent
      .put('/api/items/123')
      .send({ name: 'updatedName' })

    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/items/:itemId', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' })
  })

  it('returns 400 when itemId is invalid', async () => {
    const res = await agent.delete('/api/items/invalid-id!')
    expect(res.status).toBe(400)
  })

  it('returns 500 when internal server error occurs', async () => {
    const res = await agent.delete('/api/items/123')
    expect(res.status).toBe(500)
  })
})