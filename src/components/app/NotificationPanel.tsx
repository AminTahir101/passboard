'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import type { NotificationRow } from '@/lib/notifications/types'

interface Labels {
  title: string
  markAllRead: string
  empty: string
  preferences: string
}

interface Props {
  notifications: NotificationRow[]
  lang: string
  labels: Labels
  onMarkAllRead: () => void
  onMarkRead: (id: string) => void
  onClose: () => void
}

function groupByDate(items: NotificationRow[], lang: string) {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const groups = [
    { label: lang === 'ar' ? 'اليوم' : 'Today', items: [] as NotificationRow[] },
    { label: lang === 'ar' ? 'هذا الأسبوع' : 'This week', items: [] as NotificationRow[] },
    { label: lang === 'ar' ? 'أقدم' : 'Earlier', items: [] as NotificationRow[] },
  ]

  for (const n of items) {
    if (n.created_at.slice(0, 10) === todayStr) groups[0].items.push(n)
    else if (n.created_at >= weekAgo) groups[1].items.push(n)
    else groups[2].items.push(n)
  }

  return groups.filter((g) => g.items.length > 0)
}

function relativeTime(iso: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return lang === 'ar' ? 'الآن' : 'Just now'
  if (diff < 3600) {
    const m = Math.floor(diff / 60)
    return lang === 'ar' ? `منذ ${m} دقيقة` : `${m}m ago`
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return lang === 'ar' ? `منذ ${h} ساعة` : `${h}h ago`
  }
  const d = Math.floor(diff / 86400)
  return lang === 'ar' ? `منذ ${d} يوم` : `${d}d ago`
}

export function NotificationPanel({
  notifications,
  lang,
  labels,
  onMarkAllRead,
  onMarkRead,
  onClose,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isAr = lang === 'ar'
  const groups = groupByDate(notifications, lang)
  const hasUnread = notifications.some((n) => !n.read_at)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      ref={ref}
      dir={isAr ? 'rtl' : 'ltr'}
      className="absolute top-full mt-2 w-80 sm:w-96 rounded-xl shadow-lg overflow-hidden z-50"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        [isAr ? 'left' : 'right']: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
          {labels.title}
        </span>
        {hasUnread && (
          <button
            onClick={onMarkAllRead}
            className="text-xs"
            style={{ color: 'var(--accent-foreground)' }}
          >
            {labels.markAllRead}
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto max-h-96">
        {notifications.length === 0 ? (
          <p
            className="text-center text-sm py-10"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {labels.empty}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p
                className="px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {group.label}
              </p>
              {group.items.map((n) => {
                const title = isAr ? n.title_ar : n.title_en
                const body = isAr ? n.body_ar : n.body_en
                return (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.read_at) onMarkRead(n.id) }}
                    className="w-full text-start px-4 py-3 flex gap-3 transition-colors"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: !n.read_at ? 'var(--accent)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--muted)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = !n.read_at ? 'var(--accent)' : 'transparent'
                    }}
                  >
                    {!n.read_at && (
                      <span
                        className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0"
                        style={{ background: 'var(--accent-foreground)' }}
                      />
                    )}
                    <div className={!n.read_at ? '' : 'ms-5'}>
                      <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                        {title}
                      </p>
                      <p
                        className="text-xs mt-0.5 line-clamp-2"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {body}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                        {relativeTime(n.created_at, lang)}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <Link
          href={localePath(lang, '/settings/notifications')}
          onClick={onClose}
          className="text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {labels.preferences}
        </Link>
      </div>
    </div>
  )
}
