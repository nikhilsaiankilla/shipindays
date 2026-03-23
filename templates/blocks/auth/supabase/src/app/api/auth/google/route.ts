// FILE: src/app/api/auth/google/route.ts
// ROUTE: GET /api/auth/google
// ROLE: starts Google OAuth flow — returns the Google redirect URL
//
// Flow: login page calls this → gets URL → redirects user to Google
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${appUrl}/api/auth/callback`,
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error || !data.url) {
        return NextResponse.json({ error: error?.message ?? "OAuth failed" }, { status: 500 });
    }

    return NextResponse.json({ url: data.url });
}