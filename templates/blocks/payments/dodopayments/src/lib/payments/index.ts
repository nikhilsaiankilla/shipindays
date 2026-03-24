import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
});

export const billing = {
    // Create checkout link
    createCheckout: async (priceId: string, email: string) => {
        const checkout = await dodo.checkouts.create({
            product_id: priceId,
            customer: { email },
            billing_address: { country: "US" },
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        return { url: checkout.url, id: checkout.checkout_id };
    },

    // Get simplified status
    getSubscriptionStatus: async (subscriptionId: string) => {
        const sub = await dodo.subscriptions.get(subscriptionId);
        return {
            status: sub.status, // active, cancelled, past_due
            nextBillingDate: sub.next_billing_date,
        };
    },

    // Cancel
    cancelSubscription: async (subscriptionId: string) => {
        return await dodo.subscriptions.cancel(subscriptionId);
    },

    // Get Portal URL
    getPortalUrl: async (customerId: string) => {
        const customer = await dodo.customers.get(customerId);
        return customer.portal_url;
    }
};