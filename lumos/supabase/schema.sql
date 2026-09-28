-- Lumos Global Education — database schema.
-- Paste this whole file into Supabase → SQL Editor → New query, and press Run.
-- Safe to run more than once.

-- ── Admins ────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
  for select to authenticated using (public.is_admin());

-- ── Website content (texts EN/RU, prices, links, images) ─────────────────
create table if not exists public.site_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;

drop policy if exists "anyone reads content" on public.site_content;
create policy "anyone reads content" on public.site_content
  for select to anon, authenticated using (true);

drop policy if exists "admins insert content" on public.site_content;
create policy "admins insert content" on public.site_content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update content" on public.site_content;
create policy "admins update content" on public.site_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Consultation requests from the website form ──────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text not null check (char_length(phone) between 3 and 40),
  email text check (email is null or char_length(email) <= 160),
  interest text check (interest is null or char_length(interest) <= 200),
  package text check (package is null or char_length(package) <= 120),
  message text check (message is null or char_length(message) <= 2000),
  lang text check (lang is null or lang in ('en', 'ru')),
  status text not null default 'new' check (status in ('new', 'contacted', 'applied', 'enrolled', 'closed')),
  notes text
);
alter table public.leads enable row level security;

-- Visitors may only submit new requests; they can never read them back.
drop policy if exists "anyone submits a lead" on public.leads;
create policy "anyone submits a lead" on public.leads
  for insert to anon, authenticated
  with check (status = 'new' and notes is null);

drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update leads" on public.leads;
create policy "admins update leads" on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete leads" on public.leads;
create policy "admins delete leads" on public.leads
  for delete to authenticated using (public.is_admin());

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- ── Image uploads (public bucket; only admins can write) ─────────────────
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

drop policy if exists "anyone reads site images" on storage.objects;
create policy "anyone reads site images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'site-images');

drop policy if exists "admins upload site images" on storage.objects;
create policy "admins upload site images" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "admins update site images" on storage.objects;
create policy "admins update site images" on storage.objects
  for update to authenticated using (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "admins delete site images" on storage.objects;
create policy "admins delete site images" on storage.objects
  for delete to authenticated using (bucket_id = 'site-images' and public.is_admin());
