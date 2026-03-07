import { loadPaymentProvider } from "./provider-loader";

const provider = loadPaymentProvider();

export const PaymentService = {

    createCustomer(email: string) {
        return provider.createCustomer(email);
    },

    createOneTimeCheckout(data: {
        customerId?: string
        priceId: string
        metadata?: Record<string, string>
    }) {
        return provider.createOneTimeCheckout(data);
    },

    createSubscriptionCheckout(data: {
        customerId: string
        priceId: string
        metadata?: Record<string, string>
    }) {
        return provider.createSubscriptionCheckout(data);
    },

    getSubscriptions(customerId: string) {
        return provider.getSubscriptions(customerId);
    },

    updateSubscription(data: {
        subscriptionId: string
        newPriceId: string
    }) {
        return provider.updateSubscription(data);
    },

    cancelSubscription(subscriptionId: string) {
        return provider.cancelSubscription(subscriptionId);
    },

    cancelImmediately(subscriptionId: string) {
        return provider.cancelImmediately(subscriptionId);
    },

    resumeSubscription(subscriptionId: string) {
        return provider.resumeSubscription(subscriptionId);
    },

    handleWebhook(payload: Buffer, signature: string) {
        return provider.handleWebhook(payload, signature);
    }
};