-- Add proof fields to payouts
alter table payouts add column if not exists proof_url text;
alter table payouts add column if not exists proof_submitted_at timestamp;
alter table payouts add column if not exists admin_note text;

-- Storage bucket for winner proofs
insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users upload own proofs"
on storage.objects for insert
with check (bucket_id = 'proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read own proofs"
on storage.objects for select
using (bucket_id = 'proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Admin read all proofs"
on storage.objects for select
using (bucket_id = 'proofs');
