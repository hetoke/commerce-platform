import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../app.js'

describe('POST /api/uploads/image', () => {
  const agent = request.agent(app)

  beforeAll(async () => {
    await agent.post('/api/auth/login').send({ identifier: 'admin', password: 'admin123' })
  })

  it('returns 400 when image field is missing', async () => {
    const res = await agent.post('/api/uploads/image').field({}, {})
    expect(res.status).toBe(400)
  })

  it('returns 400 when no file is provided in multipart request', async () => {
    const res = await agent.post('/api/uploads/image')
    expect(res.status).toBe(400)
  })
})