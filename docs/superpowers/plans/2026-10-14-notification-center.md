# Notification Center & Reminders — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack notification system delivering in-app, email (Resend), and iOS push (APNs) notifications for eight event types, with per-user per-channel opt-out preferences.

**Architecture:** A central `notify()` function is the single delivery point for all channels. Event-driven notifications are triggered inline from existing API routes; time-based notifications run via a daily Vercel Cron job hitting `/api/cron/notifications`. In-app notifications use Supabase Realtime for live badge updates in the sidebar.

**Tech Stack:** Next.js App Router, Supabase (Postgres + Realtime + service-role admin client), Resend (email), apns2 (iOS push), Vercel Cron, Vitest (tests)

**Spec:** `docs/superpowers/specs/2026-10-14-notification-center-design.md`

## Global Constraints

- All new tables must have RLS enabled; service-role client bypasses RLS for server-side writes
- `notify()` uses `Promise.allSettled` — a failed channel never throws or blocks others
- All user-facing copy must exist in both `src/dictionaries/en.ts` and `src/dictionaries/ar.ts`
- APNs and Resend are only ever called server-side; never expose keys to the client
- Cron route rejects requests without `Authorization: Bearer $CRON_SECRET`
- Internal relay route rejects requests without `Authorization: Bearer $INTERNAL_NOTIFY_SECRET`
- `notifyMany()` delays 50ms between calls to avoid rate limits
- Study tasks table is `study_tasks` with column `scheduled_date` (not `due_date`)
- Attempts table is `question_attempts` (used for `last_active_at` trigger)

---

### Task 1: DB migration + notification types

**Files:**
- Create: `supabase/migrations/20261014000004_notifications.sql`
- Create: `src/lib/notifications/types.ts`

**Interfaces:**
- Produces: `NotificationType`, `NotifyOptions`, `NotificationRow`, `PreferenceRow` — used by all subsequent tasks

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/20261014000004_notifications.sql`:

```sql
-- ============================================================
-- Migration 004: Notification Center
-- ============================================================

-- 1. Add last_active_at to profiles (used by inactivity cron check)
alter table public.profiles
  add column if not exists last_active_at timestamptz;

-- Trigger: update last_active_at whenever a question attempt is inserted
create or replace function public.handle_question_active()
returns trigger language plpgsql as $$
begin
  update public.profiles set last_active_at = now() where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists question_attempts_active on public.question_attempts;
create trigger question_attempts_active
  after insert on public.question_attempts
  for each row execute function public.handle_question_active();

-- 2. notifications
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null,
  title_en   text not null,
  title_ar   text not null,
  body_en    text not null,
  body_ar    text not null,
  read_at    timestamptz,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index notifications_user_created on public.notifications(user_id, created_at desc);
create index notifications_unread on public.notifications(user_id, read_at) where read_at is null;
alter table public.notifications enable row level security;
create policy "users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- 3. notification_preferences
create table public.notification_preferences (
  id      uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type    text not null,
  in_app  boolean not null default true,
  email   boolean not null default true,
  push    boolean not null default true,
  unique (user_id, type)
);
alter table public.notification_preferences enable row level security;
create policy "users manage own preferences" on public.notification_preferences
  for all using (auth.uid() = user_id);

