"use client";

import { useState } from "react";
import { PRICING_PLANS } from "@/src/config/pricing";
import { useRouter } from "next/navigation";
import { Check, Zap, Rocket, Loader2 } from "lucide-react";

export default function PricingSection() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const router = useRouter();

    const handleCheckout = async (productId: string) => {
        if (!productId) {
            alert("Pricing is not configured properly");
            return;
        }

        try {
            setLoadingPlan(productId);
            const res = await fetch(`/api/billing/checkout?productId=${productId}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed");
            if (!data?.url) throw new Error("checkout url is missing!!");

            router.push(data?.url);
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <section className="py-24 px-6 min-h-screen bg-[#FDFCF0]" id="pricing">
            <div className="max-w-5xl mx-auto">
                {/* Header: Sticker Style */}
                <div className="text-center mb-16">
                    <div className="inline-block bg-white border-2 border-black px-3 py-1 mb-4 rotate-[-1deg] shadow-[3px_3px_0px_#000]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Billing_Protocol // Tier_Select</p>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase italic leading-none">
                        Pick your <span className="text-orange-500">Power</span>.
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {PRICING_PLANS.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white border-4 border-black p-8 md:p-10 flex flex-col transition-all hover:-translate-y-1 shadow-[8px_8px_0px_#000] 
                                ${index === 1 ? 'rounded-[20px_60px_20px_50px] shadow-[#FFA500]' : 'rounded-[40px_15px_35px_10px]'}`}
                        >
                            {/* Most Popular Tag for the 2nd Plan */}
                            {index === 1 && (
                                <div className="absolute -top-4 -right-4 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rotate-12 border-2 border-white shadow-[3px_3px_0px_#FFA500]">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    {index === 0 ? <Zap size={20} className="text-zinc-700" /> : <Rocket size={20} className="text-orange-500" />}
                                    <h3 className="text-2xl font-black text-black uppercase italic tracking-tighter">{plan.name}</h3>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-black tracking-tighter">{plan.price}</span>
                                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">/ Lifetime</span>
                                </div>
                                <p className="text-zinc-500 font-bold italic mt-4 text-sm leading-tight">
                                    "{plan.description}"
                                </p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-3 group">
                                        <div className="mt-1 bg-orange-100 rounded-full p-0.5 border border-black/5">
                                            <Check size={12} className="text-orange-600 stroke-[4px]" />
                                        </div>
                                        <span className="text-sm font-bold italic text-zinc-700 leading-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCheckout(plan?.productId)}
                                disabled={loadingPlan === plan.productId}
                                className="relative w-full group"
                            >
                                <span className="absolute inset-0 w-full h-full bg-black rounded-xl translate-x-1.5 translate-y-1.5 transition-all group-active:translate-x-0 group-active:translate-y-0" />
                                <span className={`relative flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-black font-black uppercase tracking-widest text-sm transition-colors
                                    ${loadingPlan === plan.productId ? 'bg-zinc-100 text-zinc-400' : 'bg-white text-black group-hover:bg-orange-500 group-hover:text-white'}`}>
                                    {loadingPlan === plan.productId ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Initializing...
                                        </>
                                    ) : (
                                        "Ignite Engine →"
                                    )}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Secure Payment Footer */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-30 grayscale contrast-125">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">SECURE_VIA_STRIPE</span>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">DODO_PAYMENTS_READY</span>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">SSL_ENCRYPTED</span>
                </div>
            </div>
        </section>
    );
}