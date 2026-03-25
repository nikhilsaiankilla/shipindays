// src/config/pricing.ts

export const PRICING_PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        description: "For trying things out",
        productId: process?.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
        features: ["Basic features", "Community support"],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$9/mo",
        description: "For serious builders",
        productId: process?.env?.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
        features: ["Everything in Starter", "Priority support", "Advanced features"],
    },
];