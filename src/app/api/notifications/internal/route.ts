import { NextResponse } from 'next/server'
import { notify } from '@/lib/notifications/notify'
import type { NotifyOptions } from '@/lib/notifications/types'

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_NOTIFY_SECRET
  const auth = request.headers.get('Authorization')

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as Partial<NotifyOptions>

  if (!body.userId || !body.type || !body.title || !body.body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await notify(body as NotifyOptions)
  return NextResponse.json({ success: true })
}
