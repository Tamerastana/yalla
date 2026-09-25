-- Yalla database schema
-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- Safe to re-run: it drops and recreates everything it owns.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('user', 'company', 'super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_category as enum ('football','running','padel','yoga','cycling','swimming','basketball','hiking','cricket','watersports','fitness','multi-sport');
exception when duplicate_object then null; end $$;

do $$ begin
  create type emirate as enum ('Dubai','Abu Dhabi','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Umm Al Quwain');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum ('official', 'community');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('upcoming', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum ('registered', 'cancelled', 'attended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type friendship_status as enum ('pending', 'accepted', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type points_kind as enum ('earned', 'redeemed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type redemption_status as enum ('issued', 'used');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  role user_role not null default 'user',
  bio text,
  city emirate,
  home_lat double precision,
  home_lng double precision,
  company_name text,
  company_industry text,
  company_website text,
  company_about text,
  company_verified boolean not null default false,
  company_verified_at timestamptz,
  company_verified_by uuid references profiles(id),
  /** Admin "removed" a company without destroying its history — see set_company_active(). */
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  category event_category not null,
  type event_type not null default 'community',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_name text not null,
  address text not null default '',
  emirate emirate not null,
  lat double precision not null,
  lng double precision not null,
  capacity int not null default 0,
  price_aed numeric not null default 0,
  points_per_attendee int not null default 0,
  image_url text not null default '',
  is_promoted boolean not null default false,
  promoted_until timestamptz,
  promotion_tier smallint,
  status event_status not null default 'upcoming',
  created_at timestamptz not null default now(),
  constraint events_time_order check (ends_at > starts_at)
);

create index if not exists events_host_idx on events(host_id);
create index if not exists events_starts_at_idx on events(starts_at);

-- ---------------------------------------------------------------------------
-- registrations
-- ---------------------------------------------------------------------------
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  registered_at timestamptz not null default now(),
  status registration_status not null default 'registered',
  points_awarded int,
  unique (event_id, user_id)
);

create index if not exists registrations_event_idx on registrations(event_id);
create index if not exists registrations_user_idx on registrations(user_id);

-- ---------------------------------------------------------------------------
-- friendships
-- ---------------------------------------------------------------------------
create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles(id) on delete cascade,
  addressee_id uuid not null references profiles(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint no_self_friend check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_idx on friendships(requester_id);
create index if not exists friendships_addressee_idx on friendships(addressee_id);

-- ---------------------------------------------------------------------------
-- points_entries (per-company ledger, like airline miles)
-- ---------------------------------------------------------------------------
create table if not exists points_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  company_id uuid not null references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  points int not null check (points >= 0),
  kind points_kind not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists points_user_company_idx on points_entries(user_id, company_id);

-- ---------------------------------------------------------------------------
-- rewards
-- ---------------------------------------------------------------------------
create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  cost_points int not null check (cost_points > 0),
  image_url text not null default '',
  stock int not null default 0,
  active boolean not null default true
);

create index if not exists rewards_company_idx on rewards(company_id);

-- ---------------------------------------------------------------------------
-- redemptions
-- ---------------------------------------------------------------------------
create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  reward_id uuid not null references rewards(id) on delete cascade,
  company_id uuid not null references profiles(id) on delete cascade,
  points_spent int not null,
  redeemed_at timestamptz not null default now(),
  code text not null unique,
  status redemption_status not null default 'issued'
);

create index if not exists redemptions_user_idx on redemptions(user_id);

