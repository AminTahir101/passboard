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

const mockAdminInsert = vi.fn().mockResolvedValue({ error: null })
const mockFromPreferences = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: vi.fn((table: string) => {
      if (table === 'notification_preferences') return mockFromPreferences()
      return {}
    }),
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockAdminInsert })),
  })),
}))

import { GET, PATCH } from '../route'

describe('GET /api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
    mockAdminInsert.mockResolvedValue({ error: null })
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns existing preferences and seeds missing ones', async () => {
    // First call: select existing (returns partial list)
    const existingRows = [{ type: 'announcement', user_id: 'user-1' }]
    // Second call: select all after upsert
    const allRows = [
      { type: 'access_approved' },
      { type: 'access_expiring' },
      { type: 'announcement' },
      { type: 'case_lab_ready' },
      { type: 'exam_countdown' },
      { type: 'inactivity' },
      { type: 'mock_exam_result' },
      { type: 'study_plan_reminder' },
    ]

    let callCount = 0
    mockFromPreferences.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call returns only existing
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: existingRows, error: null }),
        }
      }
      // Second call returns all 8
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: allRows, error: null }),
      }
    })

    const res = await GET()
    expect(res.status).toBe(200)
    expect((res.body as { preferences: unknown[] }).preferences).toHaveLength(8)
    // Admin insert was called to seed missing types
    expect(mockAdminInsert).toHaveBeenCalled()
  })

  it('does not call admin insert when all types already exist', async () => {
    const allTypes = [
      'exam_countdown', 'study_plan_reminder', 'access_expiring', 'inactivity',
      'mock_exam_result', 'case_lab_ready', 'announcement', 'access_approved',
    ]
    const existingRows = allTypes.map((t) => ({ type: t, user_id: 'user-1' }))

    let callCount = 0
    mockFromPreferences.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: existingRows, error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: existingRows, error: null }),
      }
    })

    await GET()
    expect(mockAdminInsert).not.toHaveBeenCalled()
  })

  it('returns 500 when final select fails', async () => {
    mockFromPreferences.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
    }))

    // Make the first call return empty so no insert is needed
    let callCount = 0
    mockFromPreferences.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }),
      }
    })

    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('PATCH /api/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'user-1' }
  })

  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const req = { json: async () => ({ type: 'announcement', in_app: false }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when type is missing', async () => {
    mockFromPreferences.mockReturnValue({})
    const req = { json: async () => ({ in_app: false }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(400)
  })

  it('upserts preference and returns success', async () => {
    const upsertChain = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }
    mockFromPreferences.mockReturnValue(upsertChain)

    const req = { json: async () => ({ type: 'announcement', in_app: false, push: true }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
    expect(upsertChain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        type: 'announcement',
        in_app: false,
        push: true,
      })
    )
  })

  it('returns 500 when upsert fails', async () => {
    mockFromPreferences.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: 'fail' } }),
    })
    const req = { json: async () => ({ type: 'announcement' }) } as Request
    const res = await PATCH(req)
    expect(res.status).toBe(500)
  })
})
