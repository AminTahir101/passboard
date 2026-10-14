import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApnsSend = vi.fn().mockResolvedValue(undefined)
vi.mock('apns2', () => ({
  ApnsClient: function MockApnsClient() {
    return { send: mockApnsSend }
  },
  Notification: function MockNotification(token: string, opts: unknown) {
    return { token, ...(opts as object) }
  },
  ApnsError: class MockApnsError extends Error {
    statusCode: number
    constructor(props: { statusCode: number }) {
      super()
      this.statusCode = props.statusCode
    }
  },
}))

const mockTokenQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: [{ token: 'device-token-abc' }], error: null }),
}
const mockDeleteQuery = {
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ error: null }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'device_tokens') return mockTokenQuery
      return mockDeleteQuery
    }),
  })),
}))

import { sendPush } from '../channels/push'

describe('sendPush()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.APNS_KEY = Buffer.from('fake-key').toString('base64')
    process.env.APNS_KEY_ID = 'KEYID12345'
    process.env.APNS_TEAM_ID = 'TEAMID12345'
    process.env.APNS_BUNDLE_ID = 'ai.passboard.app'
    mockTokenQuery.eq.mockResolvedValue({ data: [{ token: 'device-token-abc' }], error: null })
  })

  it('calls APNs send for each device token', async () => {
    await sendPush(
      'user-1',
      { en: 'Exam in 7 days', ar: 'الاختبار بعد ٧ أيام' },
      { en: 'Keep going!', ar: 'استمر!' },
      'en'
    )
    expect(mockApnsSend).toHaveBeenCalledTimes(1)
  })

  it('does not throw when no device tokens exist', async () => {
    mockTokenQuery.eq.mockResolvedValueOnce({ data: [], error: null })
    await expect(
      sendPush('user-no-device', { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' }, 'en')
    ).resolves.not.toThrow()
  })

  it('skips silently when APNs env vars are not configured', async () => {
    delete process.env.APNS_KEY
    await expect(
      sendPush('user-1', { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' }, 'en')
    ).resolves.not.toThrow()
    expect(mockApnsSend).not.toHaveBeenCalled()
  })
})
