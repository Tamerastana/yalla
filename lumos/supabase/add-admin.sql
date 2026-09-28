-- Give an existing Supabase user access to /admin.
-- 1. Create the user first: Supabase → Authentication → Users → Add user
--    (enter email + password, tick "Auto Confirm User").
-- 2. Put that email below and run this in the SQL Editor.

insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com'
on conflict do nothing;
