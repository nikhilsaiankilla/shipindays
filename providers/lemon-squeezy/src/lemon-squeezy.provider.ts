import { PaymentProvider } from "@shipindays/payments";

const API = "https://api.lemonsqueezy.com/v1";

export class LemonSqueezyProvider implements PaymentProvider {

    private headers = {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        "Authorization": `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`
    };

    // LemonSqueezy doesn't require explicit customer creation
    async createCustomer(email: string): Promise<string> {
        return email;
    }

    // ONE TIME CHECKOUT
    async createOneTimeCheckout(data: {
        customerId?: string;
        priceId: string;
        metadata?: Record<string, string>;
    }): Promise<string> {

        const res = await fetch(`${API}/checkouts`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                data: {
                    type: "checkouts",
                    attributes: {
                        checkout_data: {
                            email: data.customerId,
                            custom: data.metadata
                        }
                    },
                    relationships: {
                        variant: {
                            data: {
                                type: "variants",
                                id: data.priceId
                            }
                        }
                    }
                }
            })
        });

        const json = await res.json();

        return json.data.attributes.url;
    }

    // SUBSCRIPTION CHECKOUT
    async createSubscriptionCheckout(data: {
        customerId: string;
        priceId: string;
        metadata?: Record<string, string>;
    }): Promise<string> {

        const res = await fetch(`${API}/checkouts`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({
                data: {
                    type: "checkouts",
                    attributes: {
                        checkout_data: {
                            email: data.customerId,
                            custom: data.metadata
                        }
                    },
                    relationships: {
                        variant: {
                            data: {
                                type: "variants",
                                id: data.priceId
                            }
                        }
                    }
                }
            })
        });

        const json = await res.json();

        return json.data.attributes.url;
    }

    // LIST SUBSCRIPTIONS
    async getSubscriptions(customerId: string) {

        const res = await fetch(
            `${API}/subscriptions?filter[email]=${customerId}`,
            { headers: this.headers }
        );

        const json = await res.json();

        return json.data;
    }

    // UPDATE SUBSCRIPTION (variant switch)
    async updateSubscription(data: {
        subscriptionId: string;
        newPriceId: string;
    }) {

        const res = await fetch(
            `${API}/subscriptions/${data.subscriptionId}`,
            {
                method: "PATCH",
                headers: this.headers,
                body: JSON.stringify({
                    data: {
                        type: "subscriptions",
                        id: data.subscriptionId,
                        attributes: {
                            variant_id: data.newPriceId
                        }
                    }
                })
            }
        );

        return res.json();
    }

    // CANCEL SUBSCRIPTION (end of billing cycle)
    async cancelSubscription(subscriptionId: string): Promise<void> {

        await fetch(`${API}/subscriptions/${subscriptionId}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify({
                data: {
                    type: "subscriptions",
                    id: subscriptionId,
                    attributes: {
                        cancelled: true
                    }
                }
            })
        });
    }

    // IMMEDIATE CANCEL
    async cancelImmediately(subscriptionId: string): Promise<void> {

        await fetch(`${API}/subscriptions/${subscriptionId}`, {
            method: "DELETE",
            headers: this.headers
        });
    }

    // RESUME SUBSCRIPTION
    async resumeSubscription(subscriptionId: string) {

        const res = await fetch(
            `${API}/subscriptions/${subscriptionId}`,
            {
                method: "PATCH",
                headers: this.headers,
                body: JSON.stringify({
                    data: {
                        type: "subscriptions",
                        id: subscriptionId,
                        attributes: {
                            cancelled: false
                        }
                    }
                })
            }
        );

        return res.json();
    }

    // WEBHOOK HANDLER
    async handleWebhook(payload: Buffer, signature: string): Promise<void> {

        // LemonSqueezy sends HMAC SHA256 signature
        const crypto = await import("crypto");

        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

        const hmac = crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");

        if (hmac !== signature) {
            throw new Error("Invalid webhook signature");
        }

        const event = JSON.parse(payload.toString());

        switch (event.meta.event_name) {

            case "subscription_created":
                console.log("Subscription created", event.data);
                break;

            case "subscription_updated":
                console.log("Subscription updated", event.data);
                break;

            case "subscription_cancelled":
                console.log("Subscription cancelled", event.data);
                break;

            case "order_created":
                console.log("Order created", event.data);
                break;

            default:
                console.log("Unhandled event", event.meta.event_name);
        }
    }
}