"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function safeNext(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//") || rawNext.includes("\\")) {
    return "/spending-tracker/dashboard";
  }
  return rawNext;
}

function Inner() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));

  return (
    <a
      href={`/auth/login?next=${encodeURIComponent(next)}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        width: "100%",
        padding: "0.875rem 1.25rem",
        background: "#06C755",
        color: "#fff",
        borderRadius: "1rem",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-seasons)",
        fontWeight: 600,
        fontSize: "1rem",
        textDecoration: "none",
      }}
    >
      Continue with LINE
    </a>
  );
}

export default function LineSignInButton() {
  return (
    <Suspense fallback={<div style={{ height: "52px" }} />}>
      <Inner />
    </Suspense>
  );
}
