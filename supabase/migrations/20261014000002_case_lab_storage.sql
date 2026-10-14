-- Create the private storage bucket for Case Lab media
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-media',
  'case-media',
  false,
  20971520,  -- 20 MB
  array[
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload to their own folder (uid/case-id/*)
create policy "Users upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'case-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'case-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'case-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
