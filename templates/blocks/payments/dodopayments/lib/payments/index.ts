import { DodoPayments } from "dodopayments";

const dodo = new DodoPayments({
    apiKey: process.env.DODO_PAYMENTS_API_KEY,
});

export async function createCheckout(priceId: string, customerEmail: string) {
    return await dodo.checkouts.create({
        product_id: priceId,
        customer: { email: customerEmail },
        billing_address: { country: "US" }, // Or handle dynamically
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
}