-- Run this once, after you've signed up your own account through the app,
-- to make that account a Yalla admin (able to verify companies).
-- Replace the email below with the one you signed up with.

update profiles set role = 'super_admin' where email = 'you@example.com';
