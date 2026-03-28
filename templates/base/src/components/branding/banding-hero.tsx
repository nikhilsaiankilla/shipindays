"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function BrandingHero() {
    /**
     * Stores GitHub star count for the repo.
     * Defaults to 0 until fetched from the GitHub API.
     */
    const [stars, setStars] = useState<number>(0);

    /**
     * Fetch repository metadata once on mount.
     * Extracts stargazer count and updates UI.
     * Falls back to 0 if the request fails.
     */
    useEffect(() => {
        fetch("https://api.github.com/repos/nikhilsaiankilla/shipindays")
            .then((res) => res.json())
            .then((data) => setStars(data.stargazers_count || 0))
            .catch(() => setStars(0));
    }, []);

    return (
        // Fullscreen hero layout with paper-like background styling
        <main className="fixed inset-0 bg-[#FDFCF0] text-[#1A1A1A] flex flex-col items-center justify-center p-6 font-mono">

            <div className="w-full max-w-xl space-y-12 relative">

                {/* Branding header: logo + product name */}
                <section className="space-y-6">
                    <div className="flex gap-2 items-center">
                        <Image
                            src={'/shipindays.png'}
                            alt="shipindays logo"
                            width={120}
                            height={120}
                            className="relative z-10 p-2"
                        />

                        {/* Product title with stylized shadow */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-6xl font-black tracking-tight drop-shadow-[4px_4px_0px_#FFA500] uppercase">
                                Shipindays
                            </h1>
                        </div>
                    </div>

                    {/* Tagline + social proof (GitHub stars) */}
                    <div className="space-y-3 pt-4">
                        <p className="text-2xl font-bold italic leading-tight">
                            "Ship faster. No noise. <span className="underline decoration-blue-500 decoration-4 underline-offset-4">Just the code.</span>"
                        </p>

                        {/* Dynamically shows GitHub star count */}
                        <p className="text-zinc-600 text-lg">
                            Join <span className="bg-orange-200 px-1 font-bold">{stars.toLocaleString()}+</span> builders using the kernel.
                        </p>
                    </div>
                </section>

                {/* Primary action section */}
                <section className="space-y-8 flex flex-col items-start">
                    <div className="flex items-center gap-2 flex-wrap">

                        {/* External link to GitHub repo */}
                        <Link
                            href="https://github.com/nikhilsaiankilla/shipindays"
                            target="_blank"
                            className="relative inline-block px-10 py-4 font-bold text-xl group"
                        >
                            {/* Layered spans create "hand-drawn" offset button effect */}
                            <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0 rounded-xl"></span>
                            <span className="absolute inset-0 w-full h-full bg-white border-2 border-black rounded-xl group-hover:bg-orange-400 transition-colors"></span>

                            {/* Foreground content */}
                            <span className="relative text-black group-hover:text-white flex items-center gap-2">
                                ★ Star on GitHub
                            </span>
                        </Link>

                        {/* Internal navigation to test authentication flow */}
                        <Link
                            href="/login"
                            className="relative inline-block px-10 py-4 font-bold text-xl group"
                        >
                            {/* Same layered button style reused */}
                            <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0 rounded-xl"></span>
                            <span className="absolute inset-0 w-full h-full bg-white border-2 border-black rounded-xl group-hover:bg-orange-400 transition-colors"></span>

                            <span className="relative text-black group-hover:text-white flex items-center gap-2">
                                verify login flow
                            </span>
                        </Link>
                    </div>

                    {/* Open source badge */}
                    <p className="text-zinc-500 font-bold transform">
                        Open Source // MIT License
                    </p>
                </section>

                {/* Footer navigation links */}
                <footer className="flex flex-wrap gap-x-8 gap-y-4 pt-10 border-t-2 border-dashed border-zinc-300">
                    <FooterLink href="https://shipindays.nikhilsai.in/docs">Docs</FooterLink>
                    <FooterLink href="https://github.com/nikhilsaiankilla/shipindays">Code</FooterLink>
                    <FooterLink href="https://x.com/itzznikhilsai">Twitter</FooterLink>
                    <FooterLink href="https://buymeacoffee.com/nikhilsaiankilla">☕ Coffee</FooterLink>
                </footer>
            </div>
        </main>
    );
}

/**
 * Reusable footer link component.
 * Opens links in a new tab and applies hover styling.
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            className="text-lg font-bold border-b-2 border-transparent hover:border-black transition-all hover:bg-yellow-200 px-1"
        >
            {children}
        </a>
    );
}