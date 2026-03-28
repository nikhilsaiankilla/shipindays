function requireEnv(value: string | undefined, name: string) {
    if (!value) {
        throw new Error(`Missing env: ${name}`);
    }
    return value;
}

export const PRICING_PLANS = [
    {
        id: "starter",
        name: "Starter",
        price: "$0",
        description: "For trying things out",
        productId: requireEnv(
            process.env.NEXT_PUBLIC_POLAR_PRICE_ID_STARTER,
            "NEXT_PUBLIC_POLAR_PRICE_ID_STARTER"
        ),
        features: ["Basic features", "Community support"],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$9/mo",
        description: "For serious builders",
        productId: requireEnv(
            process.env.NEXT_PUBLIC_POLAR_PRICE_ID_PRO,
            "NEXT_PUBLIC_POLAR_PRICE_ID_PRO"
        ),
        features: ["Everything in Starter", "Priority support", "Advanced features"],
    },
];