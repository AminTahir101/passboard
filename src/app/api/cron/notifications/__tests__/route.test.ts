import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}))

// Mock all cron-check functions
vi.mock('@/lib/notifications/cron-checks', () => ({
  checkExamCountdown: vi.fn().mockResolvedValue(undefined),
  checkStudyPlanReminder: vi.fn().mockResolvedValue(undefined),
  checkAccessExpiring: vi.fn().mockResolvedValue(undefined),
  checkInactivity: vi.fn().mockResolvedValue(undefined),
  runCleanup: vi.fn().mockResolvedValue(undefined),
}))

import { POST } from '../route'
import {
  checkExamCountdown,
  checkStudyPlanReminder,
  checkAccessExpiring,
  checkInactivity,
  runCleanup,
} from '@/lib/notifications/cron-checks'

const CRON_SECRET = 'test-secret'

function makeRequest(authHeader?: string): Request {
  return {
    headers: {
      get: (key: string) => (key === 'Authorization' ? (authHeader ?? null) : null),
    },
  } as unknown as Request
}

describe('POST /api/cron/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', CRON_SECRET)
    // Re-set all mocks to resolved after clearAllMocks
    vi.mocked(checkExamCountdown).mockResolvedValue(undefined)
    vi.mocked(checkStudyPlanReminder).mockResolvedValue(undefined)
    vi.mocked(checkAccessExpiring).mockResolvedValue(undefined)
    vi.mocked(checkInactivity).mockResolvedValue(undefined)
    vi.mocked(runCleanup).mockResolvedValue(undefined)
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req = makeRequest()
    const res = await POST(req)
    expect(res.status).toBe(401)
    expect((res.body as { error: string }).error).toBe('Unauthorized')
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const req = makeRequest('Bearer wrong-secret')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when CRON_SECRET env var is not set', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const req = makeRequest(`Bearer ${CRON_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('calls all 5 cron checks on success', async () => {
    const req = makeRequest(`Bearer ${CRON_SECRET}`)
    await POST(req)
    expect(checkExamCountdown).toHaveBeenCalledOnce()
    expect(checkStudyPlanReminder).toHaveBeenCalledOnce()
    expect(checkAccessExpiring).toHaveBeenCalledOnce()
    expect(checkInactivity).toHaveBeenCalledOnce()
    expect(runCleanup).toHaveBeenCalledOnce()
  })

  it('returns 200 with results object when all checks succeed', async () => {
    const req = makeRequest(`Bearer ${CRON_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = res.body as { results: Record<string, string> }
    expect(body.results).toEqual({
      exam_countdown: 'ok',
      study_plan_reminder: 'ok',
      access_expiring: 'ok',
      inactivity: 'ok',
      cleanup: 'ok',
    })
  })

  it('records error message but continues when one check throws', async () => {
    vi.mocked(checkExamCountdown).mockRejectedValue(new Error('DB down'))
    const req = makeRequest(`Bearer ${CRON_SECRET}`)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = res.body as { results: Record<string, string> }
    expect(body.results.exam_countdown).toBe('DB down')
    // Other checks still ran
    expect(body.results.study_plan_reminder).toBe('ok')
    expect(body.results.inactivity).toBe('ok')
    expect(body.results.cleanup).toBe('ok')
  })

  it('records unknown error when check throws a non-Error value', async () => {
    vi.mocked(checkInactivity).mockRejectedValue('string error')
    const req = makeRequest(`Bearer ${CRON_SECRET}`)
    const res = await POST(req)
    const body = res.body as { results: Record<string, string> }
    expect(body.results.inactivity).toBe('unknown error')
  })
})
