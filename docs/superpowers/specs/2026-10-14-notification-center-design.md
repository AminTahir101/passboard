# Notification Center & Reminders — Design Spec

**Date:** 2026-10-14  
**Status:** Approved

---

## Overview

A full-stack notification system for Passboard delivering in-app, email, and iOS push notifications across eight event types. Built on the existing Next.js + Supabase stack with no new infrastructure services beyond Resend (email) and APNs (push).

---

## Delivery channels

| Channel | Mechanism |
|---|---|
| In-app | Supabase Realtime subscription; rows in `notifications` table |
| Email | Resend Node.js SDK, called from Next.js API routes |
| iOS push | APNs HTTP/2 via `apns2` npm package; `.p8` key in Vercel env |

All three channels are opt-out per notification type via user preferences.

---

## Notification types (enum)

```
exam_countdown
study_plan_reminder
access_expiring
inactivity
mock_exam_result
case_lab_ready
announcement
access_approved
```

---

## Data model

### `notifications`
Append-only. `read_at` is the only mutable column.

```sql
id           uuid primary key default uuid_generate_v4()
user_id      uuid references auth.users(id) on delete cascade not null
type         text not null  -- NotificationType enum
title_en     text not null
title_ar     text not null
body_en      text not null
body_ar      text not null
read_at      timestamptz
metadata     jsonb          -- e.g. { exam_id, case_id }
created_at   timestamptz not null default now()
```

Indexes: `(user_id, created_at desc)`, `(user_id, read_at)` where read_at is null.
Rows older than 90 days are deleted by the daily cron.

### `notification_preferences`
One row per user per type. Created lazily on first open of the preferences page with all channels defaulting to `true`.

```sql
id       uuid primary key default uuid_generate_v4()
user_id  uuid references auth.users(id) on delete cascade not null
type     text not null
in_app   boolean not null default true
email    boolean not null default true
push     boolean not null default true
unique (user_id, type)
```

### `device_tokens`
Stores iOS APNs device tokens. A user may have multiple tokens (multiple devices).

```sql
id           uuid primary key default uuid_generate_v4()
user_id      uuid references auth.users(id) on delete cascade not null
token        text not null unique
platform     text not null default 'ios'
created_at   timestamptz not null default now()
last_seen_at timestamptz not null default now()
```

### `announcements`
Admin-authored messages. Written before fan-out; the resolved recipient list is not stored.

```sql
id               uuid primary key default uuid_generate_v4()
created_by       uuid references auth.users(id) not null
title_en         text not null
title_ar         text not null
body_en          text not null
body_ar          text not null
target_type      text not null check (target_type in ('all', 'exam', 'individual'))
target_exam      text          -- populated when target_type = 'exam'
target_user_ids  uuid[]        -- populated when target_type = 'individual'
sent_at          timestamptz
created_at       timestamptz not null default now()
```

### `profiles` amendment
Add `last_active_at timestamptz` updated by a Postgres trigger on `practice_attempts` insert. Used by the inactivity cron check.

---

## Delivery layer

### `src/lib/notifications/notify.ts`

Single entry point for all notification delivery. Called by every trigger — event-driven and cron alike.

```ts
notify(options: {
  userId: string
  type: NotificationType
  title: { en: string; ar: string }
  body: { en: string; ar: string }
  metadata?: Record<string, unknown>
}): Promise<void>
```

Execution order inside `notify()`:
1. Fetch user preferences and profile language with a single query (service-role client).
2. If no preference row exists, treat all channels as ON.
3. Fire in-app, email, and push **in parallel** (`Promise.allSettled`).
4. Each channel is independently try/catched — a failed email never blocks the in-app write.
5. Channel failures are logged to stderr; no retry queue in v1.

**In-app:** inserts a row into `notifications` via the service-role client.

**Email:** calls Resend with a bilingual HTML template. User's profile language determines which copy is shown. One template per notification type, rendered server-side with the `title`/`body` strings passed in. From address: `notifications@passboard.ai`.

**Push:** looks up all `device_tokens` for the user. For each token, sends an APNs payload:
```json
{ "aps": { "alert": { "title": "<title>", "body": "<body>" }, "badge": 1, "sound": "default" } }
```
Uses `apns2` npm package with a `.p8` key stored in `APNS_KEY`, `APNS_KEY_ID`, and `APNS_TEAM_ID` env vars. Silently skips if no tokens exist. Removes tokens that APNs reports as invalid (410 response).

### `src/lib/notifications/notify.ts` — `notifyMany()`

```ts
notifyMany(userIds: string[], options: Omit<NotifyOptions, 'userId'>): Promise<void>
```

Iterates over `userIds` sequentially with a 50ms delay between calls to avoid Resend and APNs rate limits. Used by announcement fan-out and all cron checks.

---

## Event triggers

### Inline in existing API routes

| Event | File | Placement |
|---|---|---|
| Access approved | `src/app/api/admin/access-requests/[id]/create-account/route.ts` | After Supabase user created successfully |
| Mock exam result ready | `src/app/api/mock-exams/[id]/submit/route.ts` | After score saved to DB |
| Admin announcement | `src/app/api/admin/announcements/route.ts` (new) | After `announcements` row inserted; resolves recipient list then calls `notifyMany()` |

