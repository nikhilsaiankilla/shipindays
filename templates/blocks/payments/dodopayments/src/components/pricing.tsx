// src/components/pricing.tsx

"use client";

import { useState } from "react";
import { PRICING_PLANS } from "@/src/config/pricing";

export default function PricingSection() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleCheckout = async (planId: string) => {
        try {
            setLoadingPlan(planId);

            const res = await fetch(`/api/billing/checkout?plan=${planId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed");
            }

            // redirect to Dodo checkout
            window.location.href = data.url;
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center mb-10">
                Pricing
            </h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {PRICING_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className="border rounded-2xl p-6 shadow-sm flex flex-col"
                    >
                        <h3 className="text-xl font-semibold">{plan.name}</h3>
                        <p className="text-2xl font-bold mt-2">{plan.price}</p>
                        <p className="text-gray-500 mt-2">{plan.description}</p>

                        <ul className="mt-4 space-y-2 text-sm">
                            {plan.features.map((f, i) => (
                                <li key={i}>✔ {f}</li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handleCheckout(plan.id)}
                            disabled={loadingPlan === plan.id}
                            className="mt-6 bg-black text-white py-2 rounded-lg disabled:opacity-50"
                        >
                            {loadingPlan === plan.id ? "Redirecting..." : "Get Started"}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}