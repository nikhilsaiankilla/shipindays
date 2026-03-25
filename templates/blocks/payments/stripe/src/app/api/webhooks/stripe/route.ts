import { stripe } from "@/src/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import {
    getUser,
    upsertSubscription,
    updateSubscriptionById,
    expireSubscription,
    createPayment,
    createWebhookEvent,
    hasWebhookEvent,
} from "@/src/db/db-helpers";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headerList = await headers();

        const signature = headerList.get("Stripe-Signature") as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return new NextResponse("Missing security headers", { status: 400 });
        }

        // 1. Verify webhook
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret
            );
        } catch (err: any) {
            console.error("Stripe verification failed:", err.message);
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const webhookId = event.id;

        // 2. Idempotency
        const alreadyProcessed = await hasWebhookEvent(webhookId);
        if (alreadyProcessed) {
            return new NextResponse("Already processed", { status: 200 });
        }

        // 3. Store event
        await createWebhookEvent({
            id: webhookId,
            type: event.type,
        });

        const data = event.data.object;

        // 4. Handle events
        switch (event.type) {
            // FIRST SUBSCRIPTION CREATE (Checkout)
            case "checkout.session.completed": {
                const session = data as Stripe.Checkout.Session;

                if (session.mode !== "subscription") break;

                const subscriptionId = session.subscription as string;

                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error("Missing userId in metadata");
                    break;
                }

                const user = await getUser({
                    field: "id",
                    value: userId,
                });

                if (!user) {
                    console.error("User not found:", userId);
                    break;
                }

                // Fetch full subscription (important)
                const subscription = await stripe.subscriptions.retrieve(
                    subscriptionId
                );

                await upsertSubscription({
                    id: subscription.id,
                    userId: user.id,
                    planId:
                        subscription.items.data[0]?.price.id || "default",
                    status: subscription.status,
                    currentPeriodEnd: new Date(
                        subscription.current_period_end * 1000
                    ),
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                });

                break;
            }

            // RENEWALS
            case "invoice.payment_succeeded": {
                const invoice = data as Stripe.Invoice;

                if (!invoice.subscription) break;

                const subscriptionId = invoice.subscription as string;

                // Fetch latest subscription state
                const subscription = await stripe.subscriptions.retrieve(
                    subscriptionId
                );

                await updateSubscriptionById({
                    id: subscription.id,
                    data: {
                        status: subscription.status,
                        planId:
                            subscription.items.data[0]?.price.id ||
                            "default",
                        currentPeriodEnd: new Date(
                            subscription.current_period_end * 1000
                        ),
                        cancelAtPeriodEnd:
                            subscription.cancel_at_period_end,
                    },
                });

                break;
            }

            // PLAN CHANGE / UPDATE
            case "customer.subscription.updated": {
                const subscription = data as Stripe.Subscription;

                await updateSubscriptionById({
                    id: subscription.id,
                    data: {
                        status: subscription.status,
                        planId:
                            subscription.items.data[0]?.price.id ||
                            "default",
                        currentPeriodEnd: new Date(
                            subscription.current_period_end * 1000
                        ),
                        cancelAtPeriodEnd:
                            subscription.cancel_at_period_end,
                    },
                });

                break;
            }

            // CANCELLED
            case "customer.subscription.deleted": {
                const subscription = data as Stripe.Subscription;

                await expireSubscription(subscription.id);

                break;
            }

            // ONE TIME PAYMENT
            case "payment_intent.succeeded": {
                const paymentIntent = data as Stripe.PaymentIntent;

                const userId = paymentIntent.metadata?.userId;

                if (!userId) {
                    console.error("Missing userId in metadata");
                    break;
                }

                await createPayment({
                    id: paymentIntent.id,
                    userId,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: "success",
                });

                break;
            }

            default:
                console.log(`Unhandled Stripe event: ${event.type}`);
        }

        return new NextResponse("Webhook processed", { status: 200 });
    } catch (err) {
        console.error("Stripe webhook error:", err);
        return new NextResponse("Webhook failed", { status: 500 });
    }
}