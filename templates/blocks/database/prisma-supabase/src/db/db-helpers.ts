import { prisma } from '@/src/lib/prisma'

// USER

// create a new user
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


// fetch user by unique field
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

// direct insert (avoid using in webhook flows)
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


// insert or update subscription (primary method)
// ensures one subscription per user (userId must be unique)
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
            userId,
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


// update using provider subscription id
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
    }).catch(() => null); // return null if not found
}


// update using userId (fallback path)
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


// get user's subscription
export async function getSubscriptionByUserId(userId: string) {
    return prisma.subscription.findUnique({
        where: { userId },
    });
}


// mark subscription as expired
export async function expireSubscription(id: string) {
    return prisma.subscription.update({
        where: { id },
        data: {
            status: "expired",
        },
    }).catch(() => null);
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


// fetch payment by id
export async function getPaymentById(id: string) {
    return prisma.payment.findUnique({
        where: { id },
    });
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
    return prisma.webhookEvent.create({
        data: {
            id,
            type,
        },
    });
}


// check if webhook event already handled
export async function hasWebhookEvent(id: string) {
    const event = await prisma.webhookEvent.findUnique({
        where: { id },
    });

    return !!event;
}


// USER TRACKING

// update login timestamp + increment login count
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
    return prisma.payment
        .update({
            where: { id },
            data: {
                ...data,
            },
        })
        .catch(() => null); // return null if not found
}