// FILE: src/app/api/auth/google/route.ts
// ROUTE: GET /api/auth/google
// ROLE: Initiates Google OAuth flow via Supabase
//
// FLOW:
// 1. Client calls this endpoint
// 2. Supabase generates Google OAuth URL
// 3. URL is returned to client
// 4. Client redirects user → Google login
//
// TEMPLATE NOTE:
// This pattern allows you to keep OAuth logic on the server
// while triggering it from the client.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/auth/server";

export async function GET() {
    /**
     * Create Supabase server client.
     * Handles auth requests and session configuration.
     */
    const supabase = await getSupabaseServerClient();

    /**
     * Base app URL for redirect after OAuth completes.
     * Falls back to localhost in development.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    /**
     * Generate Google OAuth URL via Supabase.
     *
     * This does NOT log the user in yet.
     * It only returns a URL to redirect the user to Google.
     */
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
            /**
             * Where Google should redirect after authentication.
             * This must match your Supabase + Google console config.
             */
            redirectTo: `${appUrl}/api/auth/callback`,

            /**
             * Additional OAuth parameters.
             *
             * access_type: "offline"
             * → Requests refresh token (needed for long-lived access)
             *
             * prompt: "consent"
             * → Forces Google to show consent screen every time
             */
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    /**
     * Handle failure to generate OAuth URL.
     */
    if (error || !data.url) {
        return NextResponse.json(
            { error: error?.message ?? "OAuth failed" },
            { status: 500 }
        );
    }

    /**
     * Return the OAuth URL to the client.
     * Client is responsible for redirecting the user.
     */
    return NextResponse.json({ url: data.url });
}