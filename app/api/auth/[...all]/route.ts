import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const loginUrl = new URL("/auth/login", url.origin);
  loginUrl.searchParams.set("next", "/spending-tracker/dashboard");
  return NextResponse.redirect(loginUrl);
}

export async function POST() {
  return NextResponse.json(
    { error: "Auth for luru tools is handled by /auth." },
    { status: 410 },
  );
}
