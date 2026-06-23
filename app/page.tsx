import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Root: send signed-in users straight to dashboard, others to login
export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  redirect("/login");
}
