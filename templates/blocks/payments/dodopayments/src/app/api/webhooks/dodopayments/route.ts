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
    updatePaymentById
} from "@/src/db/db-helpers";

const ENVIRONMENT = process.env.DODO_ENV === "live" ? "live" : "test";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: ENVIRONMENT === "live" ? "live_mode" : "test_mode",
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
});

// TYPES
type SubscriptionEventData = {
    subscription_id: string;
    product_id?: string;
    next_billing_date: string;
    cancel_at_next_billing_date?: boolean;
    status?: string;
    metadata?: {
        userId?: string;
        txnId?: string;
    };
};

type OrderSuccessData = {
    order_id: string;
    total_amount: number;
    currency?: string;
    metadata?: {
        userId?: string;
        txnId?: string;
    };
};

// HANDLERS
async function handleSubscriptionActive(data: SubscriptionEventData) {
    const subscriptionId = data.subscription_id;
    const productId = data.product_id ?? "default";
    const nextBillingDate = new Date(data.next_billing_date);
    const cancelAtPeriodEnd = data.cancel_at_next_billing_date ?? false;
    const userId = data.metadata?.userId;

    if (!subscriptionId) {
        console.error("Missing subscriptionId");
        return;
    }

    if (!userId) {
        console.error("Missing userId in metadata");
        return;
    }

    const user = await getUser({
        field: "id",
        value: userId,
    });

    if (!user) {
        console.error("User not found:", userId);
        return;
    }

    await upsertSubscription({
        id: subscriptionId,
        userId: user.id,
        planId: productId,
        status: "active",
        currentPeriodEnd: nextBillingDate,
        cancelAtPeriodEnd,
    });
}


async function handleSubscriptionCancelled(data: SubscriptionEventData) {
    const subscriptionId = data.subscription_id;

    if (!subscriptionId) {
        console.error("Missing subscriptionId");
        return;
    }

    await expireSubscription(subscriptionId);
}


async function handleSubscriptionUpdated(data: SubscriptionEventData) {
    const subscriptionId = data.subscription_id;
    const productId = data.product_id ?? "default";
    const nextBillingDate = new Date(data.next_billing_date);
    const cancelAtPeriodEnd = data.cancel_at_next_billing_date ?? false;
    const status = data.status ?? "active";

    if (!subscriptionId) {
        console.error("Missing subscriptionId");
        return;
    }

    await updateSubscriptionById({
        id: subscriptionId,
        data: {
            planId: productId,
            status,
            currentPeriodEnd: nextBillingDate,
            cancelAtPeriodEnd,
        },
    });
}


async function handleOrderSuccess(data: OrderSuccessData) {
    const orderId = data.order_id;
    const amount = data.total_amount;
    const currency = data.currency ?? "USD";

    const userId = data.metadata?.userId;
    const txnId = data.metadata?.txnId;

    if (!orderId) {
        console.error("Missing orderId");
        return;
    }

    if (!userId) {
        console.error("Missing userId in metadata");
        return;
    }

    if (!amount) {
        console.error("Missing amount");
        return;
    }

    // Prefer txnId (your internal tracking)
    const paymentId = txnId || orderId;

    await createPayment({
        id: paymentId,
        userId,
        amount,
        currency,
        status: "success",
    });
}

function isSubscriptionData(data: any): data is SubscriptionEventData {
    return typeof data?.subscription_id === "string";
}

function isOrderSuccessData(data: any): data is OrderSuccessData {
    return (
        typeof data?.order_id === "string" &&
        typeof data?.total_amount === "number"
    );
}

// ================= MAIN ROUTE =================

export async function POST(req: Request) {
    try {
        const rawBody = await req.text();

        const webhookId = req.headers.get("webhook-id");
        const signature = req.headers.get("webhook-signature");
        const timestamp = req.headers.get("webhook-timestamp");

        // Validate headers
        if (!webhookId || !signature || !timestamp) {
            console.error("Missing webhook headers");
            return new NextResponse("Invalid headers", { status: 400 });
        }

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

        // 3. Store event early
        await createWebhookEvent({
            id: webhookId,
            type: event.type,
        });

        const data = event.data;

        if (!data) {
            console.error("Missing event data");
            return new NextResponse("Invalid data", { status: 400 });
        }

        console.log('data ', data);

        const eventType = event.type as string;

        switch (eventType) {
            // PAYMENT SUCCESS (primary flow)
            case "payment.succeeded": {
                const txnId = data?.metadata?.txnId;

                if (!txnId) {
                    console.error("Missing txnId");
                    break;
                }

                const totalAmount = data?.total_amount / 100

                await updatePaymentById({
                    id: txnId,
                    data: {
                        providerTxnId: data?.order_id,
                        amount: totalAmount,
                        currency: data?.currency || "USD",
                        status: "succeeded",
                    },
                });

                break;
            }

            // NEW: SUBSCRIPTION RENEWED (CRITICAL)
            case "subscription.renewed": {
                if (!isSubscriptionData(data)) {
                    console.error("Invalid subscription.renewed payload");
                    break;
                }

                const userId = data.metadata?.userId;
                const txnId = data.metadata?.txnId;

                if (!userId) {
                    console.error("Missing userId");
                    break;
                }

                // Update subscription period
                await updateSubscriptionById({
                    id: data.subscription_id,
                    data: {
                        status: "active",
                        planId: data.product_id || "default",
                        currentPeriodEnd: new Date(data.next_billing_date),
                        cancelAtPeriodEnd: data.cancel_at_next_billing_date ?? false,
                    },
                });

                // Track renewal payment
                if (txnId) {
                    const totalAmount = data?.total_amount / 100

                    await updatePaymentById({
                        id: txnId,
                        data: {
                            providerTxnId: data?.order_id,
                            amount: totalAmount,
                            currency: data?.currency || "USD",
                            status: "succeeded",
                        },
                    });
                } else {
                    // fallback (metadata missing — shouldn't happen ideally)
                    await createPayment({
                        id: data?.order_id,
                        userId,
                        amount: data?.total_amount,
                        currency: data?.currency || "USD",
                        status: "succeeded",
                    });
                }

                break;
            }


            case "subscription.active": {
                if (!isSubscriptionData(data)) {
                    console.error("Invalid subscription.active payload");
                    break;
                }

                await handleSubscriptionActive(data);
                break;
            }

            case "subscription.cancelled":
            case "subscription.expired": {
                if (!isSubscriptionData(data)) {
                    console.error("Invalid subscription cancel payload");
                    break;
                }

                await handleSubscriptionCancelled(data);
                break;
            }

            case "subscription.updated": {
                if (!isSubscriptionData(data)) {
                    console.error("Invalid subscription.updated payload");
                    break;
                }

                await handleSubscriptionUpdated(data);
                break;
            }

            // LEGACY / FALLBACK
            case "order.success": {
                if (!isOrderSuccessData(data)) {
                    console.error("Invalid order.success payload");
                    break;
                }

                const txnId = data.metadata?.txnId;

                const totalAmount = data?.total_amount / 100;

                if (txnId) {
                    await updatePaymentById({
                        id: txnId,
                        data: {
                            providerTxnId: data.order_id,
                            amount: totalAmount,
                            currency: data.currency || "USD",
                            status: "succeeded",
                        },
                    });
                }

                break;
            }

            default:
                console.log(`Unhandled event: ${eventType}`);
        }

        return new NextResponse("Webhook processed", { status: 200 });

    } catch (err) {
        console.error("Webhook error:", err);
        return new NextResponse("Webhook failed", { status: 500 });
    }
}