-- 4. device_tokens
create table public.device_tokens (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  token        text not null unique,
  platform     text not null default 'ios',
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.device_tokens enable row level security;
create policy "users manage own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id);

-- 5. announcements
create table public.announcements (
  id              uuid primary key default uuid_generate_v4(),
  created_by      uuid references auth.users(id) not null,
  title_en        text not null,
  title_ar        text not null,
  body_en         text not null,
  body_ar         text not null,
  target_type     text not null check (target_type in ('all', 'exam', 'individual')),
  target_exam     text,
  target_user_ids uuid[],
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "admins manage announcements" on public.announcements
  for all using (public.is_admin());
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```

Verify in Supabase dashboard that all 4 tables exist and `profiles` has `last_active_at`.

- [ ] **Step 3: Create types.ts**

Create `src/lib/notifications/types.ts`:

```ts
export type NotificationType =
  | 'exam_countdown'
  | 'study_plan_reminder'
  | 'access_expiring'
  | 'inactivity'
  | 'mock_exam_result'
  | 'case_lab_ready'
  | 'announcement'
  | 'access_approved'

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'exam_countdown',
  'study_plan_reminder',
  'access_expiring',
  'inactivity',
  'mock_exam_result',
  'case_lab_ready',
  'announcement',
  'access_approved',
]

export interface NotifyOptions {
  userId: string
  type: NotificationType
  title: { en: string; ar: string }
  body: { en: string; ar: string }
  metadata?: Record<string, unknown>
}

export interface NotificationRow {
  id: string
  user_id: string
  type: NotificationType
  title_en: string
  title_ar: string
  body_en: string
  body_ar: string
  read_at: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface PreferenceRow {
  id: string
  user_id: string
  type: NotificationType
  in_app: boolean
  email: boolean
  push: boolean
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261014000004_notifications.sql src/lib/notifications/types.ts
git commit -m "feat(notifications): add DB migration and types"
```

---

### Task 2: notify() core — in-app channel

**Files:**
- Create: `src/lib/notifications/channels/email.ts` (stub)
- Create: `src/lib/notifications/channels/push.ts` (stub)
- Create: `src/lib/notifications/notify.ts`
- Create: `src/lib/notifications/__tests__/notify.test.ts`

**Interfaces:**
- Consumes: `NotifyOptions`, `NotificationType`, `ALL_NOTIFICATION_TYPES` from `./types`
- Produces:
  - `notify(options: NotifyOptions): Promise<void>`
  - `notifyMany(userIds: string[], options: Omit<NotifyOptions, 'userId'>): Promise<void>`

- [ ] **Step 1: Install vitest if not present**

Check `package.json` for a `test` script. If missing:

```bash
npm install -D vitest @vitest/coverage-v8
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Create channel stubs**

Create `src/lib/notifications/channels/email.ts`:

```ts
export async function sendEmail(
  _to: string,
  _name: string | null,
  _title: { en: string; ar: string },
  _body: { en: string; ar: string }
): Promise<void> {
  // implemented in Task 3
}
```

Create `src/lib/notifications/channels/push.ts`:

```ts
export async function sendPush(
  _userId: string,
  _title: { en: string; ar: string },
  _body: { en: string; ar: string }
): Promise<void> {
  // implemented in Task 4
}
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/notifications/__tests__/notify.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn().mockResolvedValue({ error: null })
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'notification_preferences') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: () => mockSingle(),
        }
      }
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { email: 'student@test.com', full_name: 'Ahmed' },
          }),
        }
      }
      if (table === 'notifications') {
        return { insert: mockInsert }
      }
      return {}
    }),
  })),
}))

vi.mock('../channels/email', () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }))
vi.mock('../channels/push', () => ({ sendPush: vi.fn().mockResolvedValue(undefined) }))

import { notify, notifyMany } from '../notify'

describe('notify()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: { in_app: true, email: false, push: false } })
  })

  it('inserts a notification row when in_app pref is true', async () => {
    await notify({
      userId: 'user-1',
      type: 'access_approved',
      title: { en: 'Access approved', ar: 'تمت الموافقة' },
      body: { en: 'Your access is active', ar: 'وصولك نشط' },
    })
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        type: 'access_approved',
        title_en: 'Access approved',
        title_ar: 'تمت الموافقة',
      })
    )
  })

  it('skips in-app insert when in_app pref is false', async () => {
    mockSingle.mockResolvedValue({ data: { in_app: false, email: false, push: false } })
    await notify({
      userId: 'user-1',
      type: 'access_approved',
      title: { en: 'T', ar: 'ت' },
      body: { en: 'B', ar: 'ب' },
    })
    expect(mockInsert).not.toHaveBeenCalled()
  })

  it('defaults to all channels ON when no preference row exists', async () => {
    mockSingle.mockResolvedValue({ data: null })
    await notify({
      userId: 'user-1',
      type: 'inactivity',
      title: { en: 'T', ar: 'ت' },
      body: { en: 'B', ar: 'ب' },
    })
    expect(mockInsert).toHaveBeenCalled()
  })

  it('does not throw if in-app insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })
    await expect(
      notify({
        userId: 'user-1',
        type: 'access_approved',
        title: { en: 'T', ar: 'ت' },
        body: { en: 'B', ar: 'ب' },
      })
    ).resolves.not.toThrow()
  })
})

describe('notifyMany()', () => {
  it('resolves without throwing for multiple users', async () => {
    mockSingle.mockResolvedValue({ data: { in_app: true, email: false, push: false } })
    await expect(
      notifyMany(['user-1', 'user-2'], {
        type: 'exam_countdown',
        title: { en: 'Exam soon', ar: 'الاختبار قريب' },
        body: { en: '7 days left', ar: '٧ أيام متبقية' },
      })
    ).resolves.not.toThrow()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

```bash
npx vitest run src/lib/notifications/__tests__/notify.test.ts
```

Expected: FAIL — `notify` module not found.

- [ ] **Step 5: Create notify.ts**

Create `src/lib/notifications/notify.ts`:

```ts
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from './channels/email'
import { sendPush } from './channels/push'
import type { NotifyOptions } from './types'

export async function notify(options: NotifyOptions): Promise<void> {
  const { userId, type, title, body, metadata } = options
  const admin = createAdminClient()

  const [prefResult, profileResult] = await Promise.all([
    admin
      .from('notification_preferences')
      .select('in_app, email, push')
      .eq('user_id', userId)
      .eq('type', type)
      .single(),
    admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single(),
  ])

  const inApp = prefResult.data?.in_app ?? true
  const emailPref = prefResult.data?.email ?? true
  const pushPref = prefResult.data?.push ?? true
  const profile = profileResult.data

  await Promise.allSettled([
    inApp
      ? admin
          .from('notifications')
          .insert({
            user_id: userId,
            type,
            title_en: title.en,
            title_ar: title.ar,
            body_en: body.en,
            body_ar: body.ar,
            metadata: metadata ?? null,
          })
          .then(({ error }) => {
            if (error) console.error('[notify] in-app write failed:', error.message)
          })
      : Promise.resolve(),
    emailPref && profile?.email
      ? sendEmail(profile.email, profile.full_name ?? null, title, body).catch((e) =>
          console.error('[notify] email failed:', e)
        )
      : Promise.resolve(),
    pushPref
      ? sendPush(userId, title, body).catch((e) =>
          console.error('[notify] push failed:', e)
        )
      : Promise.resolve(),
  ])
}

export async function notifyMany(
  userIds: string[],
  options: Omit<NotifyOptions, 'userId'>
): Promise<void> {
  for (const userId of userIds) {
    await notify({ ...options, userId })
    await new Promise((r) => setTimeout(r, 50))
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx vitest run src/lib/notifications/__tests__/notify.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/notifications/
git commit -m "feat(notifications): add notify() core with in-app channel"
```

---

### Task 3: Email channel via Resend

**Files:**
- Modify: `src/lib/notifications/channels/email.ts`
- Create: `src/lib/notifications/__tests__/email.test.ts`

**Interfaces:**
- Consumes: `sendEmail(to, name, title, body)` stub from Task 2
- Produces: implemented `sendEmail` that sends a bilingual HTML email via Resend

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/notifications/__tests__/email.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'email-1' }, error: null })
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

import { sendEmail } from '../channels/email'

describe('sendEmail()', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls Resend with the correct to address and from', async () => {
    await sendEmail(
      'student@example.com',
      'Ahmed',
      { en: 'Access Approved', ar: 'تمت الموافقة على وصولك' },
      { en: 'Your Passboard access is now active.', ar: 'وصولك إلى Passboard أصبح نشطاً.' }
    )
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'student@example.com',
        from: 'Passboard <notifications@passboard.ai>',
      })
    )
  })

  it('includes both EN and AR content in the HTML', async () => {
    await sendEmail(
      'student@example.com',
      null,
      { en: 'Exam in 7 days', ar: 'الاختبار بعد ٧ أيام' },
      { en: 'Keep going!', ar: 'استمر!' }
    )
    const call = mockSend.mock.calls[0][0]
    expect(call.html).toContain('Exam in 7 days')
    expect(call.html).toContain('الاختبار بعد ٧ أيام')
  })

  it('does not throw if Resend returns an error', async () => {
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'rate limit' } })
    await expect(
      sendEmail('bad@example.com', null, { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' })
    ).resolves.not.toThrow()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/lib/notifications/__tests__/email.test.ts
```

Expected: FAIL — `sendEmail` is a no-op stub.

- [ ] **Step 4: Implement sendEmail**

Replace `src/lib/notifications/channels/email.ts`:

```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(
  to: string,
  name: string | null,
  title: { en: string; ar: string },
  body: { en: string; ar: string }
): Promise<void> {
  const greeting = name ? `Hi ${name},` : 'Hi,'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
  <p style="margin-bottom:16px">${greeting}</p>
  <h2 style="font-size:20px;margin-bottom:8px">${title.en}</h2>
  <p style="margin-bottom:24px">${body.en}</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
  <p dir="rtl" style="text-align:right;margin-bottom:4px;font-size:18px">${title.ar}</p>
  <p dir="rtl" style="text-align:right">${body.ar}</p>
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
  <p style="font-size:12px;color:#888">Passboard &mdash; <a href="https://passboard.ai" style="color:#888">passboard.ai</a></p>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Passboard <notifications@passboard.ai>',
    to,
    subject: `${title.en} / ${title.ar}`,
    html,
  })

  if (error) {
    console.error('[sendEmail] Resend error:', error.message)
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/lib/notifications/__tests__/email.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Add RESEND_API_KEY to Vercel and local env**

```bash
vercel env add RESEND_API_KEY
# Select: Production, Preview, Development
```

Also add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/notifications/channels/email.ts src/lib/notifications/__tests__/email.test.ts package.json package-lock.json
git commit -m "feat(notifications): add email delivery via Resend"
```

---

### Task 4: iOS push channel via APNs

**Files:**
- Modify: `src/lib/notifications/channels/push.ts`
- Create: `src/lib/notifications/__tests__/push.test.ts`

**Interfaces:**
- Consumes: `sendPush(userId, title, body)` stub from Task 2
- Produces: implemented `sendPush` that looks up device tokens and sends APNs payloads; removes stale tokens (410 response)

- [ ] **Step 1: Install apns2**

```bash
npm install apns2
```

- [ ] **Step 2: Write the failing test**

Create `src/lib/notifications/__tests__/push.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockApnsSend = vi.fn().mockResolvedValue(undefined)
vi.mock('apns2', () => ({
  ApnsClient: vi.fn().mockImplementation(() => ({ send: mockApnsSend })),
  Notification: vi.fn().mockImplementation((token, opts) => ({ token, ...opts })),
}))

const mockTokenQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ data: [{ token: 'device-token-abc' }], error: null }),
}
const mockDeleteQuery = {
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue({ error: null }),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'device_tokens') return mockTokenQuery
      return mockDeleteQuery
    }),
  })),
}))

import { sendPush } from '../channels/push'

describe('sendPush()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.APNS_KEY = Buffer.from('fake-key').toString('base64')
    process.env.APNS_KEY_ID = 'KEYID12345'
    process.env.APNS_TEAM_ID = 'TEAMID12345'
    process.env.APNS_BUNDLE_ID = 'ai.passboard.app'
    mockTokenQuery.eq.mockResolvedValue({ data: [{ token: 'device-token-abc' }], error: null })
  })

  it('calls APNs send for each device token', async () => {
    await sendPush(
      'user-1',
      { en: 'Exam in 7 days', ar: 'الاختبار بعد ٧ أيام' },
      { en: 'Keep going!', ar: 'استمر!' }
    )
    expect(mockApnsSend).toHaveBeenCalledTimes(1)
  })

  it('does not throw when no device tokens exist', async () => {
    mockTokenQuery.eq.mockResolvedValueOnce({ data: [], error: null })
    await expect(
      sendPush('user-no-device', { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' })
    ).resolves.not.toThrow()
  })

  it('skips silently when APNs env vars are not configured', async () => {
    delete process.env.APNS_KEY
    await expect(
      sendPush('user-1', { en: 'T', ar: 'ت' }, { en: 'B', ar: 'ب' })
    ).resolves.not.toThrow()
    expect(mockApnsSend).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npx vitest run src/lib/notifications/__tests__/push.test.ts
```

Expected: FAIL — `sendPush` is a no-op stub.

- [ ] **Step 4: Implement sendPush**

Replace `src/lib/notifications/channels/push.ts`:

```ts
import { ApnsClient, Notification } from 'apns2'
import { createAdminClient } from '@/lib/supabase/admin'

function buildClient(): ApnsClient {
  const key = Buffer.from(process.env.APNS_KEY!, 'base64').toString('utf8')
  return new ApnsClient({
    team: process.env.APNS_TEAM_ID!,
    keyId: process.env.APNS_KEY_ID!,
    signingKey: key,
    defaultTopic: process.env.APNS_BUNDLE_ID!,
    requestTimeout: 5000,
  })
}

export async function sendPush(
  userId: string,
  title: { en: string; ar: string },
  body: { en: string; ar: string }
): Promise<void> {
  if (
    !process.env.APNS_KEY ||
    !process.env.APNS_KEY_ID ||
    !process.env.APNS_TEAM_ID ||
    !process.env.APNS_BUNDLE_ID
  ) {
    console.warn('[sendPush] APNs env vars not configured — skipping')
    return
  }

  const admin = createAdminClient()
  const { data: tokens } = await admin
    .from('device_tokens')
    .select('token')
    .eq('user_id', userId)

  if (!tokens || tokens.length === 0) return

  const client = buildClient()

  for (const { token } of tokens) {
    try {
      const notification = new Notification(token, {
        alert: { title: title.ar, body: body.ar },
        badge: 1,
        sound: 'default',
      })
      await client.send(notification)
    } catch (e: unknown) {
      const err = e as { statusCode?: number }
      if (err.statusCode === 410) {
        // Token is no longer valid — remove it
        await admin.from('device_tokens').delete().eq('token', token)
        console.info('[sendPush] removed stale token:', token)
      } else {
        console.error('[sendPush] APNs error for token', token, e)
      }
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run src/lib/notifications/__tests__/push.test.ts
```

Expected: all 3 tests PASS.

- [ ] **Step 6: Add APNs env vars to Vercel**

```bash
vercel env add APNS_KEY          # base64-encoded contents of your .p8 key file
vercel env add APNS_KEY_ID       # 10-character Key ID from App Store Connect
vercel env add APNS_TEAM_ID      # Apple Developer Team ID
vercel env add APNS_BUNDLE_ID    # iOS app bundle ID, e.g. ai.passboard.app
```

Select Production + Preview + Development for all four. These can be added once APNs certificates are issued — `sendPush()` guards for missing vars and skips silently until then.

- [ ] **Step 7: Commit**

```bash
git add src/lib/notifications/channels/push.ts src/lib/notifications/__tests__/push.test.ts package.json package-lock.json
git commit -m "feat(notifications): add iOS push delivery via APNs"
```

---

### Task 5: Notification API routes

**Files:**
- Create: `src/app/api/notifications/route.ts`
- Create: `src/app/api/notifications/preferences/route.ts`
- Create: `src/app/api/device-tokens/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/notifications` → `{ notifications: NotificationRow[] }` (latest 50, newest first)
  - `PATCH /api/notifications` body `{ ids?: string[], all?: boolean }` → `{ success: true }`
  - `GET /api/notifications/preferences` → `{ preferences: PreferenceRow[] }` (lazily creates defaults)
  - `PATCH /api/notifications/preferences` body `{ type: NotificationType, in_app?: bool, email?: bool, push?: bool }` → `{ success: true }`
  - `POST /api/device-tokens` body `{ token: string }` → `{ success: true }`
  - `DELETE /api/device-tokens` body `{ token: string }` → `{ success: true }`

- [ ] **Step 1: Create notifications route**

Create `src/app/api/notifications/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notifications: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { ids?: string[]; all?: boolean }

  if (body.all) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (body.ids?.length) {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', body.ids)
      .eq('user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create preferences route**

Create `src/app/api/notifications/preferences/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { ALL_NOTIFICATION_TYPES } from '@/lib/notifications/types'
import type { NotificationType } from '@/lib/notifications/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
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
```

- [ ] **Step 3: Create device-tokens route**

Create `src/app/api/device-tokens/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json() as { token: string }
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { error } = await supabase
    .from('device_tokens')
    .upsert({
      user_id: user.id,
      token,
      last_seen_at: new Date().toISOString(),
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json() as { token: string }
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { error } = await supabase
    .from('device_tokens')
    .delete()
    .eq('token', token)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: Smoke test in browser**

Start `npm run dev`. Log in as a student and test:

```bash
# GET notifications — expect { notifications: [] }
curl -b "<session-cookie>" http://localhost:3000/api/notifications

# GET preferences — expect 8 rows created with all channels true
curl -b "<session-cookie>" http://localhost:3000/api/notifications/preferences
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/notifications/ src/app/api/device-tokens/
git commit -m "feat(notifications): add notifications, preferences, and device-token API routes"
```

---

### Task 6: Internal relay + Edge Function integration

**Files:**
- Create: `src/app/api/notifications/internal/route.ts`
- Modify: `supabase/functions/case-lab-analyze/index.ts`

**Interfaces:**
- Consumes: `notify(options: NotifyOptions)` from `@/lib/notifications/notify`
- Produces: `POST /api/notifications/internal` — accepts `NotifyOptions` body + `Authorization: Bearer $INTERNAL_NOTIFY_SECRET`

- [ ] **Step 1: Create the internal relay route**

Create `src/app/api/notifications/internal/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { notify } from '@/lib/notifications/notify'
import type { NotifyOptions } from '@/lib/notifications/types'

export async function POST(request: Request) {
  const secret = process.env.INTERNAL_NOTIFY_SECRET
  const auth = request.headers.get('Authorization')

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Partial<NotifyOptions>

  if (!body.userId || !body.type || !body.title || !body.body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  await notify(body as NotifyOptions)
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Generate and set INTERNAL_NOTIFY_SECRET**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output, then:

```bash
vercel env add INTERNAL_NOTIFY_SECRET
npx supabase secrets set INTERNAL_NOTIFY_SECRET=<your-secret>
```

Add to `.env.local`:
```
INTERNAL_NOTIFY_SECRET=<your-secret>
```

- [ ] **Step 3: Read case-lab-analyze to find the status update**

Read `supabase/functions/case-lab-analyze/index.ts` and find the line that updates the case status to `'done'`. The notify call goes immediately after that update succeeds.

- [ ] **Step 4: Add notify call to case-lab-analyze**

In `supabase/functions/case-lab-analyze/index.ts`, immediately after the successful `'done'` status update, add (adjusting variable names to match what is actually used in that file):

```ts
// Notify user that analysis is complete
const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL')
const notifySecret = Deno.env.get('INTERNAL_NOTIFY_SECRET')
if (appUrl && notifySecret) {
  fetch(`${appUrl}/api/notifications/internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${notifySecret}`,
    },
    body: JSON.stringify({
      userId: caseUserId,   // use the actual variable holding the case owner's user_id
      type: 'case_lab_ready',
      title: { en: 'Case analysis ready', ar: 'تحليل الحالة جاهز' },
      body: {
        en: 'Your Case Lab analysis is complete. Tap to view the report.',
        ar: 'اكتمل تحليل حالتك. اضغط لعرض التقرير.',
      },
      metadata: { case_id: caseId },  // use the actual case id variable
    }),
  }).catch((e: unknown) => console.error('[case-lab] notify failed:', e))
}
```

Set the required Supabase Edge Function secret:
```bash
npx supabase secrets set NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/notifications/internal/ supabase/functions/case-lab-analyze/index.ts
git commit -m "feat(notifications): add internal relay and case-lab-analyze notify trigger"
```

---

### Task 7: Event triggers — access approved + mock exam result

**Files:**
- Modify: `src/app/api/admin/access-requests/[id]/create-account/route.ts`
- Modify: `src/app/api/mock-exams/[id]/submit/route.ts`

**Interfaces:**
- Consumes: `notify(options: NotifyOptions): Promise<void>` from `@/lib/notifications/notify`

- [ ] **Step 1: Wire notify into create-account route**

In `src/app/api/admin/access-requests/[id]/create-account/route.ts`, add the import at the top:

```ts
import { notify } from '@/lib/notifications/notify'
```

Then find line 66 (`await admin.from("access_requests").update(...)`) and add after it, before the `return NextResponse.json(...)` on line 68:

```ts
  // Notify the new student — fire-and-forget so it never blocks account creation
  notify({
    userId: newUser.user.id,
    type: 'access_approved',
    title: { en: 'Your access has been approved', ar: 'تمت الموافقة على وصولك' },
    body: {
      en: 'Welcome to Passboard. You can now log in and start preparing.',
      ar: 'مرحباً بك في Passboard. يمكنك الآن تسجيل الدخول والبدء في الاستعداد.',
    },
  }).catch((e) => console.error('[access-approved] notify failed:', e))
```

- [ ] **Step 2: Wire notify into mock-exam submit route**

In `src/app/api/mock-exams/[id]/submit/route.ts`, add the import at the top of the file:

```ts
import { notify } from '@/lib/notifications/notify'
```

Find line 123 (the `mock_exams` update) and add after that `await`, before `return NextResponse.json({ score, percentage, total })` on line 125:

```ts
    // Notify user — fire-and-forget
    notify({
      userId: user.id,
      type: 'mock_exam_result',
      title: { en: 'Mock exam results ready', ar: 'نتائج الاختبار التجريبي جاهزة' },
      body: {
        en: `You scored ${Math.round(percentage)}% on your mock exam.`,
        ar: `حصلت على ${Math.round(percentage)}٪ في اختبارك التجريبي.`,
      },
      metadata: { exam_id: id, score, percentage: Math.round(percentage) },
    }).catch((e) => console.error('[mock-exam-result] notify failed:', e))
```

- [ ] **Step 3: Manual verification**

Start `npm run dev`. As admin, approve an access request. Verify in the Supabase `notifications` table that a row was inserted for the new user with `type = 'access_approved'`.

Submit a mock exam as a student. Verify a `mock_exam_result` notification row was inserted.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/access-requests/ src/app/api/mock-exams/
git commit -m "feat(notifications): trigger notify on access approval and mock exam result"
```

---

### Task 8: Cron checks + cron route

**Files:**
- Create: `src/lib/notifications/cron-checks.ts`
- Create: `src/lib/notifications/__tests__/cron-checks.test.ts`
- Create: `src/app/api/cron/notifications/route.ts`

**Interfaces:**
- Consumes: `notifyMany(userIds, options)` from `./notify`
- Produces:
  - `checkExamCountdown(): Promise<void>`
  - `checkStudyPlanReminder(): Promise<void>`
  - `checkAccessExpiring(): Promise<void>`
  - `checkInactivity(): Promise<void>`
  - `runCleanup(): Promise<void>`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/notifications/__tests__/cron-checks.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../notify', () => ({
  notifyMany: vi.fn().mockResolvedValue(undefined),
}))

const makeChain = (data: unknown[]) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockResolvedValue({ data, error: null }),
  delete: vi.fn().mockReturnThis(),
})

