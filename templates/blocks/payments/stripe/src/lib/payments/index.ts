import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
});

export const billing = {
    // Create checkout link
    createCheckout: async (priceId: string, email: string, userId: string, txnId: string) => {
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
            metadata: {
                userId,
                productId: priceId,
                // env: ENVIRONMENT,
                txnId: txnId,
            },
        });
        return { url: session.url!, id: session.id };
    },

    // Get simplified status
    getSubscriptionStatus: async (subscriptionId: string) => {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        return {
            status: sub.status, // active, canceled, past_due
            nextBillingDate: new Date(sub.current_period_end * 1000).toISOString(),
        };
    },

    // Cancel
    cancelSubscription: async (subscriptionId: string) => {
        return await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    },

    // Get Portal URL
    getPortalUrl: async (customerId: string) => {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        return session.url;
    }
};