### Internal relay for Edge Functions

The `case-lab-analyze` Edge Function runs in Deno and cannot import the Node.js `notify()` module directly. Instead it POSTs to:

```
POST /api/notifications/internal
Authorization: Bearer $INTERNAL_NOTIFY_SECRET
```

This route validates the secret, then calls `notify()` normally. All delivery logic stays in one place. `INTERNAL_NOTIFY_SECRET` is a random 32-byte hex string set as a Vercel env var and passed to the Edge Function as a secret.

---

## Scheduled cron jobs

### Vercel Cron configuration (`vercel.json`)
```json
{
  "crons": [{ "path": "/api/cron/notifications", "schedule": "0 7 * * *" }]
}
```
Fires daily at 07:00 UTC.

### `src/app/api/cron/notifications/route.ts`
Protected by `Authorization: Bearer $CRON_SECRET` (Vercel injects this automatically). Runs five checks in sequence:

| Check | Query logic |
|---|---|
| **Exam countdown** | `profiles` where `exam_date` is exactly 30, 7, or 1 day from today and `access_status = 'active'` |
| **Daily study plan reminder** | `profiles` with an active `study_plans` row that has tasks due today and `access_status = 'active'` |
| **Access expiring soon** | `profiles` where `access_expires_at` is exactly 7 days from now |
| **Inactivity nudge** | `profiles` with `access_status = 'active'` and `last_active_at < now() - interval '3 days'` (or null) |
| **90-day cleanup** | `delete from notifications where created_at < now() - interval '90 days'` |

Each check is an exported async function in `src/lib/notifications/cron-checks.ts`. The route imports and calls them in order. Each check catches its own errors so one failure doesn't abort the rest.

---

## New API routes

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/admin/announcements` | Create announcement + fan-out |
| `POST` | `/api/notifications/internal` | Internal relay for Edge Functions |
| `PATCH` | `/api/notifications` | Mark read / mark all read |
| `GET` | `/api/notifications` | Fetch latest 50 for current user |
| `GET` | `/api/notifications/preferences` | Fetch all preference rows |
| `PATCH` | `/api/notifications/preferences` | Upsert a single preference row |
| `POST` | `/api/device-tokens` | Register iOS device token |
| `DELETE` | `/api/device-tokens` | Remove token on logout |
| `POST` | `/api/cron/notifications` | Cron entry point (Vercel-protected) |

---

## In-app UI

### Bell icon — `src/components/app/NotificationBell.tsx`
Client component placed in the existing app shell nav. Subscribes to Supabase Realtime on `notifications` filtered to `user_id = me`. Shows unread count badge (capped at 99+). Clicking opens the notification panel.

### Notification panel — `src/components/app/NotificationPanel.tsx`
Slide-over panel (not a new page). Renders latest 50 notifications from `GET /api/notifications`, grouped by date (Today / This week / Earlier).

Each row:
- Icon per type
- Title + body in user's active language
- Relative timestamp
- Unread indicator dot

Interactions:
- Click a row → marks it read (`PATCH /api/notifications`)
- "Mark all as read" button → bulk update
- Panel closes on outside click or Escape

### Preferences page — `src/app/[lang]/(app)/settings/notifications/page.tsx`
Toggle grid: rows = notification types, columns = In-app / Email / Push. Each toggle calls `PATCH /api/notifications/preferences`. Rows are created lazily on first page load if they don't exist. Bilingual labels for all 8 types added to `src/dictionaries/en.ts` and `src/dictionaries/ar.ts`.

---

## New environment variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for email delivery |
| `APNS_KEY` | APNs `.p8` key contents (base64 encoded) |
| `APNS_KEY_ID` | 10-character APNs key ID |
| `APNS_TEAM_ID` | Apple Developer Team ID |
| `APNS_BUNDLE_ID` | iOS app bundle identifier |
| `INTERNAL_NOTIFY_SECRET` | Shared secret for internal cron/edge relay |

`CRON_SECRET` is auto-injected by Vercel — no manual setup needed.

---

## File structure

```
src/
  lib/notifications/
    notify.ts           -- core delivery function + notifyMany()
    cron-checks.ts      -- five exported check functions
    types.ts            -- NotificationType enum + interfaces
  app/
    api/
      notifications/
        route.ts        -- GET + PATCH (read/list)
        preferences/
          route.ts      -- GET + PATCH preferences
        internal/
          route.ts      -- internal relay
      device-tokens/
        route.ts        -- POST + DELETE
      admin/
        announcements/
          route.ts      -- POST
      cron/
        notifications/
          route.ts      -- POST (cron entry)
  components/app/
    NotificationBell.tsx
    NotificationPanel.tsx
  [lang]/(app)/
    settings/
      notifications/
        page.tsx
supabase/migrations/
  20261014000004_notifications.sql
```

---

## Out of scope (v1)

- Retry queue for failed deliveries
- Rich push payloads with deep-link URLs (added when iOS navigation is wired)
- Notification history beyond 90 days
- Per-notification snooze
- Web push (browser notifications)
