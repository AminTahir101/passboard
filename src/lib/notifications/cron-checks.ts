import { createAdminClient } from '@/lib/supabase/admin'
import { notifyMany } from './notify'

function dateInDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

function isoAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export async function checkExamCountdown(): Promise<void> {
  const admin = createAdminClient()

  for (const days of [1, 7, 30]) {
    const target = dateInDays(days)
    const { data, error } = await admin
      .from('profiles')
      .select('id')
      .eq('access_status', 'active')
      .eq('exam_date', target)

    if (error) {
      console.error('[cron] exam_countdown error:', error.message)
      continue
    }
    if (!data || data.length === 0) continue

    await notifyMany(
      data.map((u: { id: string }) => u.id),
      {
        type: 'exam_countdown',
        title: {
          en: `${days} day${days !== 1 ? 's' : ''} until your exam`,
          ar: `${days} ${days === 1 ? 'يوم' : 'أيام'} حتى اختبارك`,
        },
        body: {
          en: "Keep going — you're getting closer every day.",
          ar: 'استمر — أنت تقترب كل يوم.',
        },
        metadata: { days_left: days },
      }
    )
  }
}

export async function checkStudyPlanReminder(): Promise<void> {
  const admin = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await admin
    .from('study_tasks')
    .select('user_id')
    .eq('scheduled_date', today)
    .eq('completed', false)

  if (error) {
    console.error('[cron] study_plan_reminder error:', error.message)
    return
  }
  if (!data || data.length === 0) return

  const userIds = [...new Set(data.map((r: { user_id: string }) => r.user_id))]

  await notifyMany(userIds, {
    type: 'study_plan_reminder',
    title: { en: 'Study session due today', ar: 'جلسة دراسة مستحقة اليوم' },
    body: {
      en: 'You have study tasks scheduled for today. Open Passboard to complete them.',
      ar: 'لديك مهام دراسية مجدولة لليوم. افتح Passboard لإتمامها.',
    },
  })
}

export async function checkAccessExpiring(): Promise<void> {
  const admin = createAdminClient()
  const target = dateInDays(7)
  const dayStart = `${target}T00:00:00.000Z`
  const dayEnd = `${target}T23:59:59.999Z`

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('access_status', 'active')
    .gte('access_expires_at', dayStart)
    .lte('access_expires_at', dayEnd)

  if (error) {
    console.error('[cron] access_expiring error:', error.message)
    return
  }
  if (!data || data.length === 0) return

  await notifyMany(
    data.map((u: { id: string }) => u.id),
    {
      type: 'access_expiring',
      title: { en: 'Your access expires in 7 days', ar: 'وصولك ينتهي خلال ٧ أيام' },
      body: {
        en: 'Renew your access to keep studying without interruption.',
        ar: 'جدد وصولك لمواصلة الدراسة دون انقطاع.',
      },
    }
  )
}

export async function checkInactivity(): Promise<void> {
  const admin = createAdminClient()
  const cutoff = isoAgo(3)

  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('access_status', 'active')
    .or(`last_active_at.is.null,last_active_at.lt.${cutoff}`)

  if (error) {
    console.error('[cron] inactivity error:', error.message)
    return
  }
  if (!data || data.length === 0) return

  await notifyMany(
    data.map((u: { id: string }) => u.id),
    {
      type: 'inactivity',
      title: { en: "You haven't practiced in 3 days", ar: 'لم تتدرب منذ ٣ أيام' },
      body: {
        en: 'A short session keeps your momentum going. Open Passboard.',
        ar: 'جلسة قصيرة تحافظ على زخمك. افتح Passboard.',
      },
    }
  )
}

export async function runCleanup(): Promise<void> {
  const admin = createAdminClient()
  const cutoff = isoAgo(90)
  const { error } = await admin
    .from('notifications')
    .delete()
    .lt('created_at', cutoff)
  if (error) console.error('[cron] cleanup error:', error.message)
}
