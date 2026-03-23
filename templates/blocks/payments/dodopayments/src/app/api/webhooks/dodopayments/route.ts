import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
});

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("x-dodo-signature");
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

    if (!signature || !webhookKey) {
        return new NextResponse("Missing signature or webhook key", { status: 400 });
    }

    // 1. Verify Webhook Authenticity
    // Note: Dodo uses standard HmacSHA256. Verify documentation for their latest SDK helper.
    try {
        const isVerified = dodo.webhooks.verifySignature({
            payload: body,
            signature,
            secret: webhookKey,
        });

        if (!isVerified) throw new Error("Invalid signature");
    } catch (err) {
        return new NextResponse("Webhook verification failed", { status: 401 });
    }

    const event = JSON.parse(body);

    // 2. Handle specific event types
    switch (event.type) {
        case "subscription.created":
            const subscription = event.data;
            console.log(`Subscription started for: ${subscription.customer.email}`);
            // Update DB: user.isSubscribed = true, user.dodoSubscriptionId = subscription.id
            break;

        case "subscription.cancelled":
            // Update DB: user.isSubscribed = false
            break;

        case "order.success":
            // Logic for one-time payments
            console.log(`One-time payment successful: ${event.data.transaction_id}`);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse("OK", { status: 200 });
}