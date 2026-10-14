import { ApnsClient, ApnsError, Notification } from 'apns2'
import { createAdminClient } from '@/lib/supabase/admin'

function buildClient(): ApnsClient {
  const key = Buffer.from(process.env.APNS_KEY!, 'base64').toString('utf8')
  return new ApnsClient({
    team: process.env.APNS_TEAM_ID!,
    keyId: process.env.APNS_KEY_ID!,
    signingKey: key,
    defaultTopic: process.env.APNS_BUNDLE_ID!,
    requestTimeout: 5000,
  })
}

export async function sendPush(
  userId: string,
  title: { en: string; ar: string },
  body: { en: string; ar: string },
  lang: string = 'en'
): Promise<void> {
  if (
    !process.env.APNS_KEY ||
    !process.env.APNS_KEY_ID ||
    !process.env.APNS_TEAM_ID ||
    !process.env.APNS_BUNDLE_ID
  ) {
    console.warn('[sendPush] APNs env vars not configured — skipping')
    return
  }

  const admin = createAdminClient()
  const { data: tokens } = await admin
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId)

  if (!tokens || tokens.length === 0) return

  const client = buildClient()

  for (const { token } of tokens as { token: string }[]) {
    try {
      const notification = new Notification(token, {
        alert: { title: lang === 'ar' ? title.ar : title.en, body: lang === 'ar' ? body.ar : body.en },
        badge: 1,
        sound: 'default',
      })
      await client.send(notification)
    } catch (e: unknown) {
      const err = e as ApnsError
      if (
        err.statusCode === 410 ||
        err.reason === 'DeviceTokenNotForTopic' ||
        err.reason === 'Unregistered'
      ) {
        // Token is no longer valid — remove it
        await admin.from('device_tokens').delete().eq('token', token)
        console.info('[sendPush] removed stale token:', token)
      } else {
        console.error('[sendPush] APNs error for token', token, e)
      }
    }
  }
}
