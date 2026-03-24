import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16", // Use the latest stable version
    typescript: true,
});

export async function createCheckoutSession({
    customerId,
    priceId,
    mode = "subscription", // "subscription" or "payment" (one-time)
    successUrl,
    cancelUrl,
}: {
    customerId?: string;
    priceId: string;
    mode?: "subscription" | "payment";
    successUrl: string;
    cancelUrl: string;
}) {
    return await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: mode === "subscription" ? {
            metadata: { /* add user info here */ },
        } : undefined,
    });
}