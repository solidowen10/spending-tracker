"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "./session";
import {
  createEntry,
  deleteEntry,
  updateEntry,
  createCategory,
  deleteCategory,
  updateCategory,
  setOverallLimit,
  setCategoryLimit,
  updateUserCurrency,
} from "./data";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function getUserId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

// ─── Entries ────────────────────────────────────────────────────────────────

export async function addEntry(
  amount: number,
  categoryId: string | null,
  date: string,
  note: string | null,
): Promise<Result> {
  if (!amount || amount <= 0) return { ok: false, error: "Amount must be greater than zero." };
  const userId = await getUserId();
  await createEntry(userId, { amount, categoryId, date, note });
  revalidatePath("/dashboard");
  revalidatePath("/entries");
  return { ok: true };
}

export async function editEntry(
  id: string,
  amount: number,
  categoryId: string | null,
  date: string,
  note: string | null,
): Promise<Result> {
  if (!amount || amount <= 0) return { ok: false, error: "Amount must be greater than zero." };
  const userId = await getUserId();
  await updateEntry(userId, id, { amount, categoryId, date, note });
  revalidatePath("/dashboard");
  revalidatePath("/entries");
  return { ok: true };
}

export async function removeEntry(id: string): Promise<Result> {
  const userId = await getUserId();
  await deleteEntry(userId, id);
  revalidatePath("/dashboard");
  revalidatePath("/entries");
  return { ok: true };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function addCategory(
  name: string,
  emoji: string,
  color: string,
): Promise<Result> {
  if (!name.trim()) return { ok: false, error: "Category name cannot be empty." };
  const userId = await getUserId();
  await createCategory(userId, { name: name.trim(), emoji, color });
  revalidatePath("/settings");
  return { ok: true };
}

export async function editCategory(
  id: string,
  data: Partial<{ name: string; emoji: string; color: string }>,
): Promise<Result> {
  if (data.name !== undefined && !data.name.trim())
    return { ok: false, error: "Category name cannot be empty." };
  const userId = await getUserId();
  await updateCategory(userId, id, data);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function removeCategory(id: string): Promise<Result> {
  const userId = await getUserId();
  await deleteCategory(userId, id);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

// ─── Budget limits ───────────────────────────────────────────────────────────

export async function setOverallLimitAction(amount: number | null): Promise<Result> {
  if (amount !== null && amount < 0) return { ok: false, error: "Limit must be a positive number." };
  const userId = await getUserId();
  await setOverallLimit(userId, amount);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true };
}

export async function setCategoryLimitAction(
  categoryId: string,
  amount: number | null,
): Promise<Result> {
  if (amount !== null && amount < 0) return { ok: false, error: "Limit must be a positive number." };
  const userId = await getUserId();
  await setCategoryLimit(userId, categoryId, amount);
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true };
}

// ─── User preferences ────────────────────────────────────────────────────────

export async function updateCurrencyAction(currency: string): Promise<Result> {
  const userId = await getUserId();
  await updateUserCurrency(userId, currency);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
