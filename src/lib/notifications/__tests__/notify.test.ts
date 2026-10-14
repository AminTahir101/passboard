import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'notification_preferences') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: () => mockSingle(),
        }
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { email: 'student@test.com', full_name: 'Ahmed' },
          }),
        }
      }
      if (table === 'notifications') {
        return { insert: mockInsert }
      }
      return {}
    }),
  })),
}))

vi.mock('../channels/email', () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../channels/push', () => ({ sendPush: vi.fn().mockResolvedValue(undefined) }))

import { notify, notifyMany } from '../notify'

describe('notify()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: { in_app: true, email: false, push: false } })
  })

  it('inserts a notification row when in_app pref is true', async () => {
    await notify({
      userId: 'user-1',
      type: 'access_approved',
      title: { en: 'Access approved', ar: 'تمت الموافقة' },
      body: { en: 'Your access is active', ar: 'وصولك نشط' },
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        type: 'access_approved',
        title_en: 'Access approved',
        title_ar: 'تمت الموافقة',
      })
    )
  })

  it('skips in-app insert when in_app pref is false', async () => {
    mockSingle.mockResolvedValue({ data: { in_app: false, email: false, push: false } })
    await notify({
      userId: 'user-1',
      type: 'access_approved',
      title: { en: 'T', ar: 'ت' },
      body: { en: 'B', ar: 'ب' },
    })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('defaults to all channels ON when no preference row exists', async () => {
    mockSingle.mockResolvedValue({ data: null })
    await notify({
      userId: 'user-1',
      type: 'inactivity',
      title: { en: 'T', ar: 'ت' },
      body: { en: 'B', ar: 'ب' },
    })
    expect(mockInsert).toHaveBeenCalled()
  })

  it('does not throw if in-app insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    await expect(
      notify({
        userId: 'user-1',
        type: 'access_approved',
        title: { en: 'T', ar: 'ت' },
        body: { en: 'B', ar: 'ب' },
      })
    ).resolves.not.toThrow()
  })
})

describe('notifyMany()', () => {
  it('resolves without throwing for multiple users', async () => {
    mockSingle.mockResolvedValue({ data: { in_app: true, email: false, push: false } })
    await expect(
      notifyMany(['user-1', 'user-2'], {
        type: 'exam_countdown',
        title: { en: 'Exam soon', ar: 'الاختبار قريب' },
        body: { en: '7 days left', ar: '٧ أيام متبقية' },
      })
    ).resolves.not.toThrow()
  })
})
