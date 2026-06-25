"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { removeEntry } from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import AddEntrySheet from "./AddEntrySheet";
import type { EntryWithCategory } from "@/lib/data";

type Category = { id: string; name: string; emoji: string; color: string };

interface EntryListProps {
  entries: EntryWithCategory[];
  categories: Category[];
  currency: string;
}

export default function EntryList({ entries, categories, currency }: EntryListProps) {
  const [editing, setEditing] = useState<EntryWithCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fmt = (n: number) => formatMoney(n, currency);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(id);
    await removeEntry(id);
    setDeletingId(null);
  };

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1.25rem", color: "var(--muted)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
        <div style={{ fontWeight: 600 }}>No entries this month</div>
        <div style={{ fontSize: "0.85rem", marginTop: "0.35rem" }}>Tap + to add spending.</div>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, EntryWithCategory[]> = {};
  for (const e of entries) {
    if (!grouped[e.date]) grouped[e.date] = [];
    grouped[e.date].push(e);
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <>
      <div style={{ padding: "0 1.25rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {dates.map((date) => {
          const dayTotal = grouped[date].reduce((s, e) => s + e.amount, 0);
          return (
            <div key={date}>
              {/* Date header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)", fontSize: "0.9rem" }}>
                  {fmt(dayTotal)}
                </span>
              </div>
              {/* Entries */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {grouped[date].map((e) => (
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
                      opacity: deletingId === e.id ? 0.4 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: e.categoryColor ? e.categoryColor + "22" : "var(--smoke)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        flexShrink: 0,
                      }}
                    >
                      {e.categoryEmoji ?? "📝"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--plum)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {e.categoryName ?? "Uncategorised"}
                      </div>
                      {e.note && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.note}
                        </div>
                      )}
                    </div>
                    <div style={{ fontFamily: "var(--font-seasons)", fontWeight: 700, color: "var(--plum)", fontSize: "1.05rem", flexShrink: 0 }}>
                      {fmt(e.amount)}
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setEditing(e)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grape)", padding: "4px", lineHeight: 0 }}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--cherry)", padding: "4px", lineHeight: 0 }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <AddEntrySheet
          open
          onClose={() => setEditing(null)}
          categories={categories}
          currency={currency}
          existing={editing}
        />
      )}
    </>
  );
}
