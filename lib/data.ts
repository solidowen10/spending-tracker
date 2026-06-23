import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { db } from "./db";
import { budgetLimit, category, entry, user } from "./db/schema";

export const DEFAULT_CATEGORIES = [
  { name: "Food & Drink", emoji: "🍜", color: "#FF8A3D" },
  { name: "Transport", emoji: "🚗", color: "#7C5CFC" },
  { name: "Shopping", emoji: "🛍️", color: "#FF5C72" },
  { name: "Bills & Utilities", emoji: "💡", color: "#4ECB71" },
  { name: "Entertainment", emoji: "🎬", color: "#FFC93C" },
  { name: "Health", emoji: "💊", color: "#4FB0E0" },
  { name: "Other", emoji: "🧩", color: "#B98AF0" },
] as const;

// ---------- Categories ----------

export async function ensureDefaultCategories(userId: string) {
  const existing = await db
    .select({ id: category.id })
    .from(category)
    .where(eq(category.userId, userId))
    .limit(1);

  if (existing.length > 0) return;

  await db.insert(category).values(
    DEFAULT_CATEGORIES.map((c, i) => ({ ...c, userId, sortOrder: i })),
  );
}

export async function getCategories(userId: string) {
  await ensureDefaultCategories(userId);
  return db
    .select()
    .from(category)
    .where(eq(category.userId, userId))
    .orderBy(category.sortOrder, category.createdAt);
}

export async function createCategory(
  userId: string,
  data: { name: string; emoji: string; color: string },
) {
  const rows = await db
    .select({ sortOrder: category.sortOrder })
    .from(category)
    .where(eq(category.userId, userId))
    .orderBy(desc(category.sortOrder))
    .limit(1);
  const nextSort = (rows[0]?.sortOrder ?? -1) + 1;

  const [row] = await db
    .insert(category)
    .values({ userId, ...data, sortOrder: nextSort })
    .returning();
  return row;
}

export async function updateCategory(
  userId: string,
  id: string,
  data: Partial<{ name: string; emoji: string; color: string }>,
) {
  const [row] = await db
    .update(category)
    .set(data)
    .where(and(eq(category.id, id), eq(category.userId, userId)))
    .returning();
  return row;
}

export async function deleteCategory(userId: string, id: string) {
  await db.delete(category).where(and(eq(category.id, id), eq(category.userId, userId)));
}

// ---------- Entries ----------

export type EntryWithCategory = {
  id: string;
  amount: number;
  note: string | null;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryEmoji: string | null;
  categoryColor: string | null;
};