let chainResult: ReturnType<typeof makeChain>

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => chainResult),
  })),
}))

import { checkExamCountdown, checkInactivity, runCleanup, checkAccessExpiring } from '../cron-checks'
import { notifyMany } from '../notify'

describe('checkExamCountdown()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    chainResult = makeChain([{ id: 'user-1', exam_date: '2026-10-21' }])
    // Make the final .eq() resolve with data
    chainResult.eq.mockResolvedValue({ data: [{ id: 'user-1', exam_date: '2026-10-21' }], error: null })
  })

  it('calls notifyMany with exam_countdown type when users have upcoming exams', async () => {
    await checkExamCountdown()
    expect(notifyMany).toHaveBeenCalledWith(
      expect.arrayContaining(['user-1']),
      expect.objectContaining({ type: 'exam_countdown' })
    )
  })

  it('does not call notifyMany when no users match', async () => {
    chainResult.eq.mockResolvedValue({ data: [], error: null })
    vi.mocked(notifyMany).mockClear()
    await checkExamCountdown()
    expect(notifyMany).not.toHaveBeenCalled()
  })
})

describe('checkInactivity()', () => {
  it('calls notifyMany with inactivity type', async () => {
    chainResult = makeChain([{ id: 'user-2' }])
    chainResult.or.mockResolvedValue({ data: [{ id: 'user-2' }], error: null })
    await checkInactivity()
    expect(notifyMany).toHaveBeenCalledWith(
      ['user-2'],
      expect.objectContaining({ type: 'inactivity' })
    )
  })
})

