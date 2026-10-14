'use client'

import { useEffect, useState } from 'react'
import type { PreferenceRow, NotificationType } from '@/lib/notifications/types'

interface Labels {
  types: Record<NotificationType, string>
  channels: { inApp: string; email: string; push: string }
}

interface Props {
  labels: Labels
}

type Channel = 'in_app' | 'email' | 'push'

const CHANNEL_KEYS: { field: Channel; labelKey: 'inApp' | 'email' | 'push' }[] = [
  { field: 'in_app', labelKey: 'inApp' },
  { field: 'email', labelKey: 'email' },
  { field: 'push', labelKey: 'push' },
]

export function NotificationPreferencesClient({ labels }: Props) {
  const [prefs, setPrefs] = useState<PreferenceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ preferences: PreferenceRow[] }>
      })
      .then(({ preferences }) => {
        setPrefs(preferences ?? [])
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load preferences')
        setLoading(false)
      })
  }, [])

  async function toggle(type: NotificationType, channel: Channel, value: boolean) {
    const key = `${type}-${channel}`
    setSaving(key)
    // Optimistic update
    setPrefs((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [channel]: value } : p))
    )
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, [channel]: value }),
      })
      if (!res.ok) {
        // Revert on failure
        setPrefs((prev) =>
          prev.map((p) => (p.type === type ? { ...p, [channel]: !value } : p))
        )
      }
    } catch {
      // Revert on error
      setPrefs((prev) =>
        prev.map((p) => (p.type === type ? { ...p, [channel]: !value } : p))
      )
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Loading…
      </p>
    )
  }

  if (error) {
    return (
      <p className="text-sm" style={{ color: 'var(--destructive)' }}>
        {error}
      </p>
    )
  }

  return (
    <div
      className="overflow-x-auto rounded-xl"
      style={{ border: '1px solid var(--border)' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'var(--muted)',
            }}
          >
            <th
              className="text-start py-3 px-4 font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              &nbsp;
            </th>
            {CHANNEL_KEYS.map(({ field, labelKey }) => (
              <th
                key={field}
                className="py-3 px-4 font-medium whitespace-nowrap text-center"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {labels.channels[labelKey]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prefs.map((pref, i) => (
            <tr
              key={pref.type}
              style={{
                borderBottom:
                  i < prefs.length - 1 ? '1px solid var(--border)' : undefined,
              }}
            >
              <td
                className="py-3 px-4 font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {labels.types[pref.type] ?? pref.type}
              </td>
              {CHANNEL_KEYS.map(({ field }) => {
                const isOn = pref[field] as boolean
                const key = `${pref.type}-${field}`
                const isSaving = saving === key
                return (
                  <td key={field} className="py-3 px-4 text-center">
                    <button
                      role="switch"
                      aria-checked={isOn}
                      aria-label={`${labels.types[pref.type] ?? pref.type} ${field}`}
                      disabled={isSaving}
                      onClick={() =>
                        toggle(pref.type as NotificationType, field, !isOn)
                      }
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2"
                      style={{
                        background: isOn
                          ? 'var(--brand, var(--primary))'
                          : 'var(--muted-foreground)',
                        opacity: isSaving ? 0.5 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span
                        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: isOn ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
