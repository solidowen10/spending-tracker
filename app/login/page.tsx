import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

function safeNext(rawNext: string | undefined) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//") || rawNext.includes("\\")) {
    return "/spending-tracker/dashboard";
  }

  try {
    const parsed = new URL(rawNext, "https://tool.luruee.com");
    if (parsed.origin !== "https://tool.luruee.com") return "/spending-tracker/dashboard";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/spending-tracker/dashboard";
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const session = await getSession();

  if (session) redirect(next);
  const authLogin = new URL("/auth/login", "https://tool.luruee.com");
  authLogin.searchParams.set("next", next);
  redirect(authLogin.toString());
}
