import { requireSession } from "@/lib/session";
import { getCategories, getMonthlyLimits } from "@/lib/data";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import SettingsClient from "@/components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const userId = session.user.id;
  const currency = (session.user as { currency?: string }).currency || "TWD";

  const [categories, limits] = await Promise.all([
    getCategories(userId),
    getMonthlyLimits(userId),
  ]);

  return (
    <AppShell categories={categories} currency={currency}>
      <TopBar title="Settings" />
      <main style={{ paddingTop: "64px", paddingBottom: "88px", minHeight: "100vh" }}>
        <SettingsClient
          categories={categories}
          limits={limits}
          currency={currency}
          userName={session.user.name}
          userImage={session.user.image ?? null}
        />
      </main>
    </AppShell>
  );
}
