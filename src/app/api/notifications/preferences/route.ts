import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { ALL_NOTIFICATION_TYPES } from '@/lib/notifications/types'
import type { NotificationType } from '@/lib/notifications/types'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: existing } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)

  const existingTypes = new Set((existing ?? []).map((r) => r.type))
  const missing = ALL_NOTIFICATION_TYPES.filter((t) => !existingTypes.has(t))

  if (missing.length > 0) {
    const admin = createAdminClient()
    await admin.from('notification_preferences').insert(
      missing.map((type) => ({
        user_id: user.id,
        type,
        in_app: true,
        email: true,
        push: true,
      }))
    )
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .order('type')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ preferences: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as {
    type: NotificationType
    in_app?: boolean
    email?: boolean
    push?: boolean
  }

  if (!body.type) return NextResponse.json({ error: 'type required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (typeof body.in_app === 'boolean') updates.in_app = body.in_app
  if (typeof body.email === 'boolean') updates.email = body.email
  if (typeof body.push === 'boolean') updates.push = body.push

  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, type: body.type, ...updates })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
