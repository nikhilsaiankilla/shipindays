"use client";

// FILE: src/app/(marketing)/page.tsx
// ROUTE: /
// ROLE: homepage — shown after user scaffolds their project
//       simple ask: star the repo + support the project
// ─────────────────────────────────────────────────────────────────────────────

import PoweredByShipindays from "./powered-by-shipindays";

async function getStarCount(): Promise<number> {
    try {
        const res = await fetch(
            "https://api.github.com/repos/nikhilsaiankilla/shipindays",
            {
                next: { revalidate: 60 },
                headers: { Accept: "application/vnd.github+json" },
            }
        );
        const data = await res.json();
        return data.stargazers_count ?? 0;
    } catch {
        return 0;
    }
}

export default async function HomePage() {
    const stars = await getStarCount();

    return (
        <main className="h-full w-full overflow-hidden flex flex-col items-center
                     justify-center bg-[#0a0a0a] text-white font-mono px-6">

            <div className="flex flex-col items-center text-center gap-6 max-w-sm">

                {/* Logo */}
                <span className="text-2xl font-bold tracking-tight">⚡ Shipindays</span>

                {/* Ask */}
                <p className="text-white/40 text-sm leading-relaxed">
                    This project is free and open source.
                    <br />
                    If it saved you time, a ⭐ goes a long way.
                </p>

                {/* Star button */}
                <a
                    href="https://github.com/nikhilsaiankilla/shipindays"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-6 py-3 rounded-lg
                     bg-white text-black text-sm font-semibold
                     hover:bg-white/90 transition-colors"
                >
                    <GitHubIcon />
                    Star on GitHub
                    {stars > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-black/10 text-xs font-mono">
                            {stars}
                        </span>
                    )}
                </a>

                {/* Support */}
                <div className="flex items-center gap-4 text-xs text-white/30">
                    <a
                        href="https://buymeacoffee.com/nikhilsaiankilla"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/60 transition-colors"
                    >
                        Buy me a coffee
                    </a>
                    <span>·</span>
                    <a
                        href="https://x.com/itzznikhilsai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white/60 transition-colors underline underline-offset-4"
                    >
                        Follow on X
                    </a>
                </div>
            </div>
        </main>
    );
}

function GitHubIcon() {
    return (
        <svg className="w-4 h-4 shrink-0 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}