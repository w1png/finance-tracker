import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { subscriptions } from "~/lib/shared/types/subscriptions";

export const createTable = pgTableCreator((name) => `project_${name}`);

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER"]);

export const files = createTable("files", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  contentType: varchar("content_type", { length: 255 }).notNull(),

  objectId: varchar("object_id", { length: 255 }).notNull(),
  createdById: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptionEnum = pgEnum("subscription", [
  "start",
  "basic",
  "pro",
]);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  currentSubscription: subscriptionEnum("current_subscription")
    .default("start")
    .notNull(),
  subscriptionEndsAt: timestamp("subscription_ends_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  receiptsLeft: integer("receipts_left")
    .notNull()
    .default(subscriptions[0].receiptsPerMonth),
  image: varchar("image", { length: 255 }),
  role: userRoleEnum("role").default("USER"),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const receipts = createTable("receipts", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  fileId: varchar("file_id", { length: 255 })
    .notNull()
    .references(() => files.id),
  isSaved: boolean("is_saved").notNull().default(false),

  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),

  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  file: one(files, { fields: [receipts.fileId], references: [files.id] }),
  expenses: many(expenses),
  createdBy: one(users, {
    fields: [receipts.createdById],
    references: [users.id],
  }),
}));

export const expenseTypeEnum = pgEnum("expense_type", [
  "GROCERIES",
  "TRANSPORTATION",
  "ELECTRONICS",
  "BILLS",
  "FURNITURE",
  "RESTAURANT",
]);

export const expenses = createTable("expenses", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  title: varchar("title", { length: 255 }).notNull(),
  quantity: integer("amount").notNull(),
  price: integer("price").notNull(),

  receiptId: varchar("receipt_id", { length: 255 })
    .notNull()
    .references(() => receipts.id),
  type: expenseTypeEnum("expense_type").notNull(),
  createdById: varchar("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  receipt: one(receipts, {
    fields: [expenses.receiptId],
    references: [receipts.id],
  }),
}));

export const paymentStatuses = [
  "pending",
  "waiting_for_capture",
  "succeeded",
  "canceled",
] as const;

export const paymentStatusesEnum = pgEnum("payment_status", paymentStatuses);

export const payments = createTable("payments", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  idempotencyKey: varchar("idempotency_key", { length: 255 })
    .notNull()
    .unique(),
  yookassaId: varchar("yookassa_id", { length: 255 }).notNull().unique(),
  confirmationUrl: varchar("confirmation_url", { length: 255 }).notNull(),

  amount: integer("amount").notNull(),
  incomeAmount: integer("income_amount"),
  status: paymentStatusesEnum("status").notNull().default("pending"),
  paid: boolean("paid").notNull().default(false),

  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),

  subscription: subscriptionEnum("subscription").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));
