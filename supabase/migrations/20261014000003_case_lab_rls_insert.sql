-- Fix Case Lab RLS: add WITH CHECK for INSERT on all child tables.
-- The original policies used USING only, which covers SELECT/UPDATE/DELETE
-- but NOT INSERT — Postgres blocks inserts by default when RLS is enabled.

-- case_images
create policy "owner_only_insert" on case_images
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- case_documents
create policy "owner_only_insert" on case_documents
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- case_extracted_values
create policy "owner_only_insert" on case_extracted_values
  for insert with check (
    document_id in (
      select cd.id from case_documents cd
      join cases c on c.id = cd.case_id
      where c.owner_id = auth.uid()
    )
  );

-- case_analyses
create policy "owner_only_insert" on case_analyses
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- case_reports
create policy "owner_only_insert" on case_reports
  for insert with check (
    analysis_id in (
      select ca.id from case_analyses ca
      join cases c on c.id = ca.case_id
      where c.owner_id = auth.uid()
    )
  );

-- case_feedback
create policy "owner_only_insert" on case_feedback
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- case_audit_log
create policy "owner_only_insert" on case_audit_log
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- case_jobs
create policy "owner_only_insert" on case_jobs
  for insert with check (
    case_id in (select id from cases where owner_id = auth.uid())
  );

-- cases itself: allow authenticated users to insert their own rows
create policy "owner_only_insert" on cases
  for insert with check (owner_id = auth.uid());
