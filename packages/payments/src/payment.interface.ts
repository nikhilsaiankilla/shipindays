export interface PaymentProvider {

    // Customer
    createCustomer(email: string): Promise<string>

    // Checkout
    createOneTimeCheckout(data: {
        customerId?: string
        priceId: string
        metadata?: Record<string, string>
    }): Promise<string>

    createSubscriptionCheckout(data: {
        customerId: string
        priceId: string
        metadata?: Record<string, string>
    }): Promise<string>

    // Subscription
    getSubscriptions(customerId: string): Promise<any>

    updateSubscription(data: {
        subscriptionId: string
        newPriceId: string
    }): Promise<any>

    cancelSubscription(subscriptionId: string): Promise<void>

    cancelImmediately(subscriptionId: string): Promise<void>

    resumeSubscription(subscriptionId: string): Promise<any>

    // Webhook
    handleWebhook(payload: Buffer, signature: string): Promise<void>
}