"use client";

import { useState } from "react";

export default function LoginBox() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGoogle() {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/auth/google");
        const data = await res.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            setError("Could not start Google login. Try again.");
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-2">

            {/* Card */}
            <div className="rounded-2xl border bg-background/60 backdrop-blur-md shadow-sm px-8 py-10 space-y-8">

                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Continue with your Google account
                    </p>
                </div>

                {/* Action */}
                <div className="space-y-4">

                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-3 
                            px-4 py-3 rounded-xl border text-sm font-medium 
                            bg-white text-black hover:bg-gray-50
                            transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Spinner /> : <GoogleIcon />}
                        Continue with Google
                    </button>

                    {error && (
                        <p className="text-sm text-destructive text-center">
                            {error}
                        </p>
                    )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                        secure login
                    </span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground leading-relaxed px-2">
                    By continuing, you agree to our{" "}
                    <a
                        href="/terms"
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        Terms
                    </a>{" "}
                    and{" "}
                    <a
                        href="/privacy"
                        className="underline underline-offset-4 hover:text-foreground"
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   ICONS                                    */
/* -------------------------------------------------------------------------- */

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

function Spinner() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}