import { NextResponse } from "next/server";
import { DodoPayments } from "dodopayments";

import {
    getUser,
    upsertSubscription,
    updateSubscriptionById,
    expireSubscription,
    createPayment,
    createWebhookEvent,
    hasWebhookEvent,
} from "@/src/db/db-helpers";

const ENVIRONMENT = process.env.DODO_ENV === "live" ? "live" : "test";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: ENVIRONMENT === "live" ? "live_mode" : "test_mode",
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
});

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();

        const webhookId = req.headers.get("webhook-id")!;
        const signature = req.headers.get("webhook-signature")!;
        const timestamp = req.headers.get("webhook-timestamp")!;

        // 1. Verify webhook
        const event = dodo.webhooks.unwrap(rawBody, {
            headers: {
                "webhook-id": webhookId,
                "webhook-signature": signature,
                "webhook-timestamp": timestamp,
            },
        });

        if (!event) {
            return new NextResponse("Invalid webhook", { status: 400 });
        }

        // 2. Idempotency
        const alreadyProcessed = await hasWebhookEvent(webhookId);
        if (alreadyProcessed) {
            return new NextResponse("Already processed", { status: 200 });
        }

        const data = event.data;

        // 3. Store event
        await createWebhookEvent({
            id: webhookId,
            type: event.type,
        });

        // 4. Handle events
        switch (event.type) {
            // SUB CREATED / RENEWED
            case "subscription.active": {
                const metadata = data?.metadata ?? {};
                const userId = metadata?.userId;

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

                await upsertSubscription({
                    id: data.subscription_id,
                    userId: user.id,
                    planId: data.product_id || "default",
                    status: "active",
                    currentPeriodEnd: new Date(data.next_billing_date),
                    cancelAtPeriodEnd:
                        data.cancel_at_next_billing_date ?? false,
                });

                break;
            }

            // CANCELLED / EXPIRED
            case "subscription.cancelled":
            case "subscription.expired": {
                const subId = data.subscription_id;

                if (!subId) {
                    console.error("Missing subscription_id");
                    break;
                }

                await expireSubscription(subId);

                break;
            }

            // PLAN CHANGE / UPDATE
            case "subscription.updated": {
                const subId = data.subscription_id;

                if (!subId) {
                    console.error("Missing subscription_id");
                    break;
                }

                await updateSubscriptionById({
                    id: subId,
                    data: {
                        planId: data.product_id,
                        status: data.status || "active",
                        currentPeriodEnd: new Date(data.next_billing_date),
                        cancelAtPeriodEnd:
                            data.cancel_at_next_billing_date ?? false,
                    },
                });

                break;
            }

            // ONE-TIME PAYMENT
            case "order.success": {
                const metadata = data?.metadata ?? {};
                const userId = metadata?.userId;

                if (!userId) {
                    console.error("Missing userId in metadata");
                    break;
                }

                await createPayment({
                    id: data.order_id,
                    userId,
                    amount: data.total_amount,
                    currency: data.currency || "USD",
                    status: "success",
                });

                break;
            }

            default:
                console.log(`Unhandled event: ${event.type}`);
        }

        return new NextResponse("Webhook processed", { status: 200 });
    } catch (err) {
        console.error("Webhook error:", err);
        return new NextResponse("Webhook failed", { status: 500 });
    }
}