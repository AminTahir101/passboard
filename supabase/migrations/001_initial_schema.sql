-- ============================================================
-- Moraje3 - Medical Licensing Exam Prep Platform
-- Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Check if the current user has active access
create or replace function public.has_active_access()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and access_status = 'active'
      and (access_expires_at is null or access_expires_at > now())
  );
$$;

-- ============================================================
-- TABLES
-- ============================================================

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text not null unique,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  target_exam text,
  exam_date date,
  access_status text not null default 'pending' check (access_status in ('pending', 'active', 'suspended', 'expired')),
  access_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ACCESS REQUESTS
create table public.access_requests (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null,
  phone text,
  target_exam text,
  expected_exam_date date,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'paid', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger access_requests_updated_at
  before update on public.access_requests
  for each row execute function public.handle_updated_at();

-- QUESTIONS
create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer char(1) not null check (correct_answer in ('A', 'B', 'C', 'D')),
  justification text,
  explanation_a text,
  explanation_b text,
  explanation_c text,
  explanation_d text,
  exam text,
  category text,
  topic text,
  subtopic text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  year integer,
  source text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger questions_updated_at
  before update on public.questions
  for each row execute function public.handle_updated_at();

-- QUESTION ATTEMPTS
create table public.question_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer char(1) not null check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);

-- MOCK EXAMS
create table public.mock_exams (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_name text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  question_count integer not null default 0,
  score integer,
  percentage numeric(5, 2),
  duration_seconds integer
);

-- MOCK EXAM QUESTIONS
create table public.mock_exam_questions (
  id uuid primary key default uuid_generate_v4(),
  mock_exam_id uuid not null references public.mock_exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  position integer not null,
  flagged boolean not null default false,
  unique (mock_exam_id, question_id)
);

-- MOCK ANSWERS
create table public.mock_answers (
  id uuid primary key default uuid_generate_v4(),
  mock_exam_id uuid not null references public.mock_exams(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_answer char(1) check (selected_answer in ('A', 'B', 'C', 'D')),
  is_correct boolean,
  unique (mock_exam_id, question_id)
);

-- AI CONVERSATIONS
create table public.ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  question_id uuid references public.questions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.handle_updated_at();

-- AI MESSAGES
create table public.ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_question_attempts_user_id on public.question_attempts(user_id);
create index idx_question_attempts_question_id on public.question_attempts(question_id);
create index idx_mock_exams_user_id on public.mock_exams(user_id);
create index idx_mock_exam_questions_mock_exam_id on public.mock_exam_questions(mock_exam_id);
create index idx_mock_answers_mock_exam_id on public.mock_answers(mock_exam_id);
create index idx_ai_conversations_user_id on public.ai_conversations(user_id);
create index idx_ai_messages_conversation_id on public.ai_messages(conversation_id);
create index idx_questions_status on public.questions(status);
create index idx_questions_category on public.questions(category);
create index idx_questions_topic on public.questions(topic);
create index idx_questions_exam on public.questions(exam);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.access_requests enable row level security;
alter table public.questions enable row level security;
alter table public.question_attempts enable row level security;
alter table public.mock_exams enable row level security;
alter table public.mock_exam_questions enable row level security;
alter table public.mock_answers enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

-- ---- PROFILES ----

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (public.is_admin());

-- ---- ACCESS REQUESTS ----

create policy "Anyone can submit an access request"
  on public.access_requests for insert
  with check (true);

create policy "Admins can view all access requests"
  on public.access_requests for select
  using (public.is_admin());

create policy "Admins can update access requests"
  on public.access_requests for update
  using (public.is_admin());

-- ---- QUESTIONS ----

create policy "Active users can read published questions"
  on public.questions for select
  using (
    (status = 'published' and public.has_active_access())
    or public.is_admin()
  );

create policy "Admins can insert questions"
  on public.questions for insert
  with check (public.is_admin());

create policy "Admins can update questions"
  on public.questions for update
  using (public.is_admin());

create policy "Admins can delete questions"
  on public.questions for delete
  using (public.is_admin());

-- ---- QUESTION ATTEMPTS ----

create policy "Users can insert their own attempts"
  on public.question_attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read their own attempts"
  on public.question_attempts for select
  using (auth.uid() = user_id or public.is_admin());

-- ---- MOCK EXAMS ----

create policy "Users can manage their own mock exams"
  on public.mock_exams for all
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert their own mock exams"
  on public.mock_exams for insert
  with check (auth.uid() = user_id);

-- ---- MOCK EXAM QUESTIONS ----

create policy "Users can manage their own mock exam questions"
  on public.mock_exam_questions for all
  using (
    exists (
      select 1 from public.mock_exams
      where mock_exams.id = mock_exam_questions.mock_exam_id
        and (mock_exams.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert mock exam questions"
  on public.mock_exam_questions for insert
  with check (
    exists (
      select 1 from public.mock_exams
      where mock_exams.id = mock_exam_questions.mock_exam_id
        and mock_exams.user_id = auth.uid()
    )
  );

-- ---- MOCK ANSWERS ----

create policy "Users can manage their own mock answers"
  on public.mock_answers for all
  using (
    exists (
      select 1 from public.mock_exams
      where mock_exams.id = mock_answers.mock_exam_id
        and (mock_exams.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert mock answers"
  on public.mock_answers for insert
  with check (
    exists (
      select 1 from public.mock_exams
      where mock_exams.id = mock_answers.mock_exam_id
        and mock_exams.user_id = auth.uid()
    )
  );

-- ---- AI CONVERSATIONS ----

create policy "Users can manage their own AI conversations"
  on public.ai_conversations for all
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert AI conversations"
  on public.ai_conversations for insert
  with check (auth.uid() = user_id);

-- ---- AI MESSAGES ----

create policy "Users can manage their own AI messages"
  on public.ai_messages for all
  using (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
        and (ai_conversations.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users can insert AI messages"
  on public.ai_messages for insert
  with check (
    exists (
      select 1 from public.ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
        and ai_conversations.user_id = auth.uid()
    )
  );
