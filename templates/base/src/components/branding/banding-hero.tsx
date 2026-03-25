"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function BrandingHero() {
    const [stars, setStars] = useState<number>(0);

    useEffect(() => {
        fetch("https://api.github.com/repos/nikhilsaiankilla/shipindays")
            .then((res) => res.json())
            .then((data) => setStars(data.stargazers_count || 0))
            .catch(() => setStars(0));
    }, []);

    return (
        <main className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            <div className="w-full max-w-xl space-y-24">

                {/* Header Section */}
                <section className="space-y-6">
                    <Link
                        href={'https://shipindays.nikhilsai.in'}
                        target="_blank"
                        className="text-5xl font-semibold tracking-tight">
                        Shipindays
                    </Link>
                    <div className="space-y-1 mt-5">
                        <p className="text-zinc-400 text-lg">Ship faster. No noise. Just the code.</p>
                        <p className="text-zinc-500 text-sm">Join {stars.toLocaleString()}+ developers building with the kernel.</p>
                    </div>
                </section>

                {/* Action Section */}
                <section className="space-y-8">
                    <div className="relative group">
                        <a
                            href="https://github.com/nikhilsaiankilla/shipindays"
                            target="_blank"
                            className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            Star on GitHub
                        </a>
                    </div>
                    <p className="text-zinc-600 text-xs mt-4 uppercase tracking-widest">Open Source // MIT License</p>
                </section>

                {/* Footer Navigation */}
                <footer className="flex gap-8 pt-4">
                    <FooterLink href="https://shipindays.nikhilsai.in/docs">Documentation</FooterLink>
                    <FooterLink href="https://github.com/nikhilsaiankilla/shipindays">Github</FooterLink>
                    <FooterLink href="https://x.com/itzznikhilsai">Twitter</FooterLink>
                    <FooterLink href="https://buymeacoffee.com/nikhilsaiankilla">Coffee</FooterLink>
                </footer>
            </div>
        </main>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            className="text-sm text-zinc-500 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
            {children}
        </a>
    );
}