// FILE: src/app/api/billing/checkout/route.ts
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    // Polar handles environment via the token, but you can force sandbox for dev
    // server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

export const billing = {
    // Create checkout link
    createCheckout: async (productId: string, email: string, userId: string, txnId: string) => {
        const checkout = await polar.checkouts.create({
            // Polar expects an array of Product IDs
            products: [productId], 
            customerEmail: email,
            // metadata is top-level in the checkout object
            metadata: {
                userId,
                productId: productId,
                txnId: txnId,
            },
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_id={CHECKOUT_ID}`,
        });
        
        // Polar returns the full checkout object; the URL is in checkout.url
        return checkout;
    },

    // Get simplified status
    getSubscriptionStatus: async (subscriptionId: string) => {
        const sub = await polar.subscriptions.get({
            id: subscriptionId,
        });
        return {
            status: sub.status, // 'active', 'canceled', 'incomplete', etc.
            nextBillingDate: sub.currentPeriodEnd,
        };
    },

    // Cancel
    cancelSubscription: async (subscriptionId: string) => {
        return await polar.subscriptions.update({
            id: subscriptionId,
            subscriptionUpdate: {
                cancelAtPeriodEnd: true
            }
        });
    },

    // Get Portal URL
    getPortalUrl: async (customerId: string) => {
        // Polar uses Customer Sessions to grant access to the managed portal
        const session = await polar.customerSessions.create({
            customerId: customerId,
        });
        return session;
    }
};