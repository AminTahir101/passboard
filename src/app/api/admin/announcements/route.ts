import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { notifyMany } from '@/lib/notifications/notify'

async function verifyAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

interface AnnouncementBody {
  title_en: string
  title_ar: string
  body_en: string
  body_ar: string
  target_type: 'all' | 'exam' | 'individual'
  target_exam?: string
  target_user_ids?: string[]
}

export async function POST(request: Request) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json()) as AnnouncementBody

  const requiredFields = ['title_en', 'title_ar', 'body_en', 'body_ar', 'target_type'] as const
  for (const field of requiredFields) {
    if (!body[field]) return NextResponse.json({ error: `${field} required` }, { status: 400 })
  }

  const validTargetTypes = ['all', 'exam', 'individual'] as const
  if (!validTargetTypes.includes(body.target_type)) {
    return NextResponse.json({ error: 'Invalid target_type' }, { status: 400 })
  }

  if (body.target_type === 'exam' && !body.target_exam) {
    return NextResponse.json({ error: 'target_exam required when target_type is exam' }, { status: 400 })
  }

  if (body.target_type === 'individual' && (!body.target_user_ids || body.target_user_ids.length === 0)) {
    return NextResponse.json(
      { error: 'target_user_ids required when target_type is individual' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  const { data: announcement, error: insertError } = await admin
    .from('announcements')
    .insert({
      created_by: user.id,
      title_en: body.title_en,
      title_ar: body.title_ar,
      body_en: body.body_en,
      body_ar: body.body_ar,
      target_type: body.target_type,
      target_exam: body.target_exam ?? null,
      target_user_ids: body.target_user_ids ?? null,
    })
    .select()
    .single()

  if (insertError || !announcement) {
    return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Resolve recipient list
  let userIds: string[] = []

  if (body.target_type === 'individual' && body.target_user_ids?.length) {
    userIds = body.target_user_ids
  } else if (body.target_type === 'exam' && body.target_exam) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id')
      .eq('target_exam', body.target_exam)
      .eq('access_status', 'active')
    userIds = (profiles ?? []).map((p: { id: string }) => p.id)
  } else if (body.target_type === 'all') {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id')
      .eq('access_status', 'active')
    userIds = (profiles ?? []).map((p: { id: string }) => p.id)
  }

  // Fan-out notifications then update sent_at
  notifyMany(userIds, {
    type: 'announcement',
    title: { en: body.title_en, ar: body.title_ar },
    body: { en: body.body_en, ar: body.body_ar },
    metadata: { announcement_id: announcement.id },
  })
    .then(async () => {
      await admin
        .from('announcements')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', announcement.id)
    })
    .catch((e: unknown) => console.error('[announcements] notifyMany failed:', e))

  return NextResponse.json(
    {
      success: true,
      announcement_id: announcement.id,
      recipient_count: userIds.length,
    },
    { status: 201 }
  )
}
