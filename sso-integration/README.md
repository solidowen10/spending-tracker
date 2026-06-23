# Sharing one LINE login across all tool.selinnaowen.com apps

The spending tracker is now the single place that handles LINE login for
the whole domain. Other apps — starting with the bill splitter — stop doing
their own LINE OAuth and instead just ask "who is this visitor?" via one
endpoint: `GET /spending-tracker/api/whoami`.

Because every app lives under `tool.selinnaowen.com` (no subdomains), the
session cookie the spending tracker sets is automatically sent along with
*every* request to *every* app on the domain — the bill splitter doesn't
need to do anything special to "receive" it, it just shows up in the
request headers.

## What changes in the bill splitter

1. **Remove** its own LINE OAuth callback route and token exchange code —
   that's no longer needed once login lives in one place.
2. **Add** `line-sso-middleware.js` (in this folder) and use it to protect
   routes that currently require login.
3. **Replace** wherever the bill splitter currently resolves `line_user_id`
   from its own session with `req.lineUser.lineUserId` from this middleware.
   The value is identical — it's pulled straight from the same LINE account,
   so all existing data and the existing `line_user_id` lookups keep working
   unchanged.
4. **Update** the "Log in" button/link to point at `/spending-tracker/login`
   instead of the bill splitter's own login route.

## What you can remove

- The bill splitter's own `/auth/line/callback` route and any LINE token
  exchange code.
- Its own session-issuing logic for login (if it uses a session purely to
  remember "who is this," that's now handled by the shared cookie).
- The LINE callback URL `https://tool.selinnaowen.com/split-bill/auth/line/callback`
  can eventually be removed from the LINE Developers Console once nothing
  uses it — but there's no rush, leaving it registered is harmless.

## Want this written as an exact patch instead?

This README and the middleware file are a template — they describe the
*shape* of the change but I haven't seen the bill splitter's actual source,
so the exact route names, file structure, and session handling may differ
from what's assumed here. If you share the bill splitter's project (or at
least its `app.js`/`server.js`, its auth middleware, and its login route),
I can write this as a precise, ready-to-paste patch instead of a template
you have to adapt yourself.

## Next.js side (already done)

The `GET /api/whoami` endpoint lives in the spending tracker at
`app/api/whoami/route.ts`. It checks the Better Auth session and, if valid,
looks up the linked LINE account to return the LINE user ID alongside the
name and profile image. No further setup needed there.
