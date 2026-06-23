import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { user } from "./db/schema";

export type SharedSession = {
  user: {
    id: string;
    lineUserId: string;
    name: string;
    image: string | null;
    currency: string;
  };
};

type AuthSessionResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      userId: string;
      lineUserId: string;
      name: string;
      image: string | null;
      expiresAt: string;
    };

const AUTH_SESSION_URL =
  process.env.AUTH_SERVICE_INTERNAL_URL || "http://127.0.0.1:3002/auth/api/session";

function emailForLineUser(lineUserId: string) {
  return `${lineUserId}@line.local`;
}

async function ensureSpendingUser(authUser: Extract<AuthSessionResponse, { authenticated: true }>) {
  const existing = await db.select().from(user).where(eq(user.id, authUser.userId)).limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(user)
      .set({
        name: authUser.name || existing[0].name,
        image: authUser.image,
      })
      .where(eq(user.id, authUser.userId))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(user)
    .values({
      id: authUser.userId,
      name: authUser.name || "LINE User",
      email: emailForLineUser(authUser.lineUserId),
      emailVerified: true,
      image: authUser.image,
      currency: "TWD",
    })
    .returning();

  return created;
}

/** Reads the current shared luru session on the server, or null if signed out. */
export async function getSession() {
  const incomingHeaders = await headers();
  const cookie = incomingHeaders.get("cookie") || "";

  const response = await fetch(AUTH_SESSION_URL, {
    headers: { cookie },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const authSession = (await response.json()) as AuthSessionResponse;
  if (!authSession.authenticated || !authSession.userId || !authSession.lineUserId) {
    return null;
  }

  const spendingUser = await ensureSpendingUser(authSession);

  return {
    user: {
      id: spendingUser.id,
      lineUserId: authSession.lineUserId,
      name: spendingUser.name,
      image: spendingUser.image,
      currency: spendingUser.currency || "TWD",
    },
  } satisfies SharedSession;
}

/** Reads the current session, redirecting to /login if there isn't one. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}
