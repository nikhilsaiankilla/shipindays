// FILE: src/app/api/auth/magic/route.ts
// ROUTE: POST /api/auth/magic
// ROLE: sends magic link email via Supabase
//
// Flow: login form submits email → Supabase sends magic link → user clicks → /api/auth/callback
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST(req: NextRequest) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${appUrl}/api/auth/callback`,
            shouldCreateUser: true, // creates account if doesn't exist
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}