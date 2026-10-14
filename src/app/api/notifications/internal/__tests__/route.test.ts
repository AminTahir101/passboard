import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---- mock next/server ----
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

// ---- mock notify (hoisted so it is available before imports) ----
const { mockNotify } = vi.hoisted(() => ({ mockNotify: vi.fn() }))
vi.mock('@/lib/notifications/notify', () => ({
  notify: mockNotify,
}))

import { POST } from '../route'

const VALID_SECRET = 'test-secret-abc123'

function makeRequest(body: unknown, authHeader?: string): Request {
  return {
    headers: { get: (key: string) => (key === 'Authorization' ? (authHeader ?? null) : null) },
    json: async () => body,
  } as unknown as Request
}

describe('POST /api/notifications/internal', () => {
  const originalEnv = process.env.INTERNAL_NOTIFY_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.INTERNAL_NOTIFY_SECRET = VALID_SECRET
  })

  afterEach(() => {
    process.env.INTERNAL_NOTIFY_SECRET = originalEnv
  })

  it('returns 401 when INTERNAL_NOTIFY_SECRET is not set', async () => {
    delete process.env.INTERNAL_NOTIFY_SECRET
    const req = makeRequest({}, `Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req = makeRequest({})
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const req = makeRequest({}, 'Bearer wrong-secret')
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns 400 when userId is missing', async () => {
    const req = makeRequest(
      {
        type: 'case_lab_ready',
        title: { en: 'Ready', ar: 'جاهز' },
        body: { en: 'Done', ar: 'منتهي' },
      },
      `Bearer ${VALID_SECRET}`
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((res.body as { error: string }).error).toBe('Missing required fields')
  })

  it('returns 400 when type is missing', async () => {
    const req = makeRequest(
      {
        userId: 'user-1',
        title: { en: 'Ready', ar: 'جاهز' },
        body: { en: 'Done', ar: 'منتهي' },
      },
      `Bearer ${VALID_SECRET}`
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when title is missing', async () => {
    const req = makeRequest(
      {
        userId: 'user-1',
        type: 'case_lab_ready',
        body: { en: 'Done', ar: 'منتهي' },
      },
      `Bearer ${VALID_SECRET}`
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when body is missing', async () => {
    const req = makeRequest(
      {
        userId: 'user-1',
        type: 'case_lab_ready',
        title: { en: 'Ready', ar: 'جاهز' },
      },
      `Bearer ${VALID_SECRET}`
    )
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('calls notify and returns 200 on valid request', async () => {
    mockNotify.mockResolvedValue(undefined)
    const payload = {
      userId: 'user-1',
      type: 'case_lab_ready',
      title: { en: 'Case analysis ready', ar: 'تحليل الحالة جاهز' },
      body: {
        en: 'Your Case Lab analysis is complete. Tap to view the report.',
        ar: 'اكتمل تحليل حالتك. اضغط لعرض التقرير.',
      },
      metadata: { case_id: 'case-abc' },
    }
    const req = makeRequest(payload, `Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect((res.body as { success: boolean }).success).toBe(true)
    expect(mockNotify).toHaveBeenCalledOnce()
    expect(mockNotify).toHaveBeenCalledWith(payload)
  })

  it('calls notify without metadata when omitted', async () => {
    mockNotify.mockResolvedValue(undefined)
    const payload = {
      userId: 'user-1',
      type: 'case_lab_ready',
      title: { en: 'Ready', ar: 'جاهز' },
      body: { en: 'Done', ar: 'منتهي' },
    }
    const req = makeRequest(payload, `Bearer ${VALID_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockNotify).toHaveBeenCalledWith(payload)
  })
})
