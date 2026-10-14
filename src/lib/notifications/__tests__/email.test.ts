import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null })
)

vi.mock('resend', () => ({
  Resend: function MockResend() {
    return { emails: { send: mockSend } }
  },
}))

import { sendEmail } from '../channels/email'

describe('sendEmail()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls Resend with the correct to address and from', async () => {
    await sendEmail(
      'student@example.com',
      'Ahmed',
      { en: 'Access Approved', ar: 'تمت الموافقة على وصولك' },
      { en: 'Your Passboard access is now active.', ar: 'وصولك إلى Passboard أصبح نشطاً.' }
    )
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@example.com',
        from: 'Passboard <notifications@passboard.ai>',
      })
    )
  })

  it('includes both EN and AR content in the HTML', async () => {
    await sendEmail(
      'student@example.com',
      null,
      { en: 'Exam in 7 days', ar: 'الاختبار بعد ٧ أيام' },
      { en: 'Keep going!', ar: 'استمر!' }
    )
    const call = mockSend.mock.calls[0][0]
    expect(call.html).toContain('Exam in 7 days')
    expect(call.html).toContain('الاختبار بعد ٧ أيام')
  })

  it('does not throw if Resend returns an error', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    await expect(
      sendEmail('bad@example.com', null, { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' })
    ).resolves.not.toThrow()
  })
})
