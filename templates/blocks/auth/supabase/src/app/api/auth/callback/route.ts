// FILE: src/app/api/auth/callback/route.ts
// ROUTE: GET /api/auth/callback
// ROLE: Handles OAuth + magic link callback for Supabase
//
// FLOW:
// 1. User authenticates via provider (Google / magic link)
// 2. Provider redirects here with ?code=xxx
// 3. Exchange code → Supabase session (sets cookies)
// 4. Redirect to /api/auth/complete for DB sync + routing
//
// TEMPLATE NOTE:
// This route is required for Supabase auth to finalize login.

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/auth/server";

export async function GET(req: NextRequest) {
    /**
     * Extract query params and origin from request URL.
     */
    const { searchParams, origin } = new URL(req.url);

    /**
     * OAuth / magic link code returned by provider.
     * Required to exchange for a session.
     */
    const code = searchParams.get("code");

    /**
     * Base app URL for redirects.
     * Falls back to request origin in development.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

    /**
     * If no code is present, something failed in the auth flow.
     * Redirect back to login with error flag.
     */
    if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=no_code`);
    }

    /**
     * Create Supabase server client.
     * Must include cookies to properly persist session.
     */
    const supabase = await getSupabaseServerClient();

    /**
     * Exchange OAuth/magic link code for a session.
     *
     * This:
     * - Validates the code
     * - Sets session cookies (access + refresh tokens)
     * - Logs the user in server-side
     */
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    /**
     * Handle exchange failure (invalid/expired code, etc.)
     */
    if (error) {
        console.error("OAuth callback error:", error.message);
        return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
    }

    /**
     * Session is now established.
     * Redirect to completion route to:
     * - Sync user with database
     * - Handle onboarding / routing logic
     */
    return NextResponse.redirect(`${appUrl}/api/auth/complete`);
}