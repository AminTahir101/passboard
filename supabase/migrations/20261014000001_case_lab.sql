-- Case Lab schema
-- Spec: docs/superpowers/specs/2026-10-14-case-lab-design.md

-- Pseudonymous patient records (no names, no national IDs)
create table if not exists patients (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  pseudonym   text not null,
  birth_year  smallint,
  sex         text check (sex in ('male', 'female', 'other', 'unknown')),
  fitzpatrick smallint check (fitzpatrick between 1 and 6),
  created_at  timestamptz not null default now()
);

-- One case per upload session
create table if not exists cases (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid references patients(id) on delete set null,
  owner_id         uuid not null references auth.users(id) on delete cascade,
  mode             text not null default 'student' check (mode = 'student'),
  status           text not null default 'draft'
                     check (status in ('draft','images_uploaded','ocr_pending','ocr_done','analyzing','done','failed')),
  chief_complaint  text,
  history_json     jsonb,
  consent_at       timestamptz,
  model_version    text not null default 'caselab-v1.0',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Up to 6 images per case
create table if not exists case_images (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references cases(id) on delete cascade,
  storage_path  text not null,
  body_site     text,
  view          text check (view in ('close-up','overview','other')),
  captured_at   date,
  quality_json  jsonb,
  faces_blurred boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Uploaded PDFs and documents
create table if not exists case_documents (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references cases(id) on delete cascade,
  storage_path    text not null,
  doc_type        text,
  ocr_engine      text,
  ocr_confidence  numeric(5,2),
  created_at      timestamptz not null default now()
);

-- Values extracted by OCR worker, confirmed by student
create table if not exists case_extracted_values (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references case_documents(id) on delete cascade,
  loinc         text,
  name          text not null,
  value         text not null,
  unit          text,
  ref_range     text,
  flag          text,
  observed_at   date,
  confidence    numeric(5,2),
  confirmed_by  uuid references auth.users(id),
  page          smallint
);

-- AI analysis result (one per case, re-runnable)
create table if not exists case_analyses (
  id               uuid primary key default gen_random_uuid(),
  case_id          uuid not null references cases(id) on delete cascade,
  findings_json    jsonb,
  differential_json jsonb,
  urgency          text check (urgency in ('emergency','urgent','routine')),
  agreement        numeric(4,3),
  abstained        boolean not null default false,
  prompt_version   text not null default 'caselab-v1.0',
  tokens           integer,
  latency_ms       integer,
  created_at       timestamptz not null default now()
);

-- Rendered report (JSON + optional PDF path)
create table if not exists case_reports (
  id           uuid primary key default gen_random_uuid(),
  analysis_id  uuid not null references case_analyses(id) on delete cascade,
  lang         text not null default 'en',
  audience     text not null default 'student',
  content_json jsonb not null,
  pdf_path     text,
  released_at  timestamptz,
  signed_by    uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- Student feedback
create table if not exists case_feedback (
  id                    uuid primary key default gen_random_uuid(),
  case_id               uuid not null references cases(id) on delete cascade,
  final_diagnosis_icd   text,
  confirmation          text,
  verdict               text check (verdict in ('correct','partial','wrong')),
  notes                 text,
  created_at            timestamptz not null default now()
);

-- Full audit trail
create table if not exists case_audit_log (
  id       uuid primary key default gen_random_uuid(),
  case_id  uuid not null references cases(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action   text not null,
  at       timestamptz not null default now(),
  ip_hash  text
);

-- Async OCR job queue
create table if not exists case_jobs (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references cases(id) on delete cascade,
  document_id uuid references case_documents(id) on delete cascade,
  status      text not null default 'pending'
                check (status in ('pending','processing','done','failed')),
  attempts    smallint not null default 0,
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Updated_at trigger for cases
create or replace function update_cases_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_cases_updated_at();

-- RLS: each table is visible only to its owner
alter table patients          enable row level security;
alter table cases             enable row level security;
alter table case_images       enable row level security;
alter table case_documents    enable row level security;
alter table case_extracted_values enable row level security;
alter table case_analyses     enable row level security;
alter table case_reports      enable row level security;
alter table case_feedback     enable row level security;
alter table case_audit_log    enable row level security;
alter table case_jobs         enable row level security;

create policy "owner_only" on patients        using (owner_id = auth.uid());
create policy "owner_only" on cases           using (owner_id = auth.uid());
create policy "owner_only" on case_images     using (
  case_id in (select id from cases where owner_id = auth.uid()));
create policy "owner_only" on case_documents  using (
  case_id in (select id from cases where owner_id = auth.uid()));
create policy "owner_only" on case_extracted_values using (
  document_id in (
    select cd.id from case_documents cd
    join cases c on c.id = cd.case_id
    where c.owner_id = auth.uid()));
create policy "owner_only" on case_analyses   using (
  case_id in (select id from cases where owner_id = auth.uid()));
create policy "owner_only" on case_reports    using (
  analysis_id in (
    select ca.id from case_analyses ca
    join cases c on c.id = ca.case_id
    where c.owner_id = auth.uid()));
create policy "owner_only" on case_feedback   using (
  case_id in (select id from cases where owner_id = auth.uid()));
create policy "owner_only" on case_audit_log  using (
  case_id in (select id from cases where owner_id = auth.uid()));
create policy "owner_only" on case_jobs       using (
  case_id in (select id from cases where owner_id = auth.uid()));
