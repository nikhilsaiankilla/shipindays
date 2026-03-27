import { NextResponse } from "next/server";
import { validateEvent } from "@polar-sh/sdk/webhooks";

import {
  getUser,
  upsertSubscription,
  updateSubscriptionById,
  expireSubscription,
  createPayment,
  createWebhookEvent,
  hasWebhookEvent,
  updatePaymentById,
} from "@/src/db/db-helpers";

// HANDLERS

// SUBSCRIPTION CREATED / ACTIVE
async function handleSubscriptionActive(data: any) {
  const subscriptionId = data.id;
  const productId = data.productId;
  const userId = data.metadata?.userId;

  if (!subscriptionId || !userId) {
    console.error("Missing subscriptionId or userId");
    return;
  }

  const user = await getUser({ field: "id", value: userId });
  if (!user) return;

  if (!data.currentPeriodEnd) {
    console.error("Missing currentPeriodEnd — skipping");
    return;
  }

  await upsertSubscription({
    id: subscriptionId,
    userId: user.id,
    planId: productId,
    status: data.status || "active",
    currentPeriodEnd: new Date(data.currentPeriodEnd),
    cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
  });
}

// SUBSCRIPTION UPDATED / RENEWED
async function handleSubscriptionUpdated(data: any) {
  const subscriptionId = data.id;

  if (!subscriptionId) return;

  await updateSubscriptionById({
    id: subscriptionId,
    data: {
      planId: data.productId,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd)
        : undefined,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
    },
  });
}

// SUBSCRIPTION ENDED
async function handleSubscriptionCancelled(data: any) {
  const subscriptionId = data.id;
  if (!subscriptionId) return;

  await expireSubscription(subscriptionId);
}

// PAYMENT SUCCESS
async function handleOrderCreated(data: any) {
  const orderId = data.id;
  const amount = data.amount / 100;
  const currency = data.currency?.toUpperCase() || "USD";
  const userId = data.metadata?.userId;
  const txnId = data.metadata?.txnId;

  if (!orderId || !userId) return;

  const paymentId = txnId || orderId;

  await createPayment({
    id: paymentId,
    userId,
    amount,
    currency,
    status: "success",
  });
}

// PAYMENT REFUND
async function handleOrderRefunded(data: any) {
  const orderId = data.id;
  const txnId = data.metadata?.txnId;

  const paymentId = txnId || orderId;

  await updatePaymentById({
    id: paymentId,
    data: {
      status: "refunded",
    },
  });
}

// CHECKOUT FLOW (processing → success)
async function handleCheckoutUpdated(data: any) {
  const txnId = data.metadata?.txnId;
  if (!txnId) return;

  if (data.status === "completed") {
    await updatePaymentById({
      id: txnId,
      data: {
        status: "succeeded",
        providerTxnId: data.id,
      },
    });
  }
}

// MAIN ROUTE
export async function POST(req: Request) {
  try {
    // ⚠️ MUST BE RAW BODY
    const rawBody = await req.json();

    const signature = req.headers.get("polar-webhook-signature");

    if (!signature) {
      return new NextResponse("Missing signature", { status: 401 });
    }

    // 1. VERIFY
    let event: any;
    try {
        event = validateEvent(
            rawBody.body,
            rawBody.headers,
            process.env?.POLAR_PAYMENTS_WEBHOOK_KEY ?? '',
          )
    } catch (err) {
      console.error("Verification failed:", err);
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const webhookId = event.id;

    if (!webhookId) {
      return new NextResponse("Missing event id", { status: 400 });
    }

    // 2. IDEMPOTENCY
    const alreadyProcessed = await hasWebhookEvent(webhookId);
    if (alreadyProcessed) {
      return new NextResponse("Already processed", { status: 200 });
    }

    // 3. STORE EVENT
    await createWebhookEvent({
      id: webhookId,
      type: event.type,
    });

    const data = event.data;
    const eventType = event.type;

    if (!data) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // 4. ROUTING
    switch (eventType) {
      // PAYMENT FLOW
      case "checkout.updated":
        await handleCheckoutUpdated(data);
        break;

      case "order.created":
        await handleOrderCreated(data);
        break;

      case "order.refunded":
        await handleOrderRefunded(data);
        break;

      // SUBSCRIPTION FLOW
      case "subscription.created":
      case "subscription.active":
        await handleSubscriptionActive(data);
        break;

      case "subscription.updated":
        await handleSubscriptionUpdated(data);
        break;

      case "subscription.canceled":
      case "subscription.ended":
        await handleSubscriptionCancelled(data);
        break;

      default:
        console.log(`Unhandled Polar event: ${eventType}`);
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new NextResponse("Webhook failed", { status: 500 });
  }
}