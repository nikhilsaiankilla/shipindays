import { stripe } from "@/src/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        // 1. One-time payment or Subscription started
        // 2. Update your DB (e.g., set user.isSubscribed = true)
        console.log("Payment successful for:", session.customer_details.email);
    }

    if (event.type === "customer.subscription.deleted") {
        // Handle cancellation
        // Update DB: user.isSubscribed = false
    }

    return new NextResponse(null, { status: 200 });
}