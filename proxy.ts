import { NextRequest, NextResponse } from "next/server";

function returnPath(request: NextRequest) {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return path.startsWith("/spending-tracker") ? path : `/spending-tracker${path}`;
}

// Fast edge-check: redirect signed-out visitors away from protected app routes.
// Every page/action still re-validates the real session with /auth/api/session.
export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("luru_session");

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", returnPath(request));
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/entries/:path*", "/settings/:path*"],
};
