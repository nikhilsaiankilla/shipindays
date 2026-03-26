import { DodoPayments } from "dodopayments";

const ENVIRONMENT = process.env.DODO_ENV === "live" ? "live" : "test";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
    environment: ENVIRONMENT === "live" ? "live_mode" : "test_mode",
});

export const billing = {
    // Create checkout link
    createCheckout: async (productId: string, email: string, userId: string, txnId: string) => {
        // const checkout = await dodo.checkoutSessions.create({
        //     product_id: priceId,
        //     customer: { email },
        //     billing_address: { country: "US" },
        //     return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        // });
        const checkout = await dodo.checkoutSessions.create({
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                }
            ],
            customer: {
                email: email,
            },
            metadata: {
                userId,
                productId: productId,
                env: ENVIRONMENT,
                txnId: txnId,
            },
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home`,
        })
        return checkout;
    },

    // Get simplified status
    getSubscriptionStatus: async (subscriptionId: string) => {
        const sub = await dodo.subscriptions.retrieve(subscriptionId);
        return {
            status: sub.status, // active, cancelled, past_due
            nextBillingDate: sub.next_billing_date,
        };
    },

    // Cancel
    cancelSubscription: async (subscriptionId: string) => {
        return await await dodo.subscriptions.update(subscriptionId, {
            cancel_at_next_billing_date: true
        });
    },

    // Get Portal URL
    getPortalUrl: async (customerId: string) => {
        const customer = await dodo.customers.retrieve(customerId);
        return customer;
    }
};