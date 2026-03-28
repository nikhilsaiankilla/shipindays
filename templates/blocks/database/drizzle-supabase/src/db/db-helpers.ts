import { getDb } from ".";
import { users, subscriptions, payments, webhookEvents } from "./schema";
import { eq, sql } from "drizzle-orm";

const db = getDb();


// USER

// create a new user record
export async function createUser({
  email,
  authId,
  name,
  image,
  lastLoginAt,
}: {
  email: string;
  authId: string;
  name?: string;
  image?: string;
  lastLoginAt?: Date;
}) {
  const result = await db
    .insert(users)
    .values({
      email,
      authId,
      name,
      image,
      lastLoginAt,
    })
    .returning();

  return result[0];
}


// fetch user by unique field
export async function getUser({
  field,
  value,
}: {
  field: "id" | "email" | "authId";
  value: string;
}) {
  if (field === "id") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, value));

    return user;
  }

  if (field === "email") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, value));

    return user;
  }

  if (field === "authId") {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authId, value));

    return user;
  }

  return null;
}


// SUBSCRIPTIONS

// create subscription (initial insert)
export async function createSubscription({
  id,
  userId,
  planId,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
}: {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}) {
  const result = await db
    .insert(subscriptions)
    .values({
      id,
      userId,
      planId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    })
    .returning();

  return result[0];
}


// insert or update subscription on conflict (by userId)
export async function upsertSubscription({
  id,
  userId,
  planId,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd = false,
}: {
  id: string;
  userId: string;
  planId: string;
  status: string;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
}) {
  const result = await db
    .insert(subscriptions)
    .values({
      id,
      userId,
      planId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        id,
        planId,
        status,
        currentPeriodEnd,
        cancelAtPeriodEnd,
      },
    })
    .returning();

  return result[0];
}


// update subscription by provider subscription id
export async function updateSubscriptionById({
  id,
  data,
}: {
  id: string;
  data: Partial<{
    planId: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }>;
}) {
  try {
    const result = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.id, id))
      .returning();

    return result[0] ?? null;
  } catch {
    return null;
  }
}


// update subscription by userId
export async function updateSubscriptionByUserId({
  userId,
  data,
}: {
  userId: string;
  data: Partial<{
    planId: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  }>;
}) {
  try {
    const result = await db
      .update(subscriptions)
      .set(data)
      .where(eq(subscriptions.userId, userId))
      .returning();

    return result[0] ?? null;
  } catch {
    return null;
  }
}


// get user's subscription (single)
export async function getSubscriptionByUserId(userId: string) {
  return (
    (await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)))[0] ?? null
  );
}


// mark subscription as expired
export async function expireSubscription(id: string) {
  try {
    const result = await db
      .update(subscriptions)
      .set({ status: "expired" })
      .where(eq(subscriptions.id, id))
      .returning();

    return result[0] ?? null;
  } catch {
    return null;
  }
}


// PAYMENTS

// create payment record
export async function createPayment({
  id,
  userId,
  amount,
  currency = "USD",
  status,
}: {
  id: string;
  userId: string;
  amount: number;
  currency?: string;
  status: string;
}) {
  const result = await db.insert(payments).values({
    id,
    userId,
    amount,
    currency,
    status,
  }).returning();

  return result[0];
}


// get payment by id
export async function getPaymentById(id: string) {
  const [payment] = await db.select().from(payments).where(eq(payments?.id, id)).limit(1)
  return payment ?? null;
}


// update payment fields
export async function updatePaymentById({
  id,
  data,
}: {
  id: string;
  data: Partial<{
    providerTxnId: string;
    amount: number;
    currency: string;
    status: string;
  }>;
}) {
  try {
    const result = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();

    return result[0] ?? null;
  } catch {
    return null;
  }
}


// WEBHOOK EVENTS

// store processed webhook event (idempotency)
export async function createWebhookEvent({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  const result = await db.insert(webhookEvents).values({
    id,
    type,
  }).returning();

  return result[0];
}


// check if webhook event already processed
export async function hasWebhookEvent(id: string) {
  const event =
    (await db.select().from(webhookEvents).where(eq(webhookEvents.id, id)))[0];

  return !!event;
}


// USER TRACKING

// update last login + increment login count
export async function updateUserLogin({
  authId,
  lastLoginAt = new Date(),
}: {
  authId: string;
  lastLoginAt?: Date;
}) {
  const result = await db
    .update(users)
    .set({
      lastLoginAt,
      loginCount: sql`${users.loginCount} + 1`,
    })
    .where(eq(users.authId, authId))
    .returning();

  return result[0];
}