describe('runCleanup()', () => {
  it('resolves without throwing', async () => {
    chainResult = makeChain([])
    chainResult.lt.mockResolvedValue({ error: null })
    await expect(runCleanup()).resolves.not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/lib/notifications/__tests__/cron-checks.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement cron-checks.ts**

Create `src/lib/notifications/cron-checks.ts`:

```ts
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

    if (error) { console.error('[cron] exam_countdown error:', error.message); continue }
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

  if (error) { console.error('[cron] study_plan_reminder error:', error.message); return }
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

  if (error) { console.error('[cron] access_expiring error:', error.message); return }
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

  if (error) { console.error('[cron] inactivity error:', error.message); return }
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/lib/notifications/__tests__/cron-checks.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Create the cron route**

Create `src/app/api/cron/notifications/route.ts`:

```ts
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
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/notifications/cron-checks.ts src/lib/notifications/__tests__/cron-checks.test.ts src/app/api/cron/
git commit -m "feat(notifications): add cron checks and daily cron route"
```

---

### Task 9: Admin announcement route

**Files:**
- Create: `src/app/api/admin/announcements/route.ts`

**Interfaces:**
- Consumes: `notifyMany(userIds, options)` from `@/lib/notifications/notify`
- Produces: `POST /api/admin/announcements` (admin-only)
  - Body: `{ title_en, title_ar, body_en, body_ar, target_type: 'all'|'exam'|'individual', target_exam?, target_user_ids? }`
  - Response: `{ success: true, announcement_id: string, recipient_count: number }`

- [ ] **Step 1: Create the route**

Create `src/app/api/admin/announcements/route.ts`:

```ts
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { notifyMany } from '@/lib/notifications/notify'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return null
  return user
}

export async function POST(request: Request) {
  const user = await verifyAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    title_en: string
    title_ar: string
    body_en: string
    body_ar: string
    target_type: 'all' | 'exam' | 'individual'
    target_exam?: string
    target_user_ids?: string[]
  }

  for (const field of ['title_en', 'title_ar', 'body_en', 'body_ar', 'target_type'] as const) {
    if (!body[field]) return NextResponse.json({ error: `${field} required` }, { status: 400 })
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
      sent_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

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

  // Fan-out — fire-and-forget so response is immediate
  notifyMany(userIds, {
    type: 'announcement',
    title: { en: body.title_en, ar: body.title_ar },
    body: { en: body.body_en, ar: body.body_ar },
    metadata: { announcement_id: announcement.id },
  }).catch((e) => console.error('[announcements] notifyMany failed:', e))

  return NextResponse.json({
    success: true,
    announcement_id: announcement.id,
    recipient_count: userIds.length,
  })
}
```

- [ ] **Step 2: Smoke test**

```bash
curl -X POST http://localhost:3000/api/admin/announcements \
  -H "Content-Type: application/json" \
  -b "<admin-session-cookie>" \
  -d '{
    "title_en": "Test announcement",
    "title_ar": "إعلان تجريبي",
    "body_en": "This is a test.",
    "body_ar": "هذا اختبار.",
    "target_type": "all"
  }'
```

Verify `announcements` row is inserted and `notifications` rows are created for active users.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/announcements/
git commit -m "feat(notifications): add admin announcement route with fan-out"
```

---

### Task 10: Dictionary updates

**Files:**
- Modify: `src/lib/i18n.ts`
- Modify: `src/dictionaries/en.ts`
- Modify: `src/dictionaries/ar.ts`

**Interfaces:**
- Produces: `dict.notifications` key available in all server components and pages

- [ ] **Step 1: Add the notifications type to Dictionary**

In `src/lib/i18n.ts`, add to the `Dictionary` type (after the `caseLab` block):

```ts
notifications: {
  title: string
  markAllRead: string
  empty: string
  preferences: string
  channels: { inApp: string; email: string; push: string }
  types: {
    exam_countdown: string
    study_plan_reminder: string
    access_expiring: string
    inactivity: string
    mock_exam_result: string
    case_lab_ready: string
    announcement: string
    access_approved: string
  }
}
```

- [ ] **Step 2: Add English strings to en.ts**

In `src/dictionaries/en.ts`, add after the `caseLab` key:

```ts
notifications: {
  title: 'Notifications',
  markAllRead: 'Mark all as read',
  empty: 'No notifications yet',
  preferences: 'Notification preferences',
  channels: { inApp: 'In-app', email: 'Email', push: 'Push' },
  types: {
    exam_countdown: 'Exam countdown',
    study_plan_reminder: 'Study plan reminder',
    access_expiring: 'Access expiring',
    inactivity: 'Inactivity reminder',
    mock_exam_result: 'Mock exam result',
    case_lab_ready: 'Case Lab ready',
    announcement: 'Announcement',
    access_approved: 'Access approved',
  },
},
```

- [ ] **Step 3: Add Arabic strings to ar.ts**

In `src/dictionaries/ar.ts`, add after the `caseLab` key:

```ts
notifications: {
  title: 'الإشعارات',
  markAllRead: 'تحديد الكل كمقروء',
  empty: 'لا توجد إشعارات بعد',
  preferences: 'إعدادات الإشعارات',
  channels: { inApp: 'داخل التطبيق', email: 'البريد الإلكتروني', push: 'الإشعارات الفورية' },
  types: {
    exam_countdown: 'العد التنازلي للاختبار',
    study_plan_reminder: 'تذكير خطة الدراسة',
    access_expiring: 'انتهاء صلاحية الوصول',
    inactivity: 'تذكير عدم النشاط',
    mock_exam_result: 'نتيجة الاختبار التجريبي',
    case_lab_ready: 'Case Lab جاهز',
    announcement: 'إعلان',
    access_approved: 'تمت الموافقة على الوصول',
  },
},
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts src/dictionaries/en.ts src/dictionaries/ar.ts
git commit -m "feat(notifications): add bilingual notification labels to dictionaries"
```

---

### Task 11: NotificationBell + NotificationPanel

**Files:**
- Create: `src/components/app/NotificationBell.tsx`
- Create: `src/components/app/NotificationPanel.tsx`
- Modify: `src/components/layout/AppSidebar.tsx`

**Interfaces:**
- Consumes: `GET /api/notifications`, `PATCH /api/notifications`, Supabase Realtime
- Produces: `<NotificationBell lang={string} labels={...} />` — self-contained client component

- [ ] **Step 1: Create NotificationPanel**

Create `src/components/app/NotificationPanel.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { localePath } from '@/lib/i18n'
import type { NotificationRow, NotificationType } from '@/lib/notifications/types'

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
                      <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent-foreground)' }} />
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
```

- [ ] **Step 2: Create NotificationBell**

Create `src/components/app/NotificationBell.tsx`:

```tsx
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
    const { notifications: data } = await res.json()
    setNotifications(data ?? [])
    setLoaded(true)
  }, [])

  useEffect(() => {
    load()

    const supabase = createClient()

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

      return () => { supabase.removeChannel(channel) }
    })
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
```

- [ ] **Step 3: Wire NotificationBell into AppSidebar**

In `src/components/layout/AppSidebar.tsx`:

Add the import at the top:
```ts
import { NotificationBell } from '@/components/app/NotificationBell'
```

Update `AppSidebarProps` to add the notifications labels:
```ts
interface AppSidebarProps {
  userName: string | null
  userEmail: string
  lang: string
  nav: { /* existing fields unchanged */ }
  langToggleLabel: string
  notificationLabels: {
    title: string
    markAllRead: string
    empty: string
    preferences: string
  }
}
```

In `SidebarContent`, find the user info block at the bottom (the div with `Logo` and user email). Add `<NotificationBell>` inside the bottom section, just above the `<LanguageToggle>`:

```tsx
<div className="px-3 mb-1">
  <NotificationBell lang={lang} labels={notificationLabels} />
</div>
```

- [ ] **Step 4: Pass notificationLabels from the layout**

Find the server component that renders `<AppSidebar>` (look for `AppSidebar` usage with `grep -r "AppSidebar" src/ --include="*.tsx" -l`). Add `notificationLabels={dict.notifications}` to the `<AppSidebar>` call. The `dict` is already loaded in that layout/page.

- [ ] **Step 5: Verify in browser**

Start `npm run dev`. Log in as a student. Verify:
- Bell icon appears in the sidebar bottom section
- Insert a test notification row in Supabase dashboard — badge appears without page refresh
- Clicking bell opens the panel
- Content shows in correct language (EN at `/en/...`, AR at `/ar/...`)
- Clicking a notification marks it read
- "Mark all as read" works
- Panel closes on outside click and Escape key

- [ ] **Step 6: Commit**

```bash
git add src/components/app/ src/components/layout/AppSidebar.tsx
git commit -m "feat(notifications): add NotificationBell and NotificationPanel to app sidebar"
```

---

### Task 12: Notification preferences page

**Files:**
- Create: `src/app/[lang]/(app)/settings/notifications/page.tsx`
- Create: `src/app/[lang]/(app)/settings/notifications/NotificationPreferencesClient.tsx`

**Interfaces:**
- Consumes: `GET /api/notifications/preferences`, `PATCH /api/notifications/preferences`
- Consumes: `dict.notifications` labels

- [ ] **Step 1: Create the server page**

Create `src/app/[lang]/(app)/settings/notifications/page.tsx`:

```tsx
import { getDictionary } from '@/lib/i18n'
import { NotificationPreferencesClient } from './NotificationPreferencesClient'

export default async function NotificationPreferencesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
        {dict.notifications.preferences}
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
        {dict.lang.toggle === 'عربي'
          ? 'Choose which notifications you receive and how.'
          : 'اختر الإشعارات التي تتلقاها وكيفية استلامها.'}
      </p>
      <NotificationPreferencesClient labels={dict.notifications} />
    </div>
  )
}
```

- [ ] **Step 2: Create the client component**

Create `src/app/[lang]/(app)/settings/notifications/NotificationPreferencesClient.tsx`:

```tsx
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

export function NotificationPreferencesClient({ labels }: Props) {
  const [prefs, setPrefs] = useState<PreferenceRow[]>([])
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then((r) => r.json())
      .then(({ preferences }) => setPrefs(preferences ?? []))
  }, [])

  async function toggle(
    type: NotificationType,
    channel: 'in_app' | 'email' | 'push',
    value: boolean
  ) {
    setSaving(`${type}-${channel}`)
    setPrefs((prev) =>
      prev.map((p) => (p.type === type ? { ...p, [channel]: value } : p))
    )
    await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, [channel]: value }),
    })
    setSaving(null)
  }

  if (prefs.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Loading…
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
            <th
              className="text-start py-3 px-4 font-medium"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Type
            </th>
            {(['inApp', 'email', 'push'] as const).map((ch) => (
              <th
                key={ch}
                className="py-3 px-4 font-medium whitespace-nowrap"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {labels.channels[ch]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prefs.map((pref) => (
            <tr
              key={pref.type}
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <td className="py-3 px-4 font-medium" style={{ color: 'var(--foreground)' }}>
                {labels.types[pref.type as NotificationType] ?? pref.type}
              </td>
              {(
                [
                  ['in_app', 'inApp'],
                  ['email', 'email'],
                  ['push', 'push'],
                ] as [keyof PreferenceRow, 'inApp' | 'email' | 'push'][]
              ).map(([field]) => (
                <td key={field} className="py-3 px-4 text-center">
                  <button
                    role="switch"
                    aria-checked={pref[field] as boolean}
                    disabled={saving === `${pref.type}-${field}`}
                    onClick={() =>
                      toggle(
                        pref.type as NotificationType,
                        field as 'in_app' | 'email' | 'push',
                        !(pref[field] as boolean)
                      )
                    }
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      saving === `${pref.type}-${field}`
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }`}
                    style={{
                      background: pref[field] ? 'var(--accent-foreground)' : 'var(--muted)',
                    }}
                  >
                    <span
                      className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5"
                      style={{
                        transform: pref[field] ? 'translateX(16px)' : 'translateX(2px)',
                      }}
                    />
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Navigate to `/en/settings/notifications`. Verify:
- 8 rows appear, one per notification type
- Each row has 3 toggles (In-app, Email, Push)
- Toggling a switch persists after page refresh
- Page renders correctly in Arabic at `/ar/settings/notifications`

- [ ] **Step 4: Commit**

```bash
git add "src/app/[lang]/(app)/settings/"
git commit -m "feat(notifications): add notification preferences page"
```

---

### Task 13: Vercel cron config + env checklist

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json**

`vercel.json` does not exist. Create it:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 7 * * *"
    }
  ]
}
```

This fires the cron route daily at 07:00 UTC. Vercel auto-injects `CRON_SECRET` and passes it as the `Authorization` header.

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run
```

