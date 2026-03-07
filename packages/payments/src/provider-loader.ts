import { StripeProvider } from "@shipindays/stripe";
import { LemonSqueezyProvider } from "@shipindays/lemon-squeezy";

export function loadPaymentProvider() {

    const provider = process.env.PAYMENT_PROVIDER;

    switch (provider) {

        case "stripe":
            return new StripeProvider();

        case "lemon-squeezy":
            return new LemonSqueezyProvider();

        default:
            throw new Error("Unsupported payment provider");

    }

}