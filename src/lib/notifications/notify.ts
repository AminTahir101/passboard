import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from './channels/email'
import { sendPush } from './channels/push'
import type { NotifyOptions } from './types'

export async function notify(options: NotifyOptions): Promise<void> {
  const { userId, type, title, body, metadata } = options
  const admin = createAdminClient()

  const [prefResult, profileResult] = await Promise.all([
    admin
      .from('notification_preferences')
      .select('in_app, email, push')
      .eq('user_id', userId)
      .eq('type', type)
      .single(),
    admin
      .from('profiles')
      .select('email, full_name, preferred_lang')
      .eq('id', userId)
      .single(),
  ])

  const inApp = prefResult.data?.in_app ?? true
  const emailPref = prefResult.data?.email ?? true
  const pushPref = prefResult.data?.push ?? true
  const profile = profileResult.data

  await Promise.allSettled([
    inApp
      ? admin
          .from('notifications')
          .insert({
            user_id: userId,
            type,
            title_en: title.en,
            title_ar: title.ar,
            body_en: body.en,
            body_ar: body.ar,
            metadata: metadata ?? null,
          })
          .then(({ error }: { error: { message: string } | null }) => {
            if (error) console.error('[notify] in-app write failed:', error.message)
          })
      : Promise.resolve(),
    emailPref && profile?.email
      ? sendEmail(profile.email, profile.full_name ?? null, title, body).catch((e: unknown) =>
          console.error('[notify] email failed:', e)
        )
      : Promise.resolve(),
    pushPref
      ? sendPush(userId, title, body, profile?.preferred_lang ?? 'en').catch((e: unknown) =>
          console.error('[notify] push failed:', e)
        )
      : Promise.resolve(),
  ])
}

export async function notifyMany(
  userIds: string[],
  options: Omit<NotifyOptions, 'userId'>
): Promise<void> {
  for (const userId of userIds) {
    await notify({ ...options, userId })
    await new Promise((r) => setTimeout(r, 50))
  }
}
