# Lumos Global Education — website + admin panel

A one-page website in English and Russian (EN/RU switch in the header) with a private
admin panel at **`/admin`**.

- **Public site.** Visitors don't log in. It has these sections: Hero, Why Lumos, How it works,
  Packages, About & founder, Application, and Contact with a live Google Map.
- **Application buttons** open the application form:
  `https://form.jotform.com/262631348320451`.
- **"Book a free consultation" and the package buttons** open a short form. Requests
  go into the admin inbox. If the admin panel isn't connected yet, the form sends
  the request through WhatsApp instead (+971 54 410 5105).
- **Admin panel (`/admin`)** has three tabs:
  - **Requests:** every consultation request, with status (new → contacted → applied →
    enrolled → closed), private notes, and one-click WhatsApp, phone and email buttons.
  - **Texts (EN / RU):** every text on the site, English and Russian side by side, including
    prices (`AED [PRICE]`).
  - **Settings & images:** phone, WhatsApp, Instagram, application link and map location.
    Also the switches for the ALL-CAPS headline and the hero description, and image uploads
    (logo, hero, founder, campus).

Built with React, TypeScript, Tailwind CSS and Vite. Supabase provides the database, login
and image storage for the admin panel.

## Run locally

```bash
cd lumos
npm install
npm run dev        # http://localhost:5173  (admin: http://localhost:5173/admin)
```

## Admin panel setup (one time, free)

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, paste all of [`supabase/schema.sql`](./supabase/schema.sql) and press **Run**.
3. In **Authentication → Users → Add user**, create the admin login (email and password), and tick
   **Auto Confirm User**.
4. Open [`supabase/add-admin.sql`](./supabase/add-admin.sql), replace `you@example.com` with that
   email, and run it in the SQL Editor. Repeat for each extra admin.
5. In **Project Settings → API**, copy the **Project URL** and the **anon public** key. Put them in
   `lumos/.env.local` (copy `.env.example`) and in your hosting's environment variables:
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Redeploy, then sign in at `https://your-domain/admin`.

To stop strangers from creating accounts, turn off **Authentication → Sign In / Providers →
Allow new users to sign up**. You don't need sign-ups: admins are added in step 3.

## Deploy (Vercel)

Import the repository in Vercel and set **Root Directory** to `lumos`. Vercel detects Vite
automatically. Add the two environment variables from step 5. `vercel.json` already sends
`/admin` to the app.

## Where things live

| What | File |
| --- | --- |
| Default texts (EN + RU), links, prices | `src/content/defaults.ts` |
| Page sections | `src/components/*.tsx` |
| Colours and fonts | `src/index.css` |
| Photos | `public/images/` |
| Admin panel | `src/admin/` |

Changes saved in the admin panel override `defaults.ts`. **Reset everything to the original
defaults** (under Settings) brings the defaults back.

The hero photo and the campus photo were taken from the design PDF. To use sharper originals,
upload them from **Admin → Settings & images**.
