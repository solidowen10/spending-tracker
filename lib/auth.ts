import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";

// Apps that should be able to share a login session with this one.
// Add every lürú tools subdomain here as you build more apps.
const trustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// The root domain cookies should be shared across, e.g. ".lurutools.app".
// Leave unset for local development (cookies just stay host-only on localhost).
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  socialProviders: {
    line: {
      clientId: process.env.LINE_CHANNEL_ID as string,
      clientSecret: process.env.LINE_CHANNEL_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      // Used to format amounts throughout the app. Defaults to TWD since
      // that's the most common case for lürú tools, but every user can
      // change theirs from Settings.
      currency: {
        type: "string",
        required: false,
        defaultValue: "TWD",
        input: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry once a day of active use
  },

  trustedOrigins,

  advanced: {
    crossSubDomainCookies: {
      enabled: Boolean(cookieDomain),
      domain: cookieDomain,
    },
  },

  // Keeps server actions / route handlers able to set the session cookie
  // correctly under Next.js. Must stay last in the plugins array.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
