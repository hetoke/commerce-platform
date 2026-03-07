import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('PUT /api/account/update-username', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    const res = await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
    expect(res.status).toBeLessThan(400)
  })

  it('returns 400 when newUsername is missing', async () => {
    const res = await agent
      .put('/api/account/update-username')
      .send({})

    expect(res.status).toBe(400)
  })

  it('returns 400 when newUsername is too short', async () => {
    const res = await agent
      .put('/api/account/update-username')
      .send({ newUsername: 'ab' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newUsername is too long', async () => {
    const res = await agent
      .put('/api/account/update-username')
      .send({ newUsername: 'a'.repeat(31) })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newUsername contains invalid characters', async () => {
    const res = await agent
      .put('/api/account/update-username')
      .send({ newUsername: 'abc def' })

    expect(res.status).toBe(400)
  })
})

describe('PUT /api/account/change-password', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'bob', password: 'customer123' })
  })

  it('returns 400 when currentPassword is missing', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ newPassword: 'NewPass123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newPassword is missing', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ currentPassword: 'customer123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newPassword is too short', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ currentPassword: 'customer123', newPassword: 'Short1' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newPassword lacks uppercase letter', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ currentPassword: 'customer123', newPassword: 'newpass123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newPassword lacks lowercase letter', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ currentPassword: 'customer123', newPassword: 'NEWPASS123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 when newPassword lacks number', async () => {
    const res = await agent
      .put('/api/account/change-password')
      .send({ currentPassword: 'customer123', newPassword: 'NewPassword' })

    expect(res.status).toBe(400)
  })
})