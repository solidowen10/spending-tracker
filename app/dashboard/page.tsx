import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getMonthlySummary, getYearlySummary, getCategories } from "@/lib/data";
import { formatMoney } from "@/lib/currency";
import { MONTH_NAMES, getMonthYearFromParams, shiftMonth, MONTH_SHORT } from "@/lib/dates";
import AppShell from "@/components/AppShell";
import TopBar from "@/components/TopBar";
import JarProgress from "@/components/JarProgress";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ year?: string; month?: string; view?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = await requireSession();
  const userId = session.user.id;
  const currency = (session.user as { currency?: string }).currency || "TWD";

  const view = sp.view === "year" ? "year" : "month";
  const { year, month } = getMonthYearFromParams(sp);

  const [categories, summary, yearly] = await Promise.all([
    getCategories(userId),
    view === "month" ? getMonthlySummary(userId, year, month) : Promise.resolve(null),
    view === "year" ? getYearlySummary(userId, year) : Promise.resolve(null),
  ]);

  const fmt = (n: number) => formatMoney(n, currency);

  const prevMonth = shiftMonth(year, month, -1);
  const nextMonth = shiftMonth(year, month, 1);
  const nowDate = new Date();
  const isFutureMonth =
    view === "month" &&
    (year > nowDate.getFullYear() ||
      (year === nowDate.getFullYear() && month > nowDate.getMonth() + 1));

  return (
    <AppShell categories={categories} currency={currency}>
      <TopBar title="lürú · spending" />

      <main style={{ paddingTop: "64px", paddingBottom: "88px", minHeight: "100vh" }}>
        {/* View toggle + nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 0 0.5rem",
          }}
        >
          {/* Prev */}
          {view === "month" ? (
            <Link
              href={`/dashboard?view=month&year=${prevMonth.year}&month=${prevMonth.month}`}
              style={{ color: "var(--mango)", textDecoration: "none", fontWeight: 700, fontSize: "2rem", lineHeight: 1, padding: "0 8px" }}
            >
              ‹
            </Link>
          ) : (
            <Link
              href={`/dashboard?view=year&year=${year - 1}`}
              style={{ color: "var(--mango)", textDecoration: "none", fontWeight: 700, fontSize: "2rem", lineHeight: 1, padding: "0 8px" }}
            >
              ‹
            </Link>
          )}

          {/* Period label */}
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                fontFamily: "var(--font-seasons)",
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "var(--plum)",
                margin: 0,
              }}
            >
              {view === "month" ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`}
            </h2>
          </div>

          {/* Next */}
          {view === "month" ? (
            <Link
              href={isFutureMonth ? "#" : `/dashboard?view=month&year=${nextMonth.year}&month=${nextMonth.month}`}
              style={{
                color: isFutureMonth ? "var(--muted)" : "var(--mango)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1,
                padding: "0 8px",
                pointerEvents: isFutureMonth ? "none" : "auto",
              }}
            >
              ›
            </Link>
          ) : (
            <Link
              href={year >= nowDate.getFullYear() ? "#" : `/dashboard?view=year&year=${year + 1}`}
              style={{
                color: year >= nowDate.getFullYear() ? "var(--muted)" : "var(--mango)",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1,
                padding: "0 8px",
                pointerEvents: year >= nowDate.getFullYear() ? "none" : "auto",
              }}
            >
              ›
            </Link>
          )}
        </div>

        {/* Month/Year pill toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          {(["month", "year"] as const).map((v) => (
            <Link
              key={v}
              href={`/dashboard?view=${v}&year=${year}&month=${month}`}
              style={{
                padding: "0.35rem 1rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
                background: view === v ? "var(--plum)" : "var(--smoke)",
                color: view === v ? "#fff" : "var(--muted)",
              }}
            >
              {v === "month" ? "Month" : "Year"}
            </Link>
          ))}
        </div>

        
        {/* ─── MONTH VIEW ─── */}        {view === "month" && summary && (
          <>
            {/* Overall jar hero */}
            <section style={{ padding: "0.75rem 1.25rem 1.25rem", display: "flex", justifyContent: "center" }}>
              <JarProgress
                spent={summary.total}
                limit={summary.overallLimit}
                emoji="💰"
                label="Overall"
                spentFormatted={fmt(summary.total)}
                limitFormatted={summary.overallLimit ? fmt(summary.overallLimit) : undefined}
                size={128}
              />
            </section>

            {/* Jar grid */}
            <section className="category-section" style={{ padding: "0 1.25rem" }}>
              <h3
                style={{
                  fontFamily: "var(--font-seasons)",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--plum)",
                  marginBottom: "1rem",
                }}
              >
                By category
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                  gap: "1rem",
                }}
              >
                {summary.perCategory.map((c) => (
                  <JarProgress
                    key={c.id}
                    spent={c.spent}
                    limit={c.limit}
                    emoji={c.emoji}
                    color={c.color}
                    label={c.name}
                    spentFormatted={fmt(c.spent)}
                    limitFormatted={c.limit ? fmt(c.limit) : undefined}
                    size={72}
                  />
                ))}
              </div>
            </section>

            {/* Daily spend chart (simple bar) */}
            {Object.keys(summary.dailyTotals).length > 0 && (
              <section style={{ padding: "1.5rem 1.25rem 0" }}>
                <h3 style={{ fontFamily: "var(--font-seasons)", fontSize: "1rem", fontWeight: 600, color: "var(--plum)", marginBottom: "0.75rem" }}>
                  Daily spending
                </h3>
                <DailyBars dailyTotals={summary.dailyTotals} fmt={fmt} />
              </section>
            )}

            {/* Recent entries */}
            {summary.entries.length > 0 && (
              <section style={{ padding: "1.5rem 1.25rem 0" }}>
                <h3 style={{ fontFamily: "var(--font-seasons)", fontSize: "1rem", fontWeight: 600, color: "var(--plum)", marginBottom: "0.75rem" }}>
                  Recent
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {summary.entries.slice(0, 5).map((e) => (
                    <div
                      key={e.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "#fff",
                        borderRadius: "0.875rem",
                        padding: "0.75rem",
                        boxShadow: "0 1px 6px rgba(43,27,61,0.06)",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{e.categoryEmoji ?? "📝"}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--plum)" }}>
                          {e.categoryName ?? "Uncategorised"}
                        </div>
                        {e.note && (
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{e.note}</div>
                        )}
                      </div>
                      <div style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)", fontSize: "1rem" }}>
                        {fmt(e.amount)}
                      </div>
                    </div>
                  ))}
                  {summary.entries.length > 5 && (
                    <Link href="/entries" style={{ color: "var(--grape)", fontSize: "0.85rem", fontWeight: 600, textAlign: "center", display: "block", marginTop: "0.25rem", textDecoration: "none" }}>
                      See all {summary.entries.length} entries →
                    </Link>
                  )}
                </div>
              </section>
            )}

            {summary.entries.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem 1.25rem", color: "var(--muted)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🫙</div>
                <div style={{ fontWeight: 600 }}>No spending yet this month</div>
                <div style={{ fontSize: "0.85rem", marginTop: "0.35rem" }}>
                  Tap the + button to add your first entry.
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── YEAR VIEW ─── */}
        {view === "year" && yearly && (
          <>
            <div style={{ textAlign: "center", padding: "0.75rem 1.25rem 1.5rem" }}>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Total {year}
              </div>
              <div style={{ fontFamily: "var(--font-seasons)", fontSize: "2.8rem", fontWeight: 600, color: "var(--plum)", lineHeight: 1.1 }}>
                {fmt(yearly.total)}
              </div>
            </div>

            {/* Monthly bar chart */}
            <section className="category-section" style={{ padding: "0 1.25rem" }}>
              <h3 style={{ fontFamily: "var(--font-seasons)", fontSize: "1rem", fontWeight: 600, color: "var(--plum)", marginBottom: "0.75rem" }}>
                Per month
              </h3>
              <MonthlyBars perMonth={yearly.perMonth} fmt={fmt} year={year} />
            </section>

            {/* Category breakdown */}
            <section style={{ padding: "1.5rem 1.25rem 0" }}>
              <h3 style={{ fontFamily: "var(--font-seasons)", fontSize: "1rem", fontWeight: 600, color: "var(--plum)", marginBottom: "0.75rem" }}>
                By category
              </h3>
              {yearly.perCategory.filter((c) => c.spent > 0).map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <span style={{ fontSize: "2rem", lineHeight: 1, padding: "0 8px" }}>{c.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--plum)" }}>{c.name}</div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "99px",
                        background: "var(--smoke)",
                        marginTop: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: "99px",
                          background: c.color,
                          width: `${yearly.total > 0 ? Math.min((c.spent / yearly.total) * 100, 100) : 0}%`,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)", fontSize: "0.9rem", minWidth: "64px", textAlign: "right" }}>
                    {fmt(c.spent)}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </AppShell>
  );
}

// ─── Inline chart sub-components ─────────────────────────────────────────────

function DailyBars({ dailyTotals, fmt }: { dailyTotals: Record<string, number>; fmt: (n: number) => string }) {
  const entries = Object.entries(dailyTotals).sort(([a], [b]) => a.localeCompare(b));
  const firstDate = entries[0]?.[0] ?? new Date().toISOString().slice(0, 10);
  const daysInMonth = new Date(Number(firstDate.slice(0, 4)), Number(firstDate.slice(5, 7)), 0).getDate();

  const totalsByDay = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const key = `${firstDate.slice(0, 8)}${String(day).padStart(2, "0")}`;
    return { day, total: dailyTotals[key] ?? 0 };
  });

  const max = Math.max(...totalsByDay.map((d) => d.total), 1);
  const yMax = Math.ceil(max / 500) * 500 || 500;
  const ticks = [yMax, Math.round(yMax / 2), 0];

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--smoke)",
        borderRadius: "1rem",
        padding: "1rem",
        boxShadow: "0 1px 6px rgba(43,27,61,0.04)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: "0.5rem", height: "150px" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", color: "var(--plum)", fontSize: "0.75rem" }}>
          {ticks.map((tick) => (
            <span key={tick}>{tick === 0 ? "0" : tick.toLocaleString()}</span>
          ))}
        </div>

        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: "3px", borderBottom: "1px solid #cfc7bd" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
            <div style={{ borderTop: "1px dashed #ddd4cc" }} />
            <div style={{ borderTop: "1px dashed #ddd4cc" }} />
            <div />
          </div>

          {totalsByDay.map(({ day, total }) => (
            <div key={day} title={`${day}: ${fmt(total)}`} style={{ flex: 1, height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              {total > 0 && (
                <div
                  style={{
                    width: "45%",
                    minWidth: "5px",
                    maxWidth: "12px",
                    height: `${Math.max((total / yMax) * 120, 4)}px`,
                    background: "var(--grape)",
                    borderRadius: "3px 3px 0 0",
                    opacity: 0.9,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: "0.5rem", marginTop: "0.35rem" }}>
        <div style={{ color: "var(--plum)", fontSize: "0.75rem" }}>NT$</div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--plum)", fontSize: "0.72rem" }}>
          {[1, 5, 10, 15, 20, 25, daysInMonth].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthlyBars({
  perMonth,
  fmt,
  year,
}: {
  perMonth: { month: number; total: number }[];
  fmt: (n: number) => string;
  year: number;
}) {
  const max = Math.max(...perMonth.map((m) => m.total), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "96px" }}>
      {perMonth.map(({ month, total }) => (
        <Link
          key={month}
          href={`/dashboard?view=month&year=${year}&month=${month}`}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", textDecoration: "none" }}
        >
          <div
            title={`${MONTH_SHORT[month - 1]}: ${fmt(total)}`}
            style={{
              width: "100%",
              background: total > 0 ? "var(--mango)" : "var(--smoke)",
              borderRadius: "4px 4px 0 0",
              height: `${Math.max((total / max) * 72, 4)}px`,
              transition: "height 0.4s ease",
            }}
          />
          <span style={{ fontSize: "0.55rem", color: "var(--muted)" }}>{MONTH_SHORT[month - 1]}</span>
        </Link>
      ))}
    </div>
  );
}
