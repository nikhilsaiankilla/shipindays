// src/db/index.ts

import { prisma } from "@/src/db";

// USER
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
  return prisma.user.create({
    data: {
      email,
      authId,
      name,
      image,
      lastLoginAt,
    },
  });
}

export async function getUser({
  field,
  value,
}: {
  field: "id" | "email" | "authId";
  value: string;
}) {
  if (field === "id") {
    return prisma.user.findUnique({ where: { id: value } });
  }

  if (field === "email") {
    return prisma.user.findUnique({ where: { email: value } });
  }

  if (field === "authId") {
    return prisma.user.findUnique({ where: { authId: value } });
  }

  return null;
}

// SUBSCRIPTIONS

// keep but DO NOT use in webhooks
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
  return prisma.subscription.create({
    data: {
      id,
      userId,
      planId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
  });
}

// MAIN METHOD (use this everywhere)
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
  return prisma.subscription.upsert({
    where: {
      userId, // unique constraint
    },
    create: {
      id,
      userId,
      planId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
    update: {
      id,
      planId,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    },
  });
}

// update by provider subscription id
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
  return prisma.subscription.update({
    where: { id },
    data,
  }).catch(() => null); // prevent crash if not found
}

// update by userId (safer fallback)
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
  return prisma.subscription.update({
    where: { userId },
    data,
  }).catch(() => null);
}

// get subscription
export async function getSubscriptionByUserId(userId: string) {
  return prisma.subscription.findUnique({
    where: { userId },
  });
}

// expire subscription
export async function expireSubscription(id: string) {
  return prisma.subscription.update({
    where: { id },
    data: {
      status: "expired",
    },
  }).catch(() => null);
}

// PAYMENTS
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
  return prisma.payment.create({
    data: {
      id,
      userId,
      amount,
      currency,
      status,
    },
  });
}

export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
  });
}

// WEBHOOK EVENTS
export async function createWebhookEvent({
  id,
  type,
}: {
  id: string;
  type: string;
}) {
  return prisma.webhookEvent.create({
    data: {
      id,
      type,
    },
  });
}

export async function hasWebhookEvent(id: string) {
  const event = await prisma.webhookEvent.findUnique({
    where: { id },
  });

  return !!event;
}

// USER TRACKING
export async function updateUserLogin({
  authId,
  lastLoginAt = new Date(),
}: {
  authId: string;
  lastLoginAt?: Date;
}) {
  return prisma.user.update({
    where: { authId },
    data: {
      lastLoginAt,
      loginCount: {
        increment: 1,
      },
    },
  });
}

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
  return prisma.payment
    .update({
      where: { id },
      data: {
        ...data,
      },
    })
    .catch(() => null); // prevents crash if payment not found
}