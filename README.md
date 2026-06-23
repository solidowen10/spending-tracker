# lürú · spending tracker

The first app in the lürú tools suite. Track daily spending by category, set monthly budget limits, and see where your money goes.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Better Auth · Drizzle ORM · PostgreSQL

---

## Features

- LINE Login SSO (shared across all future lürú tools apps on the same domain)
- Add spending with category, date, and optional note
- Monthly and yearly dashboard with animated jar-fill budget indicators
- Per-category and overall monthly budget limits
- Edit and delete entries
- Currency selector (TWD default, 13 currencies supported)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Fill in all required values (see `.env.example` for documentation).

### 3. LINE Developers Console

In your LINE Login Channel settings:

- Under **LINE Login** → **Web app**, add your callback URL:
  ```
  https://your-domain.com/api/auth/callback/line
  ```
  (for local dev: `http://localhost:3000/api/auth/callback/line`)

- Apply for **Email address permission** if you want to collect email.

### 4. Run database migrations

Point `DATABASE_URL` at a real Postgres database, then:

```bash
npx drizzle-kit migrate
```

This runs the migration in `drizzle/0000_funny_the_santerians.sql` and creates all 7 tables.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/login`.

---

## Deployment

**This app is currently configured for self-hosting at
`tool.selinnaowen.com/spending-tracker` on Lightsail (PM2 + Nginx + local
Postgres) — see `DEPLOY.md` for the full step-by-step.**

<details>
<summary>Alternative: Vercel + Neon/Supabase</summary>

1. Remove or adjust `basePath` in `next.config.ts` if deploying to its own domain/subdomain instead of a subpath.
2. Push to GitHub and import the repo into Vercel.
3. Add all env vars from `.env.example` to Vercel's Environment Variables (adjust `BETTER_AUTH_URL`/`NEXT_PUBLIC_AUTH_URL` to drop the subpath).
4. Update the LINE callback URL to your production domain.
5. Run `npx drizzle-kit migrate` once against your production database.

</details>

---

## Adding future lürú tools apps (SSO integration)

> **Note:** This deployment lives at `tool.selinnaowen.com/spending-tracker`
> rather than its own subdomain (the original design below assumed a
> `*.lurutools.app` subdomain setup — see `DEPLOY.md` for what actually
> changed for this deployment). If you later move to dedicated subdomains,
> Option A becomes relevant again as written. For now, Option B is the
> simplest path for any future tool living elsewhere on the same domain.

This app is the auth hub. Future apps can share the same login session in one of two ways:

### Option A: Shared subdomain cookie (for a future multi-subdomain setup)

When `AUTH_COOKIE_DOMAIN=.lurutools.app` is set, the session cookie is scoped to the root domain and is automatically sent to every `*.lurutools.app` subdomain. Not used in the current `tool.selinnaowen.com` deployment — see the note above.

Each future app would need:

```
BETTER_AUTH_SECRET=<same secret as this app — must be identical>
BETTER_AUTH_URL=https://other-app.lurutools.app
AUTH_TRUSTED_ORIGINS=https://spending.lurutools.app,https://other-app.lurutools.app
AUTH_COOKIE_DOMAIN=.lurutools.app
DATABASE_URL=<same database as this app, or one that has the same user/session tables>
```

### Option B: Session endpoint (works regardless of stack or domain structure)

Any app — Next.js or otherwise — can validate a session by forwarding the user's cookies to:

```
GET https://tool.selinnaowen.com/spending-tracker/api/auth/get-session
Cookie: <forwarded from the user's request>
```

This returns `{ session, user }` if valid, or `null` if not. This is the
recommended approach for any future tool you add under
`tool.selinnaowen.com`, since it works the same whether that tool is Next.js,
Express, or anything else, without depending on cookie domain scoping.

---

## Project structure

```
app/
  api/auth/[...all]/route.ts   # Better Auth handler
  dashboard/page.tsx           # Dashboard (month + year views)
  entries/page.tsx             # Entry list with edit/delete
  login/page.tsx               # LINE sign-in page
  settings/page.tsx            # Categories, limits, currency, sign-out
  layout.tsx                   # Root layout + fonts
  globals.css                  # Brand tokens + Tailwind v4 @theme
components/
  AddEntrySheet.tsx            # Bottom-sheet for adding/editing entries
  AppShell.tsx                 # Bottom nav + FAB wrapper
  BottomNav.tsx                # Navigation bar
  EntryList.tsx                # Entry rows with edit/delete
  JarProgress.tsx              # Animated jar fill (the signature element)
  LineSignInButton.tsx         # LINE OAuth button
  SettingsClient.tsx           # Settings UI (client)
  SignOutButton.tsx
  TopBar.tsx
lib/
  actions.ts                   # Server Actions (all mutations)
  auth.ts                      # Better Auth server config
  auth-client.ts               # Better Auth React client
  currencies.ts                # Currency list
  data.ts                      # DB queries (categories, entries, limits)
  dates.ts                     # Date helpers
  db/
    index.ts                   # Drizzle client
    auth-schema.ts             # Better Auth tables (generated by CLI)
    app-schema.ts              # App tables (category, entry, budget_limit)
    schema.ts                  # Combined export
  session.ts                   # getSession / requireSession helpers
drizzle/
  0000_funny_the_santerians.sql  # Initial migration
deploy/
  setup-postgres.sh             # One-time Postgres install + db setup
  nginx-spending-tracker.conf   # Nginx location block to paste in
ecosystem.config.js             # PM2 process config
DEPLOY.md                       # Full Lightsail deployment walkthrough
```
