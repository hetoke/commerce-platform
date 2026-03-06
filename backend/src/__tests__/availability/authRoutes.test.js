import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('POST /api/auth/google', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when credential is missing', async () => {
    const res = await agent
      .post('/api/auth/google')
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 when credential is not a string', async () => {
    const res = await agent
      .post('/api/auth/google')
      .send({ credential: 12345 })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when identifier is missing', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when password is missing', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: 'testuser' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when identifier is not a string', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: 123, password: 'password123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when password is not a string', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: 'testuser', password: 123 })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/logout', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('always succeeds and does not validate input', async () => {
    const res = await agent
      .post('/api/auth/logout')
      .send({ invalidField: true })

    expect(res.status).toBe(200)
  })
})

describe('POST /api/auth/signup', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when email is missing', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when username is missing', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when password is missing', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'newuser',
        confirmPassword: 'password123'
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when confirmPassword is missing', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'newuser',
        password: 'password123'
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when email is invalid format', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        email: 'invalid-email',
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'password123'
      })

    expect(res.status).toBe(400)
  })

  it('returns 400 when password and confirmPassword do not match', async () => {
    const res = await agent
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        username: 'newuser',
        password: 'password123',
        confirmPassword: 'different123'
      })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/refresh', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 403 when no refresh token provided', async () => {
    const res = await agent
      .post('/api/auth/refresh')
      .send({})

    expect(res.status).toBe(403)
  })
})

describe('GET /api/auth/me', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')

    expect(res.status).toBe(401)
  })
})