"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  // Better Auth's client makes plain fetch() calls, which Next's basePath
  // does NOT rewrite automatically — so when this app is served under a
  // subpath (e.g. https://tool.selinnaowen.com/spending-tracker), you must
  // set NEXT_PUBLIC_AUTH_URL to that full URL including the subpath.
  // If the app is served at the domain root instead, leave this unset.
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { useSession, signIn, signOut } = authClient;
