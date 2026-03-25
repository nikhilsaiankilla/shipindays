"use client";

// FILE: src/app/(auth)/login/page.tsx
// ROUTE: /login
// ROLE: login page — Google OAuth + Magic Link only
//
// Flow:
//   Google  → clicks button → /api/auth/google   → Google OAuth → /api/auth/callback → /api/auth/complete → /dashboard or /onboarding
//   Magic   → enters email  → /api/auth/magic     → email sent  → user clicks link   → /api/auth/callback → /api/auth/complete → /dashboard or /onboarding
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

export default function LoginBox() {
    const [email, setEmail] = useState("");
    const [magicSent, setMagicSent] = useState(false);
    const [loading, setLoading] = useState<"google" | "magic" | null>(null);
    const [error, setError] = useState<string | null>(null);

    // ── Google OAuth ────────────────────────────────────────────────────────────
    async function handleGoogle() {
        setLoading("google");
        setError(null);

        const res = await fetch("/api/auth/google");
        const data = await res.json();

        if (data.url) {
            window.location.href = data.url; // redirect to Google
        } else {
            setError("Could not start Google login. Try again.");
            setLoading(null);
        }
    }

    // ── Magic Link ──────────────────────────────────────────────────────────────
    async function handleMagicLink(e: React.FormEvent) {
        e.preventDefault();
        if (!email) return;
        setLoading("magic");
        setError(null);

        const res = await fetch("/api/auth/magic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            setMagicSent(true);
        } else {
            setError(data.error ?? "Could not send magic link. Try again.");
        }
        setLoading(null);
    }

    // ── Magic link sent state ───────────────────────────────────────────────────
    if (magicSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <div className="text-4xl">📬</div>
                    <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We sent a magic link to{" "}
                        <span className="font-medium text-foreground">{email}</span>.
                        <br />
                        Click the link in the email to sign in.
                    </p>
                    <button
                        onClick={() => { setMagicSent(false); setEmail(""); }}
                        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                        Use a different email
                    </button>
                </div>
            </div>
        );
    }

    // ── Main login UI ───────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in or create an account to continue
                    </p>
                </div>

                <div className="space-y-4">

                    {/* Google Button */}
                    <button
                        onClick={handleGoogle}
                        disabled={loading !== null}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3
                       border rounded-lg text-sm font-medium bg-background
                       hover:bg-muted transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed"
                    >
                        {loading === "google" ? (
                            <Spinner />
                        ) : (
                            <GoogleIcon />
                        )}
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-background px-3 text-muted-foreground">
                                or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Magic Link Form */}
                    <form onSubmit={handleMagicLink} className="space-y-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 border rounded-lg text-sm bg-background
                         placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-ring
                         disabled:opacity-50"
                            disabled={loading !== null}
                        />
                        <button
                            type="submit"
                            disabled={loading !== null || !email}
                            className="w-full py-3 bg-foreground text-background rounded-lg
                         text-sm font-medium hover:bg-foreground/90
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors flex items-center justify-center gap-2"
                        >
                            {loading === "magic" ? <Spinner light /> : null}
                            Send magic link
                        </button>
                    </form>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}

                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-muted-foreground leading-relaxed">
                    By continuing you agree to our{" "}
                    <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                        Terms
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                        Privacy Policy
                    </a>
                    .
                </p>

            </div>
        </div>
    );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function GoogleIcon() {
    return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

function Spinner({ light = false }: { light?: boolean }) {
    return (
        <svg
            className={`w-4 h-4 animate-spin ${light ? "text-background" : "text-foreground"}`}
            fill="none" viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}