# Yalla — sports events across the UAE

Yalla is a React + TypeScript + Tailwind CSS web app for discovering, hosting
and joining sports events across the UAE. Verified companies can run
"official" events that award loyalty points, redeemable for rewards those
same companies agree to offer. Regular users can host free community
meetups, add friends, and see who's registered for an event.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL. On first load the app seeds itself with demo
data (companies, events, users, friendships, points, rewards) into
`localStorage` — no backend or database setup required to try it out.

### Demo accounts

Password for all of them: `password123`

| Role              | Identifier            | What you'll see                                   |
| ----------------- | ---------------------- | -------------------------------------------------- |
| Player            | `demo@yalla.ae`         | Registrations, points, friends, redemption history |
| Verified company  | `events@dubaisc.ae`     | Company hub, official events, rewards catalogue     |
| Yalla admin       | `admin@yalla.ae`        | Company verification panel                          |

Or sign up your own account (email or phone) from `/signup`.

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (orange/white brand theme, see `src/index.css`)
- **React Router v7**
- **lucide-react** icons, **date-fns**, **clsx** + **tailwind-merge**

## Architecture notes

There is no real backend. `src/lib/storage.ts` implements a small
"database" persisted to `localStorage`, and `src/lib/repo.ts` layers all
business rules on top of it (auth, event creation, registrations,
friendships, the points ledger, rewards). Every page/component calls
`repo.*` functions — none of them touch `localStorage` directly — so
swapping in a real backend (e.g. Postgres + Supabase Auth) later is a matter
of reimplementing `repo.ts`'s functions against real HTTP calls without
touching any UI code.

Key product rules encoded in `repo.ts`:

- Only a **verified company** account can create an **official** event that
  awards points. Everyone else's events are always **community** events
  worth 0 points — this is the anti-abuse gate for the points system.
- Points are scoped **per company** (like airline miles), not a shared
  global currency, and can only be redeemed against that same company's
  reward catalogue.
- Event ranking (`src/lib/relevance.ts`) blends promotion tier, official
  status, distance from the viewer, time-until-start and fill rate into a
  single relevance score used for the default Discover sort.

## Known limitations (demo scope)

This is a frontend demo, not a production system. See the security/abuse
review shared with the project owner for a full list of gaps that would
need addressing before a real launch (fake attendance, payment integration,
identity verification, moderation, rate limiting, etc).
