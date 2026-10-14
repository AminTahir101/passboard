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
  id         uuid primary key default gen_random_uuid(),
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
create index notifications_unread on public.notifications(user_id) where read_at is null;
alter table public.notifications enable row level security;
-- INSERT intentionally omitted: all notification rows are written by the service-role
-- client (server-side only), which bypasses RLS. Users cannot self-insert notifications.
create policy "users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- 3. notification_preferences
create table public.notification_preferences (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type    text not null,
  in_app  boolean not null default true,
  email   boolean not null default true,
  push    boolean not null default true,
  unique (user_id, type)
);
alter table public.notification_preferences enable row level security;
create policy "users manage own preferences" on public.notification_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. device_tokens
create table public.device_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  token        text not null unique,
  platform     text not null default 'ios',
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.device_tokens enable row level security;
create policy "users manage own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. announcements
create table public.announcements (
  id              uuid primary key default gen_random_uuid(),
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

-- Enable Realtime for the notifications table so clients can subscribe to live inserts
alter publication supabase_realtime add table public.notifications;
