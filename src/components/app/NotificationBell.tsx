'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationPanel } from './NotificationPanel'
import type { NotificationRow } from '@/lib/notifications/types'

interface Labels {
  title: string
  markAllRead: string
  empty: string
  preferences: string
}

interface Props {
  lang: string
  labels: Labels
}

export function NotificationBell({ lang, labels }: Props) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read_at).length

  const load = useCallback(async () => {
    const res = await fetch('/api/notifications')
    if (!res.ok) return
    const { notifications: data } = (await res.json()) as { notifications: NotificationRow[] }
    setNotifications(data ?? [])
    setLoaded(true)
  }, [])

  useEffect(() => {
    load()

    const supabase = createClient()

    let cleanup: (() => void) | undefined

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      const channel = supabase
        .channel('notifications-bell')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as NotificationRow, ...prev])
          }
        )
        .subscribe()

      cleanup = () => { supabase.removeChannel(channel) }
    })

    return () => { cleanup?.() }
  }, [load])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    )
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    })
  }, [])

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })))
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--muted)'
          e.currentTarget.style.color = 'var(--foreground)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--muted-foreground)'
        }}
        aria-label="Notifications"
      >
        <Bell size={17} />
        {loaded && unreadCount > 0 && (
          <span
            className="absolute top-1 end-1 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
            style={{ background: 'var(--accent-foreground)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          notifications={notifications}
          lang={lang}
          labels={labels}
          onMarkAllRead={markAllRead}
          onMarkRead={markRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
