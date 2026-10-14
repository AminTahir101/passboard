import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

let mockUser: { id: string } | null = { id: 'user-1' }

const mockFromDeviceTokens = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: vi.fn((table: string) => {
      if (table === 'device_tokens') return mockFromDeviceTokens()
      return {}
    }),
  })),
}))

import { POST, DELETE } from '../route'

describe('POST /api/device-tokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const req = { json: async () => ({ token: 'abc' }) } as Request
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when token is missing', async () => {
    mockFromDeviceTokens.mockReturnValue({})
    const req = { json: async () => ({}) } as Request
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toBe('token required')
  })

  it('upserts token and returns success', async () => {
    const upsertChain = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFromDeviceTokens.mockReturnValue(upsertChain)

    const req = { json: async () => ({ token: 'device-token-xyz' }) } as Request
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
    expect(upsertChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        token: 'device-token-xyz',
        last_seen_at: expect.any(String),
      })
    )
  })

  it('returns 500 when upsert fails', async () => {
    mockFromDeviceTokens.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: 'fail' } }),
    })
    const req = { json: async () => ({ token: 'abc' }) } as Request
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})

describe('DELETE /api/device-tokens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const req = { json: async () => ({ token: 'abc' }) } as Request
    const res = await DELETE(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when token is missing', async () => {
    mockFromDeviceTokens.mockReturnValue({})
    const req = { json: async () => ({}) } as Request
    const res = await DELETE(req)
    expect(res.status).toBe(400)
  })

  it('deletes token and returns success', async () => {
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    // Last .eq() call should resolve
    let eqCount = 0
    deleteChain.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) return Promise.resolve({ error: null })
      return deleteChain
    })
    mockFromDeviceTokens.mockReturnValue(deleteChain)

    const req = { json: async () => ({ token: 'device-token-xyz' }) } as Request
    const res = await DELETE(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
  })

  it('returns 500 when delete fails', async () => {
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    }
    let eqCount = 0
    deleteChain.eq = vi.fn().mockImplementation(() => {
      eqCount++
      if (eqCount >= 2) return Promise.resolve({ error: { message: 'fail' } })
      return deleteChain
    })
    mockFromDeviceTokens.mockReturnValue(deleteChain)

    const req = { json: async () => ({ token: 'abc' }) } as Request
    const res = await DELETE(req)
    expect(res.status).toBe(500)
  })
})
