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
let mockUser: { id: string } | null = { id: 'admin-1' }
let mockProfileRole: string | null = 'admin'

// ---- notifyMany mock ----
const mockNotifyMany = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/notifications/notify', () => ({
  notifyMany: (...args: unknown[]) => mockNotifyMany(...args),
}))

// ---- Supabase server mock (user auth + admin role check) ----
const mockServerFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser } })),
    },
    from: mockServerFrom,
  })),
}))

// ---- Supabase admin mock ----
let mockInsertReturn: { data: { id: string } | null; error: { message: string } | null } = {
  data: { id: 'ann-1' },
  error: null,
}
let mockProfilesReturn: { data: { id: string }[] | null } = { data: [{ id: 'user-1' }, { id: 'user-2' }] }

const mockAdminUpdate = vi.fn().mockReturnThis()
const mockAdminUpdateEq = vi.fn().mockResolvedValue({ error: null })

const mockAdminFrom = vi.fn((table: string) => {
  if (table === 'announcements') {
    return {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(mockInsertReturn),
      update: vi.fn(() => ({ eq: mockAdminUpdateEq })),
    }
  }
  if (table === 'profiles') {
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      // Final `.eq()` in chain resolves the query
      // We need chained eq().eq() → resolved value
      // Build a chain that eventually resolves
      then: undefined,
    }
  }
  return {}
})

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

import { POST } from '../route'

// Helper to build a valid body
function validBody(overrides: Record<string, unknown> = {}) {
  return {
    title_en: 'Test Title',
    title_ar: 'عنوان تجريبي',
    body_en: 'Test body text',
    body_ar: 'نص الاختبار',
    target_type: 'all',
    ...overrides,
  }
}

function makeRequest(body: unknown) {
  return { json: async () => body } as Request
}

describe('POST /api/admin/announcements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser = { id: 'admin-1' }
    mockProfileRole = 'admin'
    mockNotifyMany.mockResolvedValue(undefined)
    mockInsertReturn = { data: { id: 'ann-1' }, error: null }
    mockProfilesReturn = { data: [{ id: 'user-1' }, { id: 'user-2' }] }

    // Set up server from mock: profiles select for role check
    mockServerFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { role: mockProfileRole } }),
        }
      }
      return {}
    })

    // Set up admin from mock with proper chaining
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'announcements') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(mockInsertReturn),
          update: vi.fn(() => ({ eq: mockAdminUpdateEq })),
        }
      }
      if (table === 'profiles') {
        // Build a chainable object where repeated .eq() calls work
        // and the last call resolves via Promise
        const chain: Record<string, unknown> = {}
        const eqFn = vi.fn(() => chain)
        chain.select = vi.fn(() => chain)
        chain.eq = eqFn
        // Make it thenable so await works
        Object.assign(chain, Promise.resolve(mockProfilesReturn))
        // Override then/catch/finally to return resolved value
        chain.then = (resolve: (v: typeof mockProfilesReturn) => unknown) =>
          Promise.resolve(mockProfilesReturn).then(resolve)
        chain.catch = () => chain
        return chain
      }
      return {}
    })
  })

  // ---- Auth checks ----
  it('returns 401 when not authenticated', async () => {
    mockUser = null
    const res = await POST(makeRequest(validBody()))
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns 401 when user is not admin', async () => {
    mockProfileRole = 'student'
    mockServerFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { role: 'student' } }),
        }
      }
      return {}
    })
    const res = await POST(makeRequest(validBody()))
    expect(res.status).toBe(401)
  })

  // ---- Validation checks ----
  it('returns 400 when title_en is missing', async () => {
    const res = await POST(makeRequest(validBody({ title_en: '' })))
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toContain('title_en')
  })

  it('returns 400 when target_type is invalid', async () => {
    const res = await POST(makeRequest(validBody({ target_type: 'unknown' })))
    expect(res.status).toBe(400)
  })

  it('returns 400 when target_type=exam and no target_exam provided', async () => {
    const res = await POST(makeRequest(validBody({ target_type: 'exam' })))
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toContain('target_exam')
  })

  it('returns 400 when target_type=individual and no target_user_ids provided', async () => {
    const res = await POST(makeRequest(validBody({ target_type: 'individual' })))
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toContain('target_user_ids')
  })

  // ---- DB error handling ----
  it('returns 500 when insert fails', async () => {
    mockInsertReturn = { data: null, error: { message: 'DB write failed' } }
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'announcements') {
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(mockInsertReturn),
        }
      }
      return {}
    })
    const res = await POST(makeRequest(validBody()))
    expect(res.status).toBe(500)
    expect((res.body as { error: string }).error).toBe('DB write failed')
  })

  // ---- Success: target_type=all ----
  it('returns 201 with success for target_type=all', async () => {
    const res = await POST(makeRequest(validBody({ target_type: 'all' })))
    expect(res.status).toBe(201)
    const body = res.body as { success: boolean; announcement_id: string; recipient_count: number }
    expect(body.success).toBe(true)
    expect(body.announcement_id).toBe('ann-1')
    expect(typeof body.recipient_count).toBe('number')
  })

  // ---- Success: target_type=individual ----
  it('returns 201 with exact recipient_count for target_type=individual', async () => {
    const res = await POST(
      makeRequest(
        validBody({
          target_type: 'individual',
          target_user_ids: ['uid-1', 'uid-2', 'uid-3'],
        })
      )
    )
    expect(res.status).toBe(201)
    const body = res.body as { success: boolean; announcement_id: string; recipient_count: number }
    expect(body.success).toBe(true)
    expect(body.recipient_count).toBe(3)
  })

  // ---- Success: target_type=exam ----
  it('returns 201 for target_type=exam with target_exam set', async () => {
    const res = await POST(
      makeRequest(
        validBody({
          target_type: 'exam',
          target_exam: 'USMLE',
        })
      )
    )
    expect(res.status).toBe(201)
    const body = res.body as { success: boolean; announcement_id: string; recipient_count: number }
    expect(body.success).toBe(true)
  })

  // ---- notifyMany is called (fire-and-forget) ----
  it('calls notifyMany with the correct notification type', async () => {
    // Give notifyMany time to be invoked (fire-and-forget)
    await POST(makeRequest(validBody({ target_type: 'individual', target_user_ids: ['u1'] })))
    // Allow microtask queue to flush
    await Promise.resolve()
    expect(mockNotifyMany).toHaveBeenCalledWith(
      ['u1'],
      expect.objectContaining({ type: 'announcement' })
    )
  })
})