export async function getEntriesForMonth(
  userId: string,
  year: number,
  month: number,
): Promise<EntryWithCategory[]> {
  const from = format(startOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const to = format(endOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");

  return db
    .select({
      id: entry.id,
      amount: entry.amount,
      note: entry.note,
      date: entry.date,
      categoryId: entry.categoryId,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      categoryColor: category.color,
    })
    .from(entry)
    .leftJoin(category, eq(entry.categoryId, category.id))
    .where(and(eq(entry.userId, userId), gte(entry.date, from), lte(entry.date, to)))
    .orderBy(desc(entry.date), desc(entry.createdAt));
}

export async function createEntry(
  userId: string,
  data: { amount: number; categoryId: string | null; date: string; note?: string | null },
) {
  const [row] = await db
    .insert(entry)
    .values({
      userId,
      amount: data.amount,
      categoryId: data.categoryId,
      date: data.date,
      note: data.note ?? null,
    })
    .returning();
  return row;
}

export async function updateEntry(
  userId: string,
  id: string,
  data: Partial<{ amount: number; categoryId: string | null; date: string; note: string | null }>,
) {
  const [row] = await db
    .update(entry)
    .set(data)
    .where(and(eq(entry.id, id), eq(entry.userId, userId)))
    .returning();
  return row;
}

export async function deleteEntry(userId: string, id: string) {
  await db.delete(entry).where(and(eq(entry.id, id), eq(entry.userId, userId)));
}

// ---------- Budget limits (monthly only, for now) ----------

export async function getMonthlyLimits(userId: string) {
  const rows = await db
    .select()
    .from(budgetLimit)
    .where(and(eq(budgetLimit.userId, userId), eq(budgetLimit.period, "monthly")));

  const overall = rows.find((r) => r.categoryId === null)?.amount ?? null;
  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    if (r.categoryId) byCategory[r.categoryId] = r.amount;
  }
  return { overall, byCategory };
}

async function upsertLimit(
  userId: string,
  categoryId: string | null,
  amount: number | null,
) {
  const condition = categoryId
    ? and(eq(budgetLimit.userId, userId), eq(budgetLimit.categoryId, categoryId), eq(budgetLimit.period, "monthly"))
    : and(eq(budgetLimit.userId, userId), isNull(budgetLimit.categoryId), eq(budgetLimit.period, "monthly"));

  const existing = await db.select({ id: budgetLimit.id }).from(budgetLimit).where(condition).limit(1);

  if (amount === null) {
    if (existing[0]) await db.delete(budgetLimit).where(eq(budgetLimit.id, existing[0].id));
    return;
  }

  if (existing[0]) {
    await db.update(budgetLimit).set({ amount }).where(eq(budgetLimit.id, existing[0].id));
  } else {
    await db.insert(budgetLimit).values({ userId, categoryId, period: "monthly", amount });
  }
}

export async function setOverallLimit(userId: string, amount: number | null) {
  return upsertLimit(userId, null, amount);
}

export async function setCategoryLimit(userId: string, categoryId: string, amount: number | null) {
  const ownedCategory = await db
    .select({ id: category.id })
    .from(category)
    .where(and(eq(category.id, categoryId), eq(category.userId, userId)))
    .limit(1);

  if (!ownedCategory[0]) {
    throw new Error("Category does not belong to this user.");
  }

  return upsertLimit(userId, categoryId, amount);
}

// ---------- Dashboard summaries ----------

export type CategorySpend = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  spent: number;
  limit: number | null;
};

export async function getMonthlySummary(userId: string, year: number, month: number) {
  const [categories, entries, limits] = await Promise.all([
    getCategories(userId),
    getEntriesForMonth(userId, year, month),
    getMonthlyLimits(userId),
  ]);

  let total = 0;
  const spentByCategory = new Map<string, number>();
  const dailyTotals = new Map<string, number>();

  for (const e of entries) {
    total += e.amount;
    if (e.categoryId) {
      spentByCategory.set(e.categoryId, (spentByCategory.get(e.categoryId) ?? 0) + e.amount);
    }
    dailyTotals.set(e.date, (dailyTotals.get(e.date) ?? 0) + e.amount);
  }

  const perCategory: CategorySpend[] = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      spent: spentByCategory.get(c.id) ?? 0,
      limit: limits.byCategory[c.id] ?? null,
    }))
    .sort((a, b) => b.spent - a.spent);

  return {
    total,
    overallLimit: limits.overall,
    perCategory,
    dailyTotals: Object.fromEntries(dailyTotals) as Record<string, number>,
    entries,
  };
}

export async function getYearlySummary(userId: string, year: number) {
  const categories = await getCategories(userId);
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;

  const entries = await db
    .select({ amount: entry.amount, date: entry.date, categoryId: entry.categoryId })
    .from(entry)
    .where(and(eq(entry.userId, userId), gte(entry.date, from), lte(entry.date, to)));

  let total = 0;
  const perMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));
  const spentByCategory = new Map<string, number>();

  for (const e of entries) {
    total += e.amount;
    const monthIndex = Number(e.date.slice(5, 7)) - 1;
    perMonth[monthIndex].total += e.amount;
    if (e.categoryId) {
      spentByCategory.set(e.categoryId, (spentByCategory.get(e.categoryId) ?? 0) + e.amount);
    }
  }

  const perCategory = categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      spent: spentByCategory.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.spent - a.spent);

  return { total, perMonth, perCategory };
}

// ---------- User settings ----------

export async function updateUserCurrency(userId: string, currency: string) {
  await db.update(user).set({ currency }).where(eq(user.id, userId));
}
