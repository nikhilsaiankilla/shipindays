"use client";

import Link from "next/link";

/**
 * Updated for the "Tealsub" Minimalist Aesthetic
 * - Zero borders
 * - Monospace font for technical feel
 * - Emerald dot status indicator
 */
export default function PoweredByShipindays() {
    return (
        <Link
            href="https://shipindays.nikhilsai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-8 flex items-center gap-2.5 opacity-40 hover:opacity-100 transition-all duration-300 group"
        >
            {/* The Status Dot */}
            <div className="relative flex h-1.5 w-1.5">
                <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20 group-hover:animate-ping" />
                <div className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </div>

            <div className="flex items-baseline gap-1 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className="text-zinc-500">Powered by</span>
                <span className="text-zinc-200 font-bold group-hover:text-white transition-colors">
                    Shipindays
                </span>
            </div>
        </Link>
    );
}