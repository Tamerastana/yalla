-- Minimal stand-in for Supabase's built-in auth schema, used ONLY to
-- validate schema.sql locally against a plain Postgres instance. Never run
-- this against a real Supabase project (it already has a real auth schema).
create schema if not exists auth;

create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

create or replace function auth.uid() returns uuid as $$
  select current_setting('request.jwt.claim.sub', true)::uuid;
$$ language sql stable;
