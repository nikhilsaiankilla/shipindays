import { PaymentService } from "@shipindays/payments";
import { NextResponse } from "next/server";

export async function POST() {
    try {

        const email = "test@example.com"; // replace with auth user email

        if (!process.env.STRIPE_PRICE_ID) {
            throw new Error("STRIPE_PRICE_ID missing");
        }

        // In production you should fetch this from DB
        const customerId = await PaymentService.createCustomer(email);

        const checkoutUrl = await PaymentService.createSubscriptionCheckout({
            customerId,
            priceId: process.env.STRIPE_PRICE_ID
        });

        return NextResponse.json({
            success: true,
            checkoutUrl
        });

    } catch (error) {

        console.error("Checkout error:", error);

        return NextResponse.json(
            { success: false, message: "Checkout failed" },
            { status: 500 }
        );
    }
}