Expected: all tests pass with no failures.

- [ ] **Step 3: Verify env vars checklist**

Confirm each variable is set in Vercel dashboard (Settings → Environment Variables):

| Variable | Status | Notes |
|---|---|---|
| `RESEND_API_KEY` | Required now | Resend email delivery |
| `INTERNAL_NOTIFY_SECRET` | Required now | Set in Task 6 |
| `NEXT_PUBLIC_APP_URL` | Required now | Set in Task 6 for Edge Function |
| `APNS_KEY` | Required when APNs is configured | base64 .p8 key |
| `APNS_KEY_ID` | Required when APNs is configured | 10-char key ID |
| `APNS_TEAM_ID` | Required when APNs is configured | Apple Team ID |
| `APNS_BUNDLE_ID` | Required when APNs is configured | e.g. `ai.passboard.app` |
| `CRON_SECRET` | Auto-injected by Vercel | No action needed |

APNs vars can remain unset until App Store Connect certificates are ready — `sendPush()` skips silently when they're absent.

- [ ] **Step 4: Final commit**

```bash
git add vercel.json
git commit -m "feat(notifications): add Vercel cron schedule for daily notification checks"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| `notifications` table | 1 |
| `notification_preferences` table | 1 |
| `device_tokens` table | 1 |
| `announcements` table | 1 |
| `profiles.last_active_at` + trigger | 1 |
| `NotificationType` enum + interfaces | 1 |
| `notify()` core + in-app channel | 2 |
| `notifyMany()` | 2 |
| Email delivery via Resend | 3 |
| iOS push via APNs (stale token cleanup) | 4 |
| `GET/PATCH /api/notifications` | 5 |
| `GET/PATCH /api/notifications/preferences` (lazy defaults) | 5 |
| `POST/DELETE /api/device-tokens` | 5 |
| Internal relay route | 6 |
| case-lab-analyze Edge Function wiring | 6 |
| Access approved trigger | 7 |
| Mock exam result trigger | 7 |
| `checkExamCountdown` (1/7/30 days) | 8 |
| `checkStudyPlanReminder` | 8 |
| `checkAccessExpiring` | 8 |
| `checkInactivity` | 8 |
| `runCleanup` (90-day purge) | 8 |
| Daily cron route + auth guard | 8 |
| Admin announcement route + fan-out | 9 |
| Bilingual dictionary labels | 10 |
| `NotificationBell` + Realtime badge | 11 |
| `NotificationPanel` (grouped, read/unread) | 11 |
| AppSidebar integration | 11 |
| Notification preferences page | 12 |
| `vercel.json` cron config | 13 |
| Env var checklist | 3, 4, 6, 13 |

All spec requirements covered. ✓

### Placeholder scan

No TBD, TODO, or vague steps. All code blocks contain complete implementations. ✓

### Type consistency

- `NotificationType`, `NotifyOptions`, `NotificationRow`, `PreferenceRow` defined in Task 1, used consistently in Tasks 2–12.
- `notify(options: NotifyOptions)` defined in Task 2, consumed in Tasks 7, 8, 9.
- `notifyMany(userIds: string[], options: Omit<NotifyOptions, 'userId'>)` defined in Task 2, consumed in Tasks 8 and 9.
- `sendEmail(to, name, title, body)` and `sendPush(userId, title, body)` stubs created in Task 2, implemented in Tasks 3 and 4 with matching signatures. ✓
