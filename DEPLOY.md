# Deploying to tool.selinnaowen.com/spending-tracker

This app is configured to run as a second PM2-managed process alongside your
existing tools (like the bill splitter), reverse-proxied by Nginx under the
`/spending-tracker` path.

## 0. What's different about this build

- `next.config.ts` sets `basePath: "/spending-tracker"` — all routes, static
  assets, and the Better Auth API are automatically served under that prefix.
- Since this lives at a **path** on `tool.selinnaowen.com`, not a separate
  subdomain, the session cookie is scoped to the domain by default —
  no cross-subdomain cookie config needed.
- Postgres is self-hosted locally (separate from the bill splitter's SQLite db).

## 1. Get the code onto the server

Copy this whole folder to the Lightsail instance, e.g.:

```bash
scp -r luru-spending-tracker your-user@your-lightsail-ip:/home/your-user/apps/spending-tracker
ssh your-user@your-lightsail-ip
cd /home/your-user/apps/spending-tracker
```

(Or push it to a private GitHub repo and `git clone` it on the server —
whichever matches how you deployed the bill splitter.)

## 2. Set up Postgres

```bash
sudo bash deploy/setup-postgres.sh
```

This installs Postgres if needed, creates a `spending_tracker` database and
user, and prints a `DATABASE_URL` to use in the next step.

## 3. Configure environment variables

```bash
cp .env.example .env
nano .env
```

Fill in:
- `DATABASE_URL` — from step 2
- `BETTER_AUTH_SECRET` — generate with `openssl rand -hex 32`
- `LINE_CHANNEL_ID` / `LINE_CHANNEL_SECRET` — from LINE Developers Console
- Leave `BETTER_AUTH_URL`, `NEXT_PUBLIC_AUTH_URL`, `AUTH_TRUSTED_ORIGINS`,
  and `PORT` as-is unless you need a different port.

## 4. Update the LINE Login Channel

In LINE Developers Console → your Login Channel → **LINE Login** → **Web app**,
add this callback URL:

```
https://tool.selinnaowen.com/spending-tracker/api/auth/callback/line
```

## 5. Install, migrate, build

```bash
npm install
npx drizzle-kit migrate
npm run build
```

## 6. Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
```

Check it's running on the right port:

```bash
pm2 logs spending-tracker
curl http://localhost:3001/spending-tracker/login
```

## 7. Wire up Nginx

Open your existing Nginx config for `tool.selinnaowen.com`:

```bash
sudo nano /etc/nginx/sites-available/tool.selinnaowen.com
```

Paste in the contents of `deploy/nginx-spending-tracker.conf` as a new
`location` block (alongside your `/split-bill` block, not nested in it).

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 8. Verify

Visit `https://tool.selinnaowen.com/spending-tracker` — you should land on
the LINE sign-in screen, and signing in should take you to the dashboard.

## 9. (Optional) Add it to your landing page

If `tool.selinnaowen.com`'s root `index.html` lists your tools, add a link
to `/spending-tracker` there.

## 10. Single login across all your tools

This app now exposes `GET /spending-tracker/api/whoami` so other apps on
the domain (like the bill splitter) can check login status against it
instead of running their own LINE login. See `sso-integration/README.md`
for what that migration looks like.

---

## Updating later

```bash
cd /home/your-user/apps/spending-tracker
git pull   # or re-copy updated files
npm install
npx drizzle-kit migrate   # only if the schema changed
npm run build
pm2 restart spending-tracker
```
