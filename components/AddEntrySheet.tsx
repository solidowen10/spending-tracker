"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { addEntry, editEntry } from "@/lib/actions";
import { todayISO } from "@/lib/dates";

type Category = { id: string; name: string; emoji: string; color: string };

interface AddEntrySheetProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  currency: string;
  /** If provided, we're editing an existing entry */
  existing?: {
    id: string;
    amount: number;
    categoryId: string | null;
    date: string;
    note: string | null;
  };
}

export default function AddEntrySheet({
  open,
  onClose,
  categories,
  currency,
  existing,
}: AddEntrySheetProps) {
  const formatAmountInput = (value: string) => {
    const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    if (!cleaned) return "";
    const [whole, decimal] = cleaned.split(".");
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimal !== undefined ? `${withCommas}.${decimal.slice(0, 2)}` : withCommas;
  };

  const [amount, setAmount] = useState(existing ? formatAmountInput(String(existing.amount)) : "");
  const [categoryId, setCategoryId] = useState<string | null>(existing?.categoryId ?? null);
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  // Reset when opened fresh (not editing)
  useEffect(() => {
    if (open && !existing) {
      setAmount("");
      setCategoryId(null);
      setDate(todayISO());
      setNote("");
      setError("");
      setTimeout(() => amountRef.current?.focus(), 80);
    }
  }, [open, existing]);

  if (!open) return null;

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(/,/g, ""));
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setSaving(true);
    setError("");

    const result = existing
      ? await editEntry(existing.id, parsed, categoryId, date, note || null)
      : await addEntry(parsed, categoryId, date, note || null);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(43,27,61,0.35)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderRadius: "1.5rem 1.5rem 0 0",
          padding: "1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom))",
          zIndex: 101,
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        {/* Handle + Close */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.25rem" }}>
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "99px",
              background: "var(--smoke)",
              margin: "0 auto",
              flex: 1,
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px",
              lineHeight: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-seasons)",
            fontSize: "1.4rem",
            fontWeight: 600,
            color: "var(--plum)",
            marginBottom: "1.25rem",
          }}
        >
          {existing ? "Edit entry" : "Add spending"}
        </h2>

        {/* Amount */}
        <label style={labelStyle}>Amount ({currency})</label>
        <input
          ref={amountRef}
          type="text"
          inputMode="decimal"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(formatAmountInput(e.target.value))}
          style={{ ...inputStyle, fontSize: "1.6rem", fontWeight: 700, color: "var(--plum)" }}
        />

        {/* Category picker */}
        <label style={{ ...labelStyle, marginTop: "1rem" }}>Category</label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          {[{ id: null, name: "No category", emoji: "⬜", color: "var(--muted)" }, ...categories].map(
            (c) => {
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id ?? "none"}
                  onClick={() => setCategoryId(c.id ?? null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "999px",
                    border: `1.5px solid ${active ? c.color : "var(--smoke)"}`,
                    background: active ? c.color + "22" : "var(--smoke)",
                    color: active ? c.color : "var(--muted)",
                    fontFamily: "var(--font-seasons)",
                    fontSize: "0.8rem",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                </button>
              );
            },
          )}
        </div>

        {/* Date */}
        <label style={{ ...labelStyle, marginTop: "1rem" }}>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
        />

        {/* Note */}
        <label style={{ ...labelStyle, marginTop: "1rem" }}>Note (optional)</label>
        <input
          type="text"
          placeholder="e.g. lunch at the office"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "var(--cherry)", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.9rem",
            borderRadius: "1rem",
            border: "none",
            background: saving ? "var(--smoke)" : "var(--mango)",
            color: saving ? "var(--muted)" : "#fff",
            fontFamily: "var(--font-seasons)",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: saving ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Add entry"}
        </button>
      </div>
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--muted)",
  marginBottom: "0.375rem",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 0.875rem",
  borderRadius: "0.75rem",
  border: "1.5px solid var(--smoke)",
  background: "var(--smoke)",
  fontFamily: "var(--font-seasons)",
  fontSize: "1rem",
  color: "var(--plum)",
  outline: "none",
};
