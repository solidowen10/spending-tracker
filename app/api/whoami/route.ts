import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Compatibility endpoint. New tools should call /auth/api/session directly.
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    userId: session.user.id,
    lineUserId: session.user.lineUserId,
    name: session.user.name,
    image: session.user.image,
  });
}
