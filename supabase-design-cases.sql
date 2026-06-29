create table if not exists public.design_cases (
  id text primary key,
  name text not null,
  category text not null default '商业空间',
  type text not null default '',
  year text not null default '',
  url text not null default '',
  images text[] not null default '{}',
  image text not null default '',
  note text not null default '',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.design_cases enable row level security;

drop policy if exists "Public can read design cases" on public.design_cases;
create policy "Public can read design cases"
on public.design_cases
for select
to anon
using (true);

drop policy if exists "Public can insert design cases" on public.design_cases;
create policy "Public can insert design cases"
on public.design_cases
for insert
to anon
with check (true);

drop policy if exists "Public can update design cases" on public.design_cases;
create policy "Public can update design cases"
on public.design_cases
for update
to anon
using (true)
with check (true);

drop policy if exists "Public can delete design cases" on public.design_cases;
create policy "Public can delete design cases"
on public.design_cases
for delete
to anon
using (true);
