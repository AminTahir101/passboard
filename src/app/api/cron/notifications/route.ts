import { NextResponse } from 'next/server'
import {
  checkExamCountdown,
  checkStudyPlanReminder,
  checkAccessExpiring,
  checkInactivity,
  runCleanup,
} from '@/lib/notifications/cron-checks'

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('Authorization')

  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, 'ok' | string> = {}

  for (const [name, fn] of [
    ['exam_countdown', checkExamCountdown],
    ['study_plan_reminder', checkStudyPlanReminder],
    ['access_expiring', checkAccessExpiring],
    ['inactivity', checkInactivity],
    ['cleanup', runCleanup],
  ] as [string, () => Promise<void>][]) {
    try {
      await fn()
      results[name] = 'ok'
    } catch (e) {
      results[name] = e instanceof Error ? e.message : 'unknown error'
      console.error(`[cron] ${name} threw:`, e)
    }
  }

  return NextResponse.json({ results })
}
