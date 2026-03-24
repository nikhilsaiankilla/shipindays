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

// get user by email / id / authid 
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

// create subscription
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

// create payment 
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

// get payment by id 
export async function getPaymentById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
  });
}

// create webhook 
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

// check webhook 
export async function hasWebhookEvent(id: string) {
  const event = await prisma.webhookEvent.findUnique({
    where: { id },
  });

  return !!event;
}

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