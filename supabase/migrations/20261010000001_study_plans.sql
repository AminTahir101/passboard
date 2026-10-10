-- Study Plans feature
-- Stores a student's personalised study schedule up to their exam date.

create table if not exists study_plans (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references profiles(id) on delete cascade,
  exam              text        not null,
  exam_date         date        not null,
  study_days        integer[]   not null,          -- 0=Sun 1=Mon … 6=Sat
  questions_per_day integer     not null default 20,
  mock_day          integer,                       -- day-of-week for weekly mock, null = none
  mock_size         integer,                       -- 50 or 100
  focus_specialties text[]      not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists study_plans_user_unique on study_plans(user_id);

create table if not exists study_tasks (
  id             uuid        primary key default gen_random_uuid(),
  plan_id        uuid        not null references study_plans(id) on delete cascade,
  user_id        uuid        not null references profiles(id) on delete cascade,
  scheduled_date date        not null,
  task_type      text        not null check (task_type in ('practice','mock_exam','review')),
  phase          text        not null check (phase in ('foundation','reinforcement','final_review')),
  specialty      text,
  question_count integer     not null,
  completed      boolean     not null default false,
  completed_at   timestamptz,
  position       integer     not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists study_tasks_plan_date on study_tasks(plan_id, scheduled_date);
create index if not exists study_tasks_user_date on study_tasks(user_id, scheduled_date);

-- RLS
alter table study_plans enable row level security;
alter table study_tasks  enable row level security;

create policy "Users manage their own study plan"
  on study_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own study tasks"
  on study_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
