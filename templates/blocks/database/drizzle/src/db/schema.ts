import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// 1. Users (Auth)
export const users = pgTable("users", {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Subscriptions (Billing State)
export const subscriptions = pgTable("subscriptions", {
    id: text("id").primaryKey(), // Provider Sub ID
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
    planId: text("plan_id").notNull(),
    status: text("status").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
});

// 3. Payments (History)
export const payments = pgTable("payments", {
    id: text("id").primaryKey(), // Provider Transaction ID
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").default("USD").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Webhook Events (Idempotency)
export const webhookEvents = pgTable("webhook_events", {
    id: text("id").primaryKey(),
    type: text("type").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. Notifications (Email Logs)
export const notifications = pgTable("notifications", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    type: text("type").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
});