-- ---------------------------------------------------------------------------
-- New auth user -> profile row
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, phone, role, company_name, company_industry)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'),
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'company_industry'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Guard: only a super_admin can change role / company_verified through the
-- app (PostgREST, where auth.uid() reflects the caller's JWT), even via a
-- direct table update — defense in depth on top of the RPCs below.
--
-- auth.uid() is NULL for anything run outside a user request — the
-- Supabase SQL Editor, a migration, psql with the postgres role. That's the
-- project owner's own trusted connection (running SQL there already implies
-- full database access), so it intentionally skips this guard rather than
-- being locked out of bootstrapping the very first admin account.
-- ---------------------------------------------------------------------------
create or replace function protect_profile_privileged_columns()
returns trigger as $$
begin
  if auth.uid() is not null
     and not exists (select 1 from profiles where id = auth.uid() and role = 'super_admin') then
    new.role := old.role;
    new.company_verified := old.company_verified;
    new.company_verified_at := old.company_verified_at;
    new.company_verified_by := old.company_verified_by;
    new.is_active := old.is_active;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists protect_profile_columns on profiles;
create trigger protect_profile_columns
  before update on profiles
  for each row execute function protect_profile_privileged_columns();

-- ---------------------------------------------------------------------------
-- Guard: only a verified company can create an official, points-earning
-- event. Anyone else's event is silently downgraded to community/0 points.
-- This is the server-side anti-abuse gate for the points system.
-- ---------------------------------------------------------------------------
create or replace function enforce_official_event_rules()
returns trigger as $$
declare
  v_role user_role;
  v_verified boolean;
  v_active boolean;
begin
  select role, company_verified, is_active into v_role, v_verified, v_active from profiles where id = new.host_id;
  if new.type = 'official' and not (v_role = 'company' and coalesce(v_verified, false) and coalesce(v_active, true)) then
    new.type := 'community';
  end if;
  if new.type = 'community' then
    new.points_per_attendee := 0;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists enforce_official_event_rules_trigger on events;
create trigger enforce_official_event_rules_trigger
  before insert or update on events
  for each row execute function enforce_official_event_rules();

-- ---------------------------------------------------------------------------
-- Guard: reject a registration once an event is at capacity. Runs inside the
-- same transaction as the insert, so two near-simultaneous registrations
-- against the last open spot can't both succeed.
-- ---------------------------------------------------------------------------
create or replace function enforce_event_capacity()
returns trigger as $$
declare
  v_capacity int;
  v_count int;
begin
  select capacity into v_capacity from events where id = new.event_id for update;
  if v_capacity > 0 then
    select count(*) into v_count from registrations where event_id = new.event_id and status <> 'cancelled';
    if v_count >= v_capacity then
      raise exception 'This event is full';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists enforce_event_capacity_trigger on registrations;
create trigger enforce_event_capacity_trigger
  before insert on registrations
  for each row execute function enforce_event_capacity();

-- ---------------------------------------------------------------------------
-- RPC: mark a registrant attended. Only the event's host may call this.
-- Awards points atomically, only for official events, only once.
-- ---------------------------------------------------------------------------
create or replace function mark_attended(p_registration_id uuid)
returns void as $$
declare
  v_event_id uuid;
  v_user_id uuid;
  v_prev_status registration_status;
  v_host_id uuid;
  v_type event_type;
  v_points int;
begin
  select event_id, user_id, status into v_event_id, v_user_id, v_prev_status
  from registrations where id = p_registration_id;

  if v_event_id is null then
    raise exception 'Registration not found';
  end if;

  select host_id, type, points_per_attendee into v_host_id, v_type, v_points
  from events where id = v_event_id;

  if v_host_id <> auth.uid() then
    raise exception 'Only the event host can mark attendance';
  end if;

  update registrations set status = 'attended', points_awarded = v_points where id = p_registration_id;

  if v_prev_status <> 'attended' and v_type = 'official' and v_points > 0 then
    insert into points_entries (user_id, company_id, event_id, points, kind, note)
    values (v_user_id, v_host_id, v_event_id, v_points, 'earned', 'Attended event');
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: redeem a reward atomically (balance check, ledger entry, stock
-- decrement, redemption code) so two concurrent redemptions can't both
-- succeed off a stale balance/stock read.
-- ---------------------------------------------------------------------------
create or replace function redeem_reward(p_reward_id uuid)
returns table(redemption_id uuid, code text) as $$
declare
  v_company_id uuid;
  v_cost int;
  v_stock int;
  v_active boolean;
  v_balance int;
  v_code text;
  v_redemption_id uuid;
