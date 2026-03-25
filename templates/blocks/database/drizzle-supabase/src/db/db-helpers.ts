// src/db/index.ts

import { getDb } from "@/src/db";
import { users, subscriptions, payments, webhookEvents } from "./schema";
import { eq, sql } from "drizzle-orm";

const db = getDb();

// create user 
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
  const [user] = await db
    .insert(users)
    .values({
      email,
      authId,
      name,
      image,
      lastLoginAt,
    })
    .returning();

  return user;
}


// get user by id / email / authId
export async function getUser({
  field,
  value,
}: {
  field: "id" | "email" | "authId";
  value: string;
}) {
  let query;

  if (field === "id") {
    query = db.select().from(users).where(eq(users.id, value));
  } else if (field === "email") {
    query = db.select().from(users).where(eq(users.email, value));
  } else if (field === "authId") {
    query = db.select().from(users).where(eq(users.authId, value));
  }

  if (!query) return null;

  const [user] = await query;
  return user ?? null;
}

// create SUBSCRIPTION
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
  const [sub] = await db
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

  return sub;
}

// create payments 
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
  const [payment] = await db
    .insert(payments)
    .values({
      id,
      userId,
      amount,
      currency,
      status,
    })
    .returning();

  return payment;
}


//   get payment by id 
export async function getPaymentById(id: string) {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, id));

  return payment ?? null;
}


//   create webhook 
export async function createWebhookEvent({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  const [event] = await db
    .insert(webhookEvents)
    .values({
      id,
      type,
    })
    .returning();

  return event;
}


//   check is webhook alredy exist 
export async function hasWebhookEvent(id: string) {
  const [event] = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, id));

  return !!event;
}


export async function updateUserLogin({
  authId,
  lastLoginAt = new Date(),
}: {
  authId: string;
  lastLoginAt?: Date;
}) {
  const [user] = await db
    .update(users)
    .set({
      lastLoginAt,
      loginCount: sql`login_count + 1`,
    })
    .where(eq(users.authId, authId))
    .returning();

  return user;
}