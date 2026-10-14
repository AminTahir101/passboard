import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDictionary, localePath } from '@/lib/i18n'
import { NotificationPreferencesClient } from './NotificationPreferencesClient'

export default async function NotificationPreferencesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(localePath(lang, '/login'))

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10 px-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          {dict.notifications.preferences}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {dict.notifications.subtitle}
        </p>
      </div>
      <NotificationPreferencesClient labels={dict.notifications} />
    </div>
  )
}
