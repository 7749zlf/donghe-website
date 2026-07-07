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

create table if not exists public.design_awards (
  id text primary key,
  title text not null default '',
  "desc" text not null default '',
  year text not null default '',
  image text not null default '',
  image_alt text not null default '',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.design_awards enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-images',
  'case-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.design_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.design_admins enable row level security;

drop policy if exists "Admins can read own access" on public.design_admins;
create policy "Admins can read own access"
on public.design_admins
for select
to authenticated
using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or email = coalesce(auth.jwt() ->> 'phone', '')
);

create or replace function public.is_design_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.design_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       or email = coalesce(auth.jwt() ->> 'phone', '')
  );
$$;

grant execute on function public.is_design_admin() to authenticated;

-- 把下面的邮箱或手机号换成你的 Supabase 登录账号，然后运行一次即可授权。
-- 手机号请使用 Supabase Auth 中的 E.164 格式，例如 +8613812345678。
insert into public.design_admins (email)
values ('2231913537@qq.com')
on conflict (email) do nothing;

drop policy if exists "Public can read design cases" on public.design_cases;
create policy "Public can read design cases"
on public.design_cases
for select
to anon, authenticated
using (hidden = false or public.is_design_admin());

drop policy if exists "Public can insert design cases" on public.design_cases;
drop policy if exists "Admin can insert design cases" on public.design_cases;
create policy "Admin can insert design cases"
on public.design_cases
for insert
to authenticated
with check (public.is_design_admin());

drop policy if exists "Public can update design cases" on public.design_cases;
drop policy if exists "Admin can update design cases" on public.design_cases;
create policy "Admin can update design cases"
on public.design_cases
for update
to authenticated
using (public.is_design_admin())
with check (public.is_design_admin());

drop policy if exists "Public can delete design cases" on public.design_cases;
drop policy if exists "Admin can delete design cases" on public.design_cases;
create policy "Admin can delete design cases"
on public.design_cases
for delete
to authenticated
using (public.is_design_admin());

drop policy if exists "Public can read design awards" on public.design_awards;
create policy "Public can read design awards"
on public.design_awards
for select
to anon, authenticated
using (true);

drop policy if exists "Admin can insert design awards" on public.design_awards;
create policy "Admin can insert design awards"
on public.design_awards
for insert
to authenticated
with check (public.is_design_admin());

drop policy if exists "Admin can update design awards" on public.design_awards;
create policy "Admin can update design awards"
on public.design_awards
for update
to authenticated
using (public.is_design_admin())
with check (public.is_design_admin());

drop policy if exists "Admin can delete design awards" on public.design_awards;
create policy "Admin can delete design awards"
on public.design_awards
for delete
to authenticated
using (public.is_design_admin());

drop policy if exists "Public can read case images" on storage.objects;
create policy "Public can read case images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'case-images');

drop policy if exists "Admin can upload case images" on storage.objects;
create policy "Admin can upload case images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'case-images' and public.is_design_admin());

drop policy if exists "Admin can update case images" on storage.objects;
create policy "Admin can update case images"
on storage.objects
for update
to authenticated
using (bucket_id = 'case-images' and public.is_design_admin())
with check (bucket_id = 'case-images' and public.is_design_admin());

drop policy if exists "Admin can delete case images" on storage.objects;
create policy "Admin can delete case images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'case-images' and public.is_design_admin());
