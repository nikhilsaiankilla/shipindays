import Stripe from "stripe";
import { PaymentProvider } from "@shipindays/payments";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2022-11-15"
});

export class StripeProvider implements PaymentProvider {

    // Create Customer
    async createCustomer(email: string): Promise<string> {
        const customer = await stripe.customers.create({
            email,
            metadata: {
                source: "shipindays", // change this to your app name or identifier
            },
        });

        return customer.id;
    }

    // one time checkout payment 
    async createOneTimeCheckout(data: {
        customerId?: string;
        priceId: string;
        metadata?: Record<string, string>;
    }): Promise<string> {

        const session = await stripe.checkout.sessions.create({
            customer: data.customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: data.priceId,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.APP_URL}/success`,
            cancel_url: `${process.env.APP_URL}/cancel`,
            metadata: data.metadata,
        });

        return session.url!;
    }

    // subscription checkout payment
    async createSubscriptionCheckout(data: {
        customerId: string;
        priceId: string;
        metadata?: Record<string, string>;
    }): Promise<string> {

        const session = await stripe.checkout.sessions.create({
            customer: data.customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: data.priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/cancel`,
            metadata: data.metadata,
        });

        return session.url!;
    }

    // get subscription details
    async getSubscriptions(customerId: string) {
        const subs = await stripe.subscriptions.list({
            customer: customerId,
            status: "all",
            expand: ["data.default_payment_method"],
        });

        return subs.data;
    }

    // update subscription downgrade or upgrade
    async updateSubscription(data: {
        subscriptionId: string;
        newPriceId: string;
    }) {

        const subscription = await stripe.subscriptions.retrieve(
            data.subscriptionId
        );

        const itemId = subscription?.items?.data[0]?.id;

        return stripe.subscriptions.update(data.subscriptionId, {
            items: [
                {
                    id: itemId,
                    price: data.newPriceId,
                },
            ],
            proration_behavior: "create_prorations",
        });
    }

    // cancel subscription
    async cancelSubscription(subscriptionId: string): Promise<void> {
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });
    }

    // immediate cancel
    async cancelImmediately(subscriptionId: string): Promise<void> {
        await stripe.subscriptions.cancel(subscriptionId);
    }

    // resume subscription 
    async resumeSubscription(subscriptionId: string) {
        return stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: false,
        });
    }

    // webhook handler to verify events
    async handleWebhook(payload: Buffer, signature: string): Promise<void> {

        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        switch (event.type) {

            case "checkout.session.completed":
                const checkout = event.data.object as Stripe.Checkout.Session;
                console.log("Checkout completed", checkout);
                break;

            case "invoice.payment_succeeded":
                const invoice = event.data.object as Stripe.Invoice;
                console.log("Subscription payment succeeded", invoice);
                break;

            case "invoice.payment_failed":
                const failedInvoice = event.data.object as Stripe.Invoice;
                console.log("Payment failed", failedInvoice);
                break;

            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                const sub = event.data.object as Stripe.Subscription;
                console.log("Subscription updated", sub);
                break;

            default:
                console.log(`Unhandled event ${event.type}`);
        }
    }
}