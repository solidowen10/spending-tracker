// Drop-in Express middleware for any other tool.selinnaowen.com app
// (like the bill splitter) to check login status against the spending
// tracker's shared auth, instead of running its own LINE OAuth flow.
//
// How it works:
//   1. Browser requests a page on your app (e.g. /split-bill/groups/123).
//   2. That request automatically includes the shared session cookie if
//      the visitor has logged in anywhere on tool.selinnaowen.com — cookies
//      are sent for every path on the same domain.
//   3. This middleware forwards that cookie, server-to-server, to the
//      spending tracker's /api/whoami endpoint to ask "who is this?"
//      (Better Auth validates the session — your app never has to.)
//   4. If logged in, req.lineUser is populated and the request continues.
//      If not, the visitor is sent to the shared login page, with `next`
//      pointing back to the page they wanted — after LINE login completes,
//      they're bounced straight back here, now carrying the cookie.
//
// Usage in your Express app:
//
//   const { requireLineSSO } = require("./line-sso-middleware");
//   app.use(requireLineSSO);   // protect everything, or...
//   app.get("/groups/:id", requireLineSSO, (req, res) => { ... });  // ...just some routes
//
//   Inside a protected route, req.lineUser looks like:
//   { lineUserId: "U1234...", name: "Owen", image: "https://..." }
//
//   req.lineUser.lineUserId is the SAME value you've already been storing
//   as line_user_id — no changes needed to your existing members table.

// Calling via localhost skips Nginx/TLS for this server-to-server hop.
// Change the port if your spending-tracker PM2 process uses a different one.
const WHOAMI_URL = "http://localhost:3001/spending-tracker/api/whoami";

// Where to send people to log in. `next` is appended so they land back on
// the exact page they came from once LINE login finishes.
const LOGIN_URL = "/spending-tracker/login";

async function requireLineSSO(req, res, next) {
  try {
    const response = await fetch(WHOAMI_URL, {
      headers: { cookie: req.headers.cookie || "" },
    });
    const data = await response.json();

    if (!data.authenticated) {
      const redirectBack = encodeURIComponent(req.originalUrl);
      return res.redirect(`${LOGIN_URL}?next=${redirectBack}`);
    }

    req.lineUser = {
      lineUserId: data.lineUserId,
      name: data.name,
      image: data.image,
    };
    next();
  } catch (err) {
    console.error("SSO check against spending-tracker failed:", err);
    res.status(502).send("Couldn't verify login right now — please try again.");
  }
}

module.exports = { requireLineSSO };
