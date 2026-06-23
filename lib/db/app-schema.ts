import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  numeric,
  date,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const limitPeriod = pgEnum("limit_period", ["monthly", "yearly"]);

export const category = pgTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    emoji: text("emoji").notNull().default("🛒"),
    color: text("color").notNull().default("#FF8A3D"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("category_user_idx").on(table.userId)],
);

export const entry = pgTable(
  "entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),
    amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    note: text("note"),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("entry_user_idx").on(table.userId),
    index("entry_user_date_idx").on(table.userId, table.date),
    index("entry_category_idx").on(table.categoryId),
  ],
);

export const budgetLimit = pgTable(
  "budget_limit",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // null categoryId = the overall "all spending" limit
    categoryId: text("category_id").references(() => category.id, {
      onDelete: "cascade",
    }),
    period: limitPeriod("period").notNull().default("monthly"),
    amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("budget_limit_user_idx").on(table.userId, table.categoryId)],
);

export const categoryRelations = relations(category, ({ one, many }) => ({
  user: one(user, { fields: [category.userId], references: [user.id] }),
  entries: many(entry),
  limits: many(budgetLimit),
}));

export const entryRelations = relations(entry, ({ one }) => ({
  user: one(user, { fields: [entry.userId], references: [user.id] }),
  category: one(category, { fields: [entry.categoryId], references: [category.id] }),
}));

export const budgetLimitRelations = relations(budgetLimit, ({ one }) => ({
  user: one(user, { fields: [budgetLimit.userId], references: [user.id] }),
  category: one(category, { fields: [budgetLimit.categoryId], references: [category.id] }),
}));