begin
  select company_id, cost_points, stock, active into v_company_id, v_cost, v_stock, v_active
  from rewards where id = p_reward_id for update;

  if v_company_id is null then
    raise exception 'Reward not found';
  end if;
  if not v_active or v_stock <= 0 then
    raise exception 'This reward is out of stock';
  end if;

  select coalesce(sum(case when kind = 'earned' then points else -points end), 0) into v_balance
  from points_entries where user_id = auth.uid() and company_id = v_company_id;

  if v_balance < v_cost then
    raise exception 'Not enough points for this reward';
  end if;

  -- md5()/random() are built into core Postgres, unlike gen_random_bytes()
  -- (pgcrypto), which Supabase installs outside the public schema — this
  -- function's search_path is pinned to public, so pgcrypto calls would
  -- fail here with "function does not exist".
  v_code := 'YALLA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  insert into points_entries (user_id, company_id, points, kind, note)
  values (auth.uid(), v_company_id, v_cost, 'redeemed', 'Redeemed reward');

  update rewards set stock = stock - 1 where id = p_reward_id;

  insert into redemptions (user_id, reward_id, company_id, points_spent, code, status)
  values (auth.uid(), p_reward_id, v_company_id, v_cost, v_code, 'issued')
  returning id into v_redemption_id;

  return query select v_redemption_id, v_code;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: verify a company. Only callable by a super_admin.
-- ---------------------------------------------------------------------------
create or replace function verify_company(p_company_id uuid)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'super_admin') then
    raise exception 'Only a Yalla admin can verify companies';
  end if;
  update profiles
  set company_verified = true, company_verified_at = now(), company_verified_by = auth.uid()
  where id = p_company_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: activate/deactivate a company. Only callable by a super_admin.
--
-- This is a soft "remove" for a company that's stopped operating: it stops
-- them creating new official events or rewards (enforce_official_event_rules
-- + rewards_insert_verified_company below both check is_active), but never
-- deletes anything — their past events, points already earned from them,
-- and issued redemption codes all stay exactly as they were. A hard delete
-- would cascade and destroy that history for every user who earned points
-- there, which is never what "this company doesn't work with us any more"
-- actually means.
-- ---------------------------------------------------------------------------
create or replace function set_company_active(p_company_id uuid, p_active boolean)
returns void as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'super_admin') then
    raise exception 'Only a Yalla admin can do this';
  end if;
  update profiles set is_active = p_active where id = p_company_id and role = 'company';
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RPC: redeem (fulfil) a reward code at the point of pickup. Only callable
-- by the company that issued it. This is the actual "verification system"
-- for handing over a reward — a code is worthless until a staff member at
-- that company looks it up here and it flips to 'used', which can only
-- happen once.
-- ---------------------------------------------------------------------------
create or replace function redeem_code(p_code text)
returns table(id uuid, user_id uuid, reward_id uuid, points_spent int, redeemed_at timestamptz, status redemption_status) as $$
declare
  v_id uuid;
  v_company_id uuid;
  v_status redemption_status;
begin
  select r.id, r.company_id, r.status into v_id, v_company_id, v_status
  from redemptions r where upper(r.code) = upper(trim(p_code));

  if v_id is null then
    raise exception 'No redemption found with that code';
  end if;
  if v_company_id <> auth.uid() then
    raise exception 'This code was not issued by your company';
  end if;
  if v_status = 'used' then
    raise exception 'This code has already been used';
  end if;

  update redemptions set status = 'used' where redemptions.id = v_id;

  return query
    select redemptions.id, redemptions.user_id, redemptions.reward_id, redemptions.points_spent, redemptions.redeemed_at, redemptions.status
    from redemptions where redemptions.id = v_id;
end;
$$ language plpgsql security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;
alter table friendships enable row level security;
alter table points_entries enable row level security;
alter table rewards enable row level security;
alter table redemptions enable row level security;

-- profiles: readable by everyone (host names, friend search, attendee lists),
-- writable only by the owner (privileged columns are further guarded above).
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- events: readable by everyone, writable by the host, or by an admin acting
-- on anyone's event (Postgres OR's multiple permissive policies for the same
-- command together, so either condition is enough).
drop policy if exists "events_select_all" on events;
create policy "events_select_all" on events for select using (true);
drop policy if exists "events_insert_own" on events;
create policy "events_insert_own" on events for insert with check (auth.uid() = host_id);
drop policy if exists "events_update_own" on events;
create policy "events_update_own" on events for update using (auth.uid() = host_id);
drop policy if exists "events_update_admin" on events;
create policy "events_update_admin" on events for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));
drop policy if exists "events_delete_own" on events;
create policy "events_delete_own" on events for delete using (auth.uid() = host_id);
drop policy if exists "events_delete_admin" on events;
create policy "events_delete_admin" on events for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- registrations: readable by everyone (attendee counts, "friends going"),
-- users manage only their own row; marking "attended" only via the RPC above.
drop policy if exists "registrations_select_all" on registrations;
create policy "registrations_select_all" on registrations for select using (true);
drop policy if exists "registrations_insert_own" on registrations;
create policy "registrations_insert_own" on registrations for insert with check (auth.uid() = user_id);
drop policy if exists "registrations_update_own" on registrations;
create policy "registrations_update_own" on registrations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'cancelled');

-- friendships: only the two parties involved can see/act on a friendship.
drop policy if exists "friendships_select_own" on friendships;
create policy "friendships_select_own" on friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
drop policy if exists "friendships_insert_own" on friendships;
create policy "friendships_insert_own" on friendships for insert with check (auth.uid() = requester_id);
drop policy if exists "friendships_update_own" on friendships;
create policy "friendships_update_own" on friendships for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
drop policy if exists "friendships_delete_own" on friendships;
create policy "friendships_delete_own" on friendships for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- points_entries: users and the issuing company can see a ledger row; no
-- direct insert/update/delete policy for anyone — only the RPCs above
-- (which run as security definer) can write to this table.
drop policy if exists "points_select_own" on points_entries;
create policy "points_select_own" on points_entries for select
  using (auth.uid() = user_id or auth.uid() = company_id);

-- rewards: readable by everyone, writable by the issuing (verified, active)
-- company, or by an admin acting on anyone's reward.
drop policy if exists "rewards_select_all" on rewards;
create policy "rewards_select_all" on rewards for select using (true);
drop policy if exists "rewards_insert_verified_company" on rewards;
create policy "rewards_insert_verified_company" on rewards for insert
  with check (
    auth.uid() = company_id
    and exists (
      select 1 from profiles
      where id = auth.uid() and role = 'company' and company_verified and coalesce(is_active, true)
    )
  );
drop policy if exists "rewards_update_own" on rewards;
create policy "rewards_update_own" on rewards for update using (auth.uid() = company_id);
drop policy if exists "rewards_update_admin" on rewards;
create policy "rewards_update_admin" on rewards for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));
drop policy if exists "rewards_delete_own" on rewards;
create policy "rewards_delete_own" on rewards for delete using (auth.uid() = company_id);
drop policy if exists "rewards_delete_admin" on rewards;
create policy "rewards_delete_admin" on rewards for delete
  using (exists (select 1 from profiles where id = auth.uid() and role = 'super_admin'));

-- redemptions: visible to the redeemer and the issuing company; written
-- only via the redeem_reward / redeem_code RPCs above.
drop policy if exists "redemptions_select_own" on redemptions;
create policy "redemptions_select_own" on redemptions for select
  using (auth.uid() = user_id or auth.uid() = company_id);

-- ---------------------------------------------------------------------------
-- Done. Next: Project Settings -> API for your URL + anon key, and see
-- supabase/bootstrap-admin.sql to make your own account a Yalla admin.
-- ---------------------------------------------------------------------------
