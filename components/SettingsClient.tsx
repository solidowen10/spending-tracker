"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  addCategory,
  editCategory,
  removeCategory,
  setOverallLimitAction,
  setCategoryLimitAction,
  updateCurrencyAction,
} from "@/lib/actions";
import { formatMoney } from "@/lib/currency";
import { CURRENCIES } from "@/lib/currencies";
import SignOutButton from "./SignOutButton";

type Category = { id: string; name: string; emoji: string; color: string };
type Limits = { overall: number | null; byCategory: Record<string, number> };

const EMOJIS = ["🍜", "🚗", "🛍️", "💡", "🎬", "💊", "🧩", "☕", "🍕", "🎮", "✈️", "🏋️", "🐾", "📚", "🎁", "💇", "🛁", "🍺", "🧴", "💐"];
const COLORS = ["#FF8A3D", "#7C5CFC", "#FF5C72", "#4ECB71", "#FFC93C", "#4FB0E0", "#B98AF0", "#F87171", "#34D399", "#60A5FA"];

interface SettingsClientProps {
  categories: Category[];
  limits: Limits;
  currency: string;
  userName: string;
  userImage: string | null;
}

export default function SettingsClient({
  categories,
  limits,
  currency,
  userName,
  userImage,
}: SettingsClientProps) {
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🍜");
  const [newCatColor, setNewCatColor] = useState("#FF8A3D");
  const [addingCat, setAddingCat] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatData, setEditCatData] = useState<{ name: string; emoji: string; color: string }>({ name: "", emoji: "", color: "" });
  const formatAmountInput = (value: string) => {
    const cleaned = value.replace(/,/g, "").replace(/[^0-9]/g, "");
    if (!cleaned) return "";
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const [overallLimit, setOverallLimit] = useState(limits.overall !== null ? formatAmountInput(String(limits.overall)) : "");
  const [catLimits, setCatLimits] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(limits.byCategory).map(([k, v]) => [k, formatAmountInput(String(v))]))
  );
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [saving, setSaving] = useState<string | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);

  const fmt = (n: number) => formatMoney(n, currency);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setSaving("addCat");
    await addCategory(newCatName, newCatEmoji, newCatColor);
    setNewCatName("");
    setAddingCat(false);
    setSaving(null);
  };

  const handleEditCat = async (id: string) => {
    setSaving("editCat" + id);
    await editCategory(id, editCatData);
    setEditingCat(null);
    setSaving(null);
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category? Existing entries will become uncategorised.")) return;
    setSaving("delCat" + id);
    await removeCategory(id);
    setSaving(null);
  };

  const handleSaveOverallLimit = async () => {
    setSaving("overall");
    const val = overallLimit ? parseFloat(overallLimit.replace(/,/g, "")) : null;
    await setOverallLimitAction(val);
    setSaving(null);
  };

  const handleSaveCatLimit = async (catId: string) => {
    setSaving("catLimit" + catId);
    const val = catLimits[catId] ? parseFloat(catLimits[catId].replace(/,/g, "")) : null;
    await setCategoryLimitAction(catId, val);
    setSaving(null);
  };

  const handleSaveCurrency = async () => {
    setSaving("currency");
    await updateCurrencyAction(selectedCurrency);
    setSaving(null);
  };

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "1.25rem",
    margin: "0 1.25rem 1rem",
    overflow: "hidden",
    boxShadow: "0 1px 8px rgba(43,27,61,0.06)",
  };

  const sectionHeader: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.25rem",
    cursor: "pointer",
  };

  const fieldRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.625rem 1.25rem",
    borderTop: "1px solid var(--smoke)",
  };

  return (
    <div style={{ paddingTop: "0.75rem" }}>
      {/* Profile */}
      <div style={{ ...sectionStyle }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem" }}>
          {userImage ? (
            <img src={userImage} alt={userName} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--grape)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.25rem" }}>
              {userName[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, color: "var(--plum)" }}>{userName}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>lürú tools account</div>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div style={sectionStyle}>
        <div style={{ padding: "1rem 1.25rem" }}>
          <div style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)", marginBottom: "0.75rem" }}>Currency</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              style={{ flex: 1, padding: "0.6rem 0.875rem", borderRadius: "0.75rem", border: "1.5px solid var(--smoke)", background: "var(--smoke)", fontFamily: "var(--font-seasons)", fontSize: "0.9rem", color: "var(--plum)", cursor: "pointer" }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label} ({c.code})</option>
              ))}
            </select>
            <button
              onClick={handleSaveCurrency}
              disabled={saving === "currency" || selectedCurrency === currency}
              style={{ padding: "0.6rem 1rem", borderRadius: "0.75rem", border: "none", background: saving === "currency" || selectedCurrency === currency ? "var(--smoke)" : "var(--grape)", color: saving === "currency" || selectedCurrency === currency ? "var(--muted)" : "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Budget limits */}
      <div style={sectionStyle}>
        <div style={sectionHeader} onClick={() => setLimitsOpen(!limitsOpen)}>
          <span style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)" }}>Monthly budget limits</span>
          <span style={{ color: "var(--muted)", fontSize: "1rem" }}>{limitsOpen ? "▲" : "▼"}</span>
        </div>
        {limitsOpen && (
          <>
            {/* Overall */}
            <div style={fieldRow}>
              <span style={{ fontSize: "1.25rem" }}>💰</span>
              <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: "var(--plum)" }}>Overall</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="No limit"
                value={overallLimit}
                onChange={(e) => setOverallLimit(formatAmountInput(e.target.value))}
                style={{ width: "110px", padding: "0.4rem 0.6rem", borderRadius: "0.625rem", border: "1.5px solid var(--smoke)", background: "var(--smoke)", fontFamily: "var(--font-seasons)", fontSize: "0.9rem", color: "var(--plum)" }}
              />
              <button
                onClick={handleSaveOverallLimit}
                disabled={saving === "overall"}
                style={{ padding: "0.4rem 0.7rem", borderRadius: "0.625rem", border: "none", background: "var(--mango)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
              >
                <Check size={14} />
              </button>
            </div>
            {/* Per category */}
            {categories.map((cat) => (
              <div key={cat.id} style={fieldRow}>
                <span style={{ fontSize: "1.25rem" }}>{cat.emoji}</span>
                <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: "var(--plum)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.name}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="No limit"
                  value={catLimits[cat.id] ?? ""}
                  onChange={(e) => setCatLimits({ ...catLimits, [cat.id]: formatAmountInput(e.target.value) })}
                  style={{ width: "110px", padding: "0.4rem 0.6rem", borderRadius: "0.625rem", border: "1.5px solid var(--smoke)", background: "var(--smoke)", fontFamily: "var(--font-seasons)", fontSize: "0.9rem", color: "var(--plum)" }}
                />
                <button
                  onClick={() => handleSaveCatLimit(cat.id)}
                  disabled={saving === "catLimit" + cat.id}
                  style={{ padding: "0.4rem 0.7rem", borderRadius: "0.625rem", border: "none", background: "var(--mango)", color: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                >
                  <Check size={14} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Categories */}
      <div style={sectionStyle}>
        <div style={sectionHeader} onClick={() => setCatOpen(!catOpen)}>
          <span style={{ fontFamily: "var(--font-seasons)", fontWeight: 600, color: "var(--plum)" }}>Categories</span>
          <span style={{ color: "var(--muted)", fontSize: "1rem" }}>{catOpen ? "▲" : "▼"}</span>
        </div>
        {catOpen && (
          <>
            {categories.map((cat) => (
              <div key={cat.id} style={{ ...fieldRow }}>
                {editingCat === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editCatData.name}
                      onChange={(e) => setEditCatData({ ...editCatData, name: e.target.value })}
                      style={{ flex: 1, padding: "0.35rem 0.6rem", borderRadius: "0.5rem", border: "1.5px solid var(--mango)", background: "#fff", fontFamily: "var(--font-seasons)", fontSize: "0.85rem", color: "var(--plum)" }}
                    />
                    <button onClick={() => handleEditCat(cat.id)} disabled={saving === "editCat" + cat.id} style={{ background: "none", border: "none", color: "var(--lime)", cursor: "pointer", lineHeight: 0 }}><Check size={16} /></button>
                    <button onClick={() => setEditingCat(null)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", lineHeight: 0 }}><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: cat.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>{cat.emoji}</div>
                    <span style={{ flex: 1, fontSize: "0.88rem", fontWeight: 600, color: "var(--plum)" }}>{cat.name}</span>
                    <button onClick={() => { setEditingCat(cat.id); setEditCatData({ name: cat.name, emoji: cat.emoji, color: cat.color }); }} style={{ background: "none", border: "none", color: "var(--grape)", cursor: "pointer", lineHeight: 0 }}><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteCat(cat.id)} disabled={saving === "delCat" + cat.id} style={{ background: "none", border: "none", color: "var(--cherry)", cursor: "pointer", lineHeight: 0 }}><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            ))}
            {/* Add new category */}
            {addingCat ? (
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid var(--smoke)", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "0.625rem", border: "1.5px solid var(--mango)", background: "#fff", fontFamily: "var(--font-seasons)", fontSize: "0.9rem", color: "var(--plum)" }}
                />
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setNewCatEmoji(e)} style={{ background: e === newCatEmoji ? "var(--mango)" : "var(--smoke)", border: "none", borderRadius: "0.5rem", padding: "4px 6px", cursor: "pointer", fontSize: "1rem" }}>{e}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setNewCatColor(c)} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: c === newCatColor ? "2.5px solid var(--plum)" : "2px solid transparent", cursor: "pointer" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={handleAddCategory} disabled={saving === "addCat"} style={{ flex: 1, padding: "0.6rem", borderRadius: "0.75rem", border: "none", background: "var(--mango)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Add</button>
                  <button onClick={() => setAddingCat(false)} style={{ padding: "0.6rem 1rem", borderRadius: "0.75rem", border: "1.5px solid var(--smoke)", background: "none", color: "var(--muted)", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingCat(true)}
                style={{ width: "100%", padding: "0.75rem", borderTop: "1px solid var(--smoke)", background: "none", border: "none", color: "var(--mango)", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <Plus size={16} /> Add category
              </button>
            )}
          </>
        )}
      </div>

      {/* Sign out */}
      <div style={{ padding: "0.5rem 1.25rem 1.5rem" }}>
        <SignOutButton />
      </div>
    </div>
  );
}
