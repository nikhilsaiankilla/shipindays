// FILE: src/app/api/auth/callback/route.ts
// ROUTE: GET /api/auth/callback
// ROLE: exchanges OAuth code for session — Google and magic link both land here
//
// Flow:
//   Google  → Google redirects here with ?code=xxx
//   Magic   → Supabase redirects here with ?code=xxx
//   Both    → exchange code for session → redirect to /api/auth/complete
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/auth/server";

export async function GET(req: NextRequest) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

    if (!code) {
        // No code — something went wrong, send back to login
        return NextResponse.redirect(`${appUrl}/login?error=no_code`);
    }

    const supabase = await getSupabaseServerClient();

    // Exchange the code for a session — sets the session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("OAuth callback error:", error.message);
        return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
    }

    // Session is set — go to complete route to check new vs existing user
    return NextResponse.redirect(`${appUrl}/api/auth/complete`);
}