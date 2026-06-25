import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getEntriesForMonth, getCategories } from "@/lib/data";
import { formatMoney } from "@/lib/currency";
import { MONTH_NAMES, getMonthYearFromParams, shiftMonth } from "@/lib/dates";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import EntryList from "@/components/EntryList";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function EntriesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = await requireSession();
  const userId = session.user.id;
  const currency = (session.user as { currency?: string }).currency || "TWD";

  const { year, month } = getMonthYearFromParams(sp);
  const [categories, entries] = await Promise.all([
    getCategories(userId),
    getEntriesForMonth(userId, year, month),
  ]);

  const prevMonth = shiftMonth(year, month, -1);
  const nextMonth = shiftMonth(year, month, 1);
  const nowDate = new Date();
  const isFutureMonth =
    year > nowDate.getFullYear() ||
    (year === nowDate.getFullYear() && month > nowDate.getMonth() + 1);

  return (
    <AppShell categories={categories} currency={currency}>
      <TopBar title="Entries" />
      <main style={{ paddingTop: "64px", paddingBottom: "88px", minHeight: "100vh" }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem" }}>
          <Link href={`/entries?year=${prevMonth.year}&month=${prevMonth.month}`}
             style={{ color: "var(--mango)", textDecoration: "none", fontWeight: 700, fontSize: "1.25rem" }}>‹</Link>
          <h2 style={{ fontFamily: "var(--font-seasons)", fontSize: "1.1rem", fontWeight: 600, color: "var(--plum)", margin: 0 }}>
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Link href={isFutureMonth ? "#" : `/entries?year=${nextMonth.year}&month=${nextMonth.month}`}
             style={{ color: isFutureMonth ? "var(--muted)" : "var(--mango)", textDecoration: "none", fontWeight: 700, fontSize: "1.25rem", pointerEvents: isFutureMonth ? "none" : "auto" }}>›</Link>
        </div>

        <EntryList
          entries={entries}
          categories={categories}
          currency={currency}
        />
      </main>
    </AppShell>
  );
}
