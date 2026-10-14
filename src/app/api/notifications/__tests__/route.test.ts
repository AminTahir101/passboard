import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- mock next/server ----
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

// ---- shared mock state ----
let mockUser: { id: string } | null = { id: 'user-1' }

const mockUpdate = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockLimit = vi.fn()
const mockIs = vi.fn()
const mockIn = vi.fn()

function buildChain(leaf: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn(() => chain)
  chain.eq = vi.fn(() => chain)
  chain.order = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.is = vi.fn(() => chain)
  chain.in = vi.fn(() => chain)
  chain.update = vi.fn(() => chain)
  chain.then = (leaf as { then?: unknown })?.then
  // make it thenable with resolved value
  Object.assign(chain, leaf)
  return chain
}

const mockFromNotifications = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: vi.fn((table: string) => {
      if (table === 'notifications') return mockFromNotifications()
      return {}
    }),
  })),
}))

import { GET, PATCH } from '../route'

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const res = await GET()
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns notifications list on success', async () => {
    const fakeData = [{ id: 'n1', user_id: 'user-1', type: 'announcement', read_at: null }]
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: fakeData, error: null }),
    }
    mockFromNotifications.mockReturnValue(chain)

    const res = await GET()
    expect(res.status).toBe(200)
    expect((res.body as { notifications: unknown[] }).notifications).toEqual(fakeData)
  })

  it('returns 500 when DB returns an error', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }
    mockFromNotifications.mockReturnValue(chain)

    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const req = { json: async () => ({ all: true }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('marks all unread notifications as read when all=true', async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFromNotifications.mockReturnValue(updateChain)

    const req = { json: async () => ({ all: true }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ read_at: expect.any(String) })
    )
    expect(updateChain.is).toHaveBeenCalledWith('read_at', null)
  })

  it('marks specific notifications as read when ids provided', async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFromNotifications.mockReturnValue(updateChain)

    const req = { json: async () => ({ ids: ['n1', 'n2'] }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect(updateChain.in).toHaveBeenCalledWith('id', ['n1', 'n2'])
  })

  it('returns success without DB call when no ids and no all', async () => {
    mockFromNotifications.mockReturnValue({})

    const req = { json: async () => ({}) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
  })

  it('returns 500 when mark-all DB call fails', async () => {
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockResolvedValue({ error: { message: 'fail' } }),
    }
    mockFromNotifications.mockReturnValue(updateChain)

    const req = { json: async () => ({ all: true }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(500)
  })
})
