"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginBox() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGoogle() {
        setLoading(true);
        setError(null);

        try {
            // This triggers the Google OAuth flow and redirects automatically
            await signIn("google", { callbackUrl: "/api/auth/complete" });
        } catch (err) {
            setError("Could not start Google login. Try again.");
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md px-4 mx-auto font-sans">
            <div className="rounded-[15px_40px_12px_35px] border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] px-8 py-12 space-y-10 relative">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                        Welcome <span className="text-orange-500">Back</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Authentication_Required // v1.0.4
                    </p>
                </div>

                {/* Google Button: Sticker Style */}
                <div className="space-y-6">
                    <button
                        onClick={handleGoogle}
                        disabled={loading}
                        className="group w-full flex items-center justify-center gap-3 
                            px-4 py-6 rounded-xl border-2 border-black text-sm font-black uppercase tracking-widest
                            bg-white text-black shadow-[4px_4px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1
                            transition-all disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : <GoogleIcon />}
                        Continue with Google
                    </button>

                    <p className="text-center text-[10px] font-black text-zinc-300 uppercase italic">
                        Secure SSL Encryption Enabled
                    </p>
                </div>

                {/* Error Sticker */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-500 p-2 rotate-1 text-center">
                        <p className="text-[10px] font-black text-red-600 uppercase">
                            {error}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center space-y-4 pt-4">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                        By continuing, you agree to our{" "}
                        <a href="/terms" className="text-black underline decoration-orange-500/40 hover:decoration-orange-500">Terms</a>
                        {" "}&{" "}
                        <a href="/privacy" className="text-black underline decoration-blue-500/40 hover:decoration-blue-500">Privacy</a>
                    </p>
                </footer>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

function Spinner() {
    return (
        <svg
            className="w-5 h-5 animate-spin text-black"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}