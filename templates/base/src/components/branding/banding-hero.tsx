"use client";

import Image from "next/image";
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
        // Using a "Paper" texture background color
        <main className="fixed inset-0 bg-[#FDFCF0] text-[#1A1A1A] flex flex-col items-center justify-center p-6 font-mono">

            <div className="w-full max-w-xl space-y-12 relative">

                {/* Header Section */}
                <section className="space-y-6">
                    <div className="flex gap-2 items-center">
                        <Image
                            src={'/shipindays.png'}
                            alt="shipindays logo"
                            width={120}
                            height={120}
                            className="relative z-10 p-2"
                        />
                        <div className="text-center sm:text-left">
                            <h1 className="text-6xl font-black tracking-tight drop-shadow-[4px_4px_0px_#FFA500] uppercase">
                                Shipindays
                            </h1>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        <p className="text-2xl font-bold italic leading-tight">
                            "Ship faster. No noise. <span className="underline decoration-blue-500 decoration-4 underline-offset-4">Just the code.</span>"
                        </p>
                        <p className="text-zinc-600 text-lg">
                            Join <span className="bg-orange-200 px-1 font-bold">{stars.toLocaleString()}+</span> builders using the kernel.
                        </p>
                    </div>
                </section>

                {/* Action Section */}
                <section className="space-y-8 flex flex-col items-start">
                    <a
                        href="https://github.com/nikhilsaiankilla/shipindays"
                        target="_blank"
                        className="relative inline-block px-10 py-4 font-bold text-xl group"
                    >
                        {/* Custom Hand-Drawn Button Shape */}
                        <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0 rounded-xl"></span>
                        <span className="absolute inset-0 w-full h-full bg-white border-2 border-black rounded-xl group-hover:bg-orange-400 transition-colors"></span>
                        <span className="relative text-black group-hover:text-white flex items-center gap-2">
                            ★ Star on GitHub
                        </span>
                    </a>

                    <p className="text-zinc-500 font-bold transform">
                        Open Source // MIT License
                    </p>
                </section>

                {/* Footer Navigation */}
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