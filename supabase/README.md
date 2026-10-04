# Passboard — Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New project** and fill in:
   - **Name**: `passboard` (or any name you prefer)
   - **Database Password**: choose a strong password and save it securely
   - **Region**: pick the region closest to your users
3. Wait for the project to finish provisioning (about 1-2 minutes).
4. Copy the **Project URL** and **anon/public API key** from **Settings > API** — you will need these for your `.env.local` file.

## 2. Run the Migrations

### Option A: Supabase SQL Editor (recommended for first setup)

1. In your Supabase project dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Open `migrations/001_initial_schema.sql`, copy the entire contents, paste into the editor, and click **Run**.
4. Open `migrations/002_seed_data.sql`, copy the entire contents, paste into a new query, and click **Run**.

### Option B: Supabase CLI

If you have the Supabase CLI installed (`npm install -g supabase`):

```bash
# Link to your remote project (run once)
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

Your project ref is the string in your Supabase project URL:
`https://app.supabase.com/project/<your-project-ref>`

## 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

## 4. Create the First Admin Account

Supabase Auth handles user sign-ups, and the database trigger in `001_initial_schema.sql` automatically creates a row in `public.profiles` for each new user. New users start with `role = 'student'` and `access_status = 'pending'`.

To promote a user to admin after they sign up:

1. Go to **Supabase Dashboard > Authentication > Users** and find the user's UUID.
2. Go to **SQL Editor** and run:

```sql
update public.profiles
set
  role = 'admin',
  access_status = 'active'
where id = '<user-uuid-here>';
```

Replace `<user-uuid-here>` with the actual UUID shown in the Authentication > Users table.

Alternatively, go to **Table Editor > profiles**, find the row for the admin user, and edit the `role` and `access_status` columns directly.

## 5. Granting Student Access

To activate a student account (e.g., after payment is confirmed):

```sql
update public.profiles
set
  access_status = 'active',
  access_expires_at = now() + interval '1 year'   -- or null for lifetime access
where email = 'student@example.com';
```

You can also update the corresponding `access_requests` row to mark it as approved:

```sql
update public.access_requests
set status = 'approved'
where email = 'student@example.com';
```

## Schema Overview

| Table | Purpose |
|-------|---------|
| `profiles` | Extended user info linked to `auth.users` |
| `access_requests` | Pre-signup interest/waitlist submissions |
| `questions` | MCQ question bank |
| `question_attempts` | Per-question practice attempt history |
| `mock_exams` | Mock exam sessions |
| `mock_exam_questions` | Questions assigned to a mock exam |
| `mock_answers` | Student answers within a mock exam |
| `ai_conversations` | AI tutor conversation threads |
| `ai_messages` | Individual messages within a conversation |

Row Level Security is enabled on all tables. Students can only access published questions when their `access_status = 'active'`. Admins have full read/write access across all tables.
