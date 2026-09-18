# Yalla — sports events across the UAE

Yalla is a React + TypeScript + Tailwind CSS web app for discovering, hosting
and joining sports events across the UAE. Verified companies can run
"official" events that award loyalty points, redeemable for rewards those
same companies agree to offer. Regular users can host free community
meetups, add friends, and see who's registered for an event.

It's backed by a real database and real authentication (Supabase: Postgres +
Supabase Auth) — not a local mock. Follow the setup below before running it.

## Setup

1. **Create a free Supabase project** at [supabase.com](https://supabase.com).
2. **Run the schema.** Open your project's SQL Editor, paste in the contents
   of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This
   creates every table, security policy and server-side rule the app needs.
3. **Get your API keys.** In your project, go to *Project Settings → API*
   and copy the **Project URL** and **anon public** key.
4. **Configure the app:**
   ```bash
   cp .env.example .env.local
   # then edit .env.local and paste in your URL + anon key
   ```
5. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
6. **Sign up** your own account from `/signup`, then **make yourself an
   admin** so you can verify companies later: open
   [`supabase/bootstrap-admin.sql`](./supabase/bootstrap-admin.sql), put in
   the email you signed up with, and run it once in the SQL Editor.

If your Supabase project has "Confirm email" enabled (the default for new
projects), you'll need to click the confirmation link Supabase emails you
before you can log in. You can turn that off in *Authentication → Providers
→ Email* for faster local testing.

There's no seed data — the app starts empty and real. Sign up a couple of
test accounts (one as a company) to try the full flow: verify the company
as admin, host an official event, register, mark attendance, earn points,
add a reward, redeem it.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (orange/white brand theme, see `src/index.css`)
- **React Router v7** + **TanStack Query** for data fetching/caching
- **Supabase** (Postgres, Auth, Row Level Security)
- **lucide-react** icons, **date-fns**, **clsx** + **tailwind-merge**

## Architecture notes

- `src/api/*.ts` — thin async functions that talk to Supabase (auth, events,
  registrations, friendships, points, rewards). Nothing outside this folder
  touches `supabase-js` directly.
- `src/hooks/*.ts` — TanStack Query hooks wrapping the API layer, used by
  every page. Mutations invalidate the relevant queries so the UI stays in
  sync after a write.
- `supabase/schema.sql` — the entire database: tables, enums, indexes, Row
  Level Security policies, and a handful of Postgres functions that enforce
  the product's core rules **server-side**, so they hold even if someone
  bypasses the UI and calls the API directly:
  - `enforce_official_event_rules` (trigger): an event can only be `official`
    with nonzero points if its host is a verified company — checked in
    Postgres, not just the client, so a user can't grant themselves points
    by editing a network request.
  - `enforce_event_capacity` (trigger): rejects a registration once an event
    is full, inside the same transaction as the insert.
  - `mark_attended(registration_id)` (RPC): only the event's host can call
    this; awards points atomically, once.
  - `redeem_reward(reward_id)` (RPC): checks balance and stock, deducts
    points, decrements stock and issues a redemption code — all in one
    transaction, so two simultaneous redemptions can't both succeed off a
    stale read.
  - `verify_company(company_id)` (RPC): only a `super_admin` can call this.
  - `protect_profile_privileged_columns` (trigger): silently reverts any
    attempt to change your own `role` or `company_verified` outside the
    RPCs above.
  - Points are scoped **per company** (like airline miles), not a shared
    global currency, and can only be redeemed against that same company's
    reward catalogue.
- `supabase/_test_stub_auth.sql` + `supabase/_test_functional.sql` — a local
  smoke test (run against a throwaway Postgres instance, **never** your real
  Supabase project) that exercises every rule above as a non-superuser role.
  All of it passed before this schema was handed off — see git history.
- Event ranking (`src/lib/relevance.ts`) blends promotion tier, official
  status, distance from the viewer, time-until-start and fill rate into a
  single relevance score used for the default Discover sort.

## Known limitations

- **Auth is email-only.** Phone number is stored as a contact field, but
  logging in with just a phone number requires configuring an SMS provider
  (e.g. Twilio) in your Supabase project — that's a separate paid service
  this setup doesn't wire up automatically.
- **Promotion is a mock payment.** No real payment gateway is integrated;
  clicking "Promote" flips the flag directly.
- **No real attendance verification.** "Mark attended" is a host's manual
  click — see the fuller abuse/security review shared separately for what
  a real launch would still need (QR/geofenced check-in, company KYB
  verification, content moderation, rate limiting, etc).
