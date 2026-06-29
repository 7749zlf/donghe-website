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
using (lower(email) = lower(auth.jwt() ->> 'email'));

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
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

grant execute on function public.is_design_admin() to authenticated;

-- 把下面的邮箱换成你的 Supabase 登录邮箱，然后运行一次即可授权。
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
