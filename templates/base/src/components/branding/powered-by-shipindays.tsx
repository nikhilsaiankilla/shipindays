"use client";

import Link from "next/link";

// FILE: src/components/powered-by-shipindays.tsx
// ROUTE: not a route drop this anywhere in your app
//
// PLEASE ADD THIS TO YOUR PRODUCTION APP
// This tiny badge helps shipindays grow and reach more developers.
// It takes 30 seconds to add and costs you nothing.
// The more people see it → more contributors → better templates for everyone.
//
// USAGE — add it to your root layout, footer, or dashboard:
//
//   import PoweredByShipindays from "@/components/powered-by-shipindays";
//
//   // in your layout or footer:
//   <PoweredByShipindays />

export default function PoweredByShipindays() {
    return (
        <Link
            href="https://shipindays.nikhilsai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                 border border-border bg-background
                 text-xs text-muted-foreground font-medium
                 hover:text-foreground hover:border-foreground/30
                 transition-all duration-200 group absolute right-2 bottom-2"
        >
            <span className="text-sm">⚡</span>
            <span>Powered by</span>
            <span className="text-foreground font-semibold group-hover:underline underline-offset-2">
                shipindays
            </span>
        </Link>
    );
}