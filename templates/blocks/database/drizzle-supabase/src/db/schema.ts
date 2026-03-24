import { 
    pgTable, 
    text, 
    timestamp, 
    integer, 
    boolean, 
    uuid, 
    varchar, 
    index 
} from "drizzle-orm/pg-core";

// 1. USERS (Auth & Metadata)
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    image: text("image"),
    
    // Auth Integration
    authId: varchar("auth_id", { length: 255 }).notNull().unique(), // Link to Clerk/Lucia/Supabase ID

    // --- TRACKING FIELDS ---
    loginCount: integer("login_count").default(0).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    emailIdx: index("email_idx").on(table.email),
    authIdIdx: index("auth_id_idx").on(table.authId),
}));

// 2. SUBSCRIPTIONS (Billing State)
export const subscriptions = pgTable("subscriptions", {
    id: varchar("id", { length: 255 }).primaryKey(), // Provider Sub ID (e.g., sub_123)
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
    
    planId: varchar("plan_id", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'active', 'past_due', 'canceled'
    
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. PAYMENTS (Transaction History)
export const payments = pgTable("payments", {
    id: varchar("id", { length: 255 }).primaryKey(), // Provider Transaction ID
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    
    amount: integer("amount").notNull(), // In cents
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'succeeded', 'failed'
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    userIdx: index("payment_user_idx").on(table.userId),
}));

// 4. WEBHOOK EVENTS (Idempotency Guard)
export const webhookEvents = pgTable("webhook_events", {
    id: varchar("id", { length: 255 }).primaryKey(), // Provider Event ID (evt_123)
    type: varchar("type", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. NOTIFICATIONS (Email/System Logs)
export const notifications = pgTable("notifications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    
    type: varchar("type", { length: 100 }).notNull(), // 'WELCOME_EMAIL', 'INVOICE_PAID'
    sentAt: timestamp("sent_at").defaultNow().notNull(),
}, (table) => ({
    userIdx: index("notification_user_idx").on(table.userId),
}));