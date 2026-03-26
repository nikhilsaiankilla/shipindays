"use client";

import Link from "next/link";

/**
 * Doodle Aesthetic Version
 * - Hand-drawn feel with playful rotation
 * - Marker-style highlights on hover
 * - Asymmetric "sticker" background
 */
export default function PoweredByShipindays() {
    return (
        <Link
            href="https://shipindays.nikhilsai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-8 group flex items-center gap-2 transition-all duration-300"
        >
            {/* The "Hand-Drawn" Badge Container */}
            <div className="relative px-3 py-1.5 bg-white border-2 border-black rounded-[15px_5px_20px_8px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[5px_5px_0px_0px_#FFA500] transition-all">

                <div className="flex items-center gap-2">
                    {/* Tiny Doodle Star instead of a status dot */}
                    <span className="text-orange-500 text-sm animate-pulse">★</span>

                    <div className="flex items-baseline gap-1.5 font-bold text-[11px] uppercase tracking-wider text-black">
                        <span className="opacity-60">Built with</span>
                        <span className="relative inline-block">
                            Shipindays
                            {/* Marker scribble underline that appears on hover */}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full rounded-full" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Optional: Small "handwritten" arrow pointing to the badge */}
            <span className="hidden md:block absolute -left-12 bottom-2 text-xl text-zinc-400 rotate-12 pointer-events-none font-serif">
                ⤴
            </span>
        </Link>
    );
}