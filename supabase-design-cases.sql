create table if not exists public.design_cases (
  id text primary key,
  name text not null,
  category text not null default '商业空间',
  style text not null default '',
  type text not null default '',
  year text not null default '',
  url text not null default '',
  images text[] not null default '{}',
  image text not null default '',
  note text not null default '',
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.design_cases
add column if not exists style text not null default '';

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

drop policy if exists "Public can read design awards" on public.design_awards;
create policy "Public can read design awards"
on public.design_awards
for select
to anon, authenticated
using (hidden = false or public.is_design_admin());

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

-- 报价单使用单行 JSON 明细，保存时可保证整份报价原子更新。
create table if not exists public.design_quotes (
  id text primary key,
  quote_no text not null unique,
  public_token text not null unique,
  client_name text not null default '',
  client_phone text not null default '',
  project_name text not null default '',
  project_address text not null default '',
  category text not null default '居住空间',
  style text not null default '',
  area numeric not null default 0 check (area >= 0),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'expired', 'void')),
  issue_date date not null default current_date,
  valid_until date,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  discount numeric not null default 0 check (discount >= 0),
  tax_rate numeric not null default 0 check (tax_rate >= 0),
  deposit_rate numeric not null default 30 check (deposit_rate between 0 and 100),
  payment_terms text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists design_quotes_status_idx
on public.design_quotes (status);

create index if not exists design_quotes_updated_at_idx
on public.design_quotes (updated_at desc);

alter table public.design_quotes enable row level security;

grant select, insert, update, delete on public.design_quotes to authenticated;

drop policy if exists "Admin can read design quotes" on public.design_quotes;
create policy "Admin can read design quotes"
on public.design_quotes
for select
to authenticated
using (public.is_design_admin());

drop policy if exists "Admin can insert design quotes" on public.design_quotes;
create policy "Admin can insert design quotes"
on public.design_quotes
for insert
to authenticated
with check (public.is_design_admin());

drop policy if exists "Admin can update design quotes" on public.design_quotes;
create policy "Admin can update design quotes"
on public.design_quotes
for update
to authenticated
using (public.is_design_admin())
with check (public.is_design_admin());

drop policy if exists "Admin can delete design quotes" on public.design_quotes;
create policy "Admin can delete design quotes"
on public.design_quotes
for delete
to authenticated
using (public.is_design_admin());

-- 客户只能凭随机令牌读取已发送、已确认或已过期的单张报价。
create or replace function public.get_public_design_quote(access_token text)
returns setof public.design_quotes
language sql
stable
security definer
set search_path = public
as $$
  select quote.*
  from public.design_quotes as quote
  where quote.public_token = access_token
    and quote.status in ('sent', 'accepted', 'expired')
  limit 1;
$$;

revoke all on function public.get_public_design_quote(text) from public;
grant execute on function public.get_public_design_quote(text) to anon, authenticated;
