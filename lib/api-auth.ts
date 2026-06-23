import { NextResponse } from "next/server";
import { getSession } from "./session";

export async function requireUserId() {
  const session = await getSession();
  if (!session) {
    return {
      userId: null as null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId: session.user.id, unauthorized: null as null };
}
