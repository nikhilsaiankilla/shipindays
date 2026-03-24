import { stripe } from "@/src/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return new NextResponse("Missing security headers", { status: 400 });
    }

    let event: Stripe.Event;

    // 1. Verify Authenticity
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            webhookSecret
        );
    } catch (err: any) {
        console.error("Stripe Webhook verification failed:", err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 2. SaaS Event Logic
    // Using the same internal helper names as the Dodo implementation
    switch (event.type) {
        // Triggered on first successful payment or renewal
        case "checkout.session.completed":
        case "invoice.payment_succeeded": {
            const session = event.data.object as any;
            // Stripe subscriptions are usually found on the session or invoice
            const subscriptionId = session.subscription as string;

            await updateSubscription({
                subscriptionId: subscriptionId,
                customerId: session.customer as string,
                status: "active",
                email: session.customer_details?.email || session.customer_email,
            });
            break;
        }

        // Triggered when a subscription is cancelled or expires
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            await updateSubscription({
                subscriptionId: subscription.id,
                status: "expired",
            });
            break;
        }

        // One-time payment (non-subscription)
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            await handleOneTimePayment({
                orderId: paymentIntent.id,
                email: paymentIntent.receipt_email,
                amount: paymentIntent.amount,
            });
            break;
        }

        default:
            console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return new NextResponse("Webhook processed", { status: 200 });
}

/**
 * Common Helpers - Keep these identical across both files!
 */
async function updateSubscription({ subscriptionId, status, customerId, email }: any) {
    console.log(`Syncing DB for Sub: ${subscriptionId} -> Status: ${status}`);
}

async function handleOneTimePayment({ orderId, email, amount }: any) {
    console.log(`Granting credits for Order: ${orderId} to ${email}`);
}