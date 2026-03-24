import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
});

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("x-dodo-signature");
    const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return new NextResponse("Missing security headers", { status: 400 });
    }

    // 1. Verify Authenticity
    try {
        const isVerified = dodo.webhooks.verifySignature({
            payload: body,
            signature,
            secret: webhookSecret,
        });

        if (!isVerified) throw new Error("Invalid signature");
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const event = JSON.parse(body);
    const data = event.data;

    // 2. SaaS Event Logic
    switch (event.type) {
        // Occurs when a subscription is first created or successfully renewed
        case "subscription.active":
            await updateSubscription({
                subscriptionId: data.subscription_id,
                customerId: data.customer.customer_id,
                status: "active",
                email: data.customer.email,
            });
            break;

        // Occurs if a payment fails or the user cancels
        case "subscription.cancelled":
        case "subscription.expired":
            await updateSubscription({
                subscriptionId: data.subscription_id,
                status: "expired",
            });
            break;

        // One-time payment (if the user buys a 'credit' or 'addon')
        case "order.success":
            await handleOneTimePayment({
                orderId: data.order_id,
                email: data.customer.email,
                amount: data.total_amount,
            });
            break;

        default:
            console.log(`Unhandled Dodo event: ${event.type}`);
    }

    return new NextResponse("Webhook processed", { status: 200 });
}

/**
 * Helper Mockups - Replace with your DB logic (Prisma, Supabase, etc.)
 */
async function updateSubscription({ subscriptionId, status, customerId, email }: any) {
    console.log(`Syncing DB for Sub: ${subscriptionId} -> Status: ${status}`);
    // Example: await db.user.update({ where: { email }, data: { subscriptionId, status } })
}

async function handleOneTimePayment({ orderId, email, amount }: any) {
    console.log(`Granting credits for Order: ${orderId} to ${email}`);
}