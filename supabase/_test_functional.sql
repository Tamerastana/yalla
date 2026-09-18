-- Functional smoke test for schema.sql, run locally only (see _test_stub_auth.sql).
-- Exercises RLS + triggers + RPCs as a non-superuser role so policies are
-- actually enforced, the way they would be for Supabase's `authenticated`
-- role reached through PostgREST. IDs are looked up by unique title/email
-- inside PL/pgSQL blocks rather than via psql variables, since psql does
-- not interpolate :'var' reliably inside dollar-quoted bodies.

create role yalla_authenticated nologin;
grant usage on schema public to yalla_authenticated;
grant select, insert, update, delete on all tables in schema public to yalla_authenticated;
grant execute on all functions in schema public to yalla_authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to yalla_authenticated;

\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000001', 'admin@test.com', '{"name":"Admin","role":"super_admin"}'),
  ('00000000-0000-0000-0000-000000000002', 'company@test.com', '{"name":"Co Contact","role":"company","company_name":"Test Co","company_industry":"Sport"}'),
  ('00000000-0000-0000-0000-000000000003', 'player@test.com', '{"name":"Player One","role":"user"}'),
  ('00000000-0000-0000-0000-000000000004', 'player2@test.com', '{"name":"Player Two","role":"user"}');

\echo '--- profiles auto-created by trigger ---'
select id, name, role, company_name, company_verified from profiles order by email;

set role yalla_authenticated;

set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
\echo '--- player creates a COMMUNITY event (should stay community, 0 pts) ---'
insert into events (host_id, title, description, category, type, starts_at, ends_at, location_name, address, emirate, lat, lng, capacity, price_aed, points_per_attendee, image_url)
values ('00000000-0000-0000-0000-000000000003', 'Casual Kickabout', 'desc', 'football', 'community', now() + interval '1 day', now() + interval '2 day', 'Park', 'Addr', 'Dubai', 25.2, 55.3, 2, 0, 0, '');

\echo '--- player TRIES to create an OFFICIAL event with points (must be downgraded by trigger) ---'
insert into events (host_id, title, description, category, type, starts_at, ends_at, location_name, address, emirate, lat, lng, capacity, price_aed, points_per_attendee, image_url)
values ('00000000-0000-0000-0000-000000000003', 'Fake Official', 'desc', 'football', 'official', now() + interval '1 day', now() + interval '2 day', 'Park', 'Addr', 'Dubai', 25.2, 55.3, 2, 0, 999, '');

select (type = 'community' and points_per_attendee = 0) as abuse_blocked from events where title = 'Fake Official';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
\echo '--- unverified company TRIES to create an official event (must also be downgraded) ---'
insert into events (host_id, title, description, category, type, starts_at, ends_at, location_name, address, emirate, lat, lng, capacity, price_aed, points_per_attendee, image_url)
values ('00000000-0000-0000-0000-000000000002', 'Unverified Official', 'desc', 'padel', 'official', now() + interval '1 day', now() + interval '2 day', 'Club', 'Addr', 'Dubai', 25.2, 55.3, 2, 0, 50, '');

select (type = 'community' and points_per_attendee = 0) as unverified_blocked from events where title = 'Unverified Official';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
\echo '--- super_admin verifies the company ---'
select verify_company('00000000-0000-0000-0000-000000000002');
select company_verified from profiles where id = '00000000-0000-0000-0000-000000000002';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
\echo '--- now-verified company creates a real OFFICIAL event with capacity 1 ---'
insert into events (host_id, title, description, category, type, starts_at, ends_at, location_name, address, emirate, lat, lng, capacity, price_aed, points_per_attendee, image_url)
values ('00000000-0000-0000-0000-000000000002', 'Real Official', 'desc', 'padel', 'official', now() + interval '1 day', now() + interval '2 day', 'Club', 'Addr', 'Dubai', 25.2, 55.3, 1, 0, 40, '');

select (type = 'official' and points_per_attendee = 40) as real_official_ok from events where title = 'Real Official';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
\echo '--- player 1 registers (fills the only spot) ---'
insert into registrations (event_id, user_id)
select id, '00000000-0000-0000-0000-000000000003' from events where title = 'Real Official';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
\echo '--- player 2 TRIES to register on a full event (must raise "This event is full") ---'
do $$
declare v_event uuid;
begin
  select id into v_event from events where title = 'Real Official';
  insert into registrations (event_id, user_id) values (v_event, '00000000-0000-0000-0000-000000000004');
  raise exception 'TEST FAILED: capacity guard did not fire';
exception when others then
  if sqlerrm like '%full%' then
    raise notice 'capacity guard fired as expected: %', sqlerrm;
  else
    raise;
  end if;
end $$;

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
\echo '--- player 1 (the registrant, not the host) TRIES to mark themself attended (must raise) ---'
do $$
declare v_reg uuid;
begin
  select r.id into v_reg from registrations r join events e on e.id = r.event_id where e.title = 'Real Official';
  perform mark_attended(v_reg);
  raise exception 'TEST FAILED: non-host was able to mark attendance';
exception when others then
  if sqlerrm like '%host%' then
    raise notice 'host guard fired as expected: %', sqlerrm;
  else
    raise;
  end if;
end $$;

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
\echo '--- the actual host (company) marks player 1 attended ---'
do $$
declare v_reg uuid;
begin
  select r.id into v_reg from registrations r join events e on e.id = r.event_id where e.title = 'Real Official';
  perform mark_attended(v_reg);
end $$;

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
\echo '--- points awarded to player 1 for attending an official event (expect 40, earned) ---'
select points, kind, company_id from points_entries where user_id = '00000000-0000-0000-0000-000000000003';

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
\echo '--- verified company creates a reward costing 30 pts ---'
insert into rewards (company_id, title, description, cost_points, image_url, stock, active)
values ('00000000-0000-0000-0000-000000000002', 'Free Court Hour', 'desc', 30, '', 5, true);

reset request.jwt.claim.sub;
set request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
\echo '--- player 1 (40 pts) redeems the 30-pt reward ---'
do $$
declare v_reward uuid;
begin
  select id into v_reward from rewards where title = 'Free Court Hour';
  perform redeem_reward(v_reward);
end $$;

select points_spent, code, status from redemptions where user_id = '00000000-0000-0000-0000-000000000003';
select stock from rewards where title = 'Free Court Hour';

\echo '--- player 1 TRIES to redeem again with only 10 pts left (must raise "Not enough points") ---'
do $$
declare v_reward uuid;
begin
  select id into v_reward from rewards where title = 'Free Court Hour';
  perform redeem_reward(v_reward);
  raise exception 'TEST FAILED: redeemed with insufficient points';
exception when others then
  if sqlerrm like '%enough points%' then
    raise notice 'balance guard fired as expected: %', sqlerrm;
  else
    raise;
  end if;
end $$;

\echo '--- player TRIES to self-promote to super_admin via direct update (must be silently reverted) ---'
update profiles set role = 'super_admin' where id = '00000000-0000-0000-0000-000000000003';
select (role = 'user') as privilege_escalation_blocked from profiles where id = '00000000-0000-0000-0000-000000000003';

\echo '--- ALL CHECKS COMPLETE ---'
