// FILE: src/app/api/auth/magic/route.ts
// ROUTE: POST /api/auth/magic
// ROLE: Sends magic link email via Supabase
//
// FLOW:
// 1. Client submits email
// 2. Supabase sends magic link to that email
// 3. User clicks link → redirected to /api/auth/callback
// 4. Session is created → user continues login flow
//
// TEMPLATE NOTE:
// This enables passwordless authentication (no OAuth provider required).

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/src/lib/auth/server";

export async function POST(req: NextRequest) {
    /**
     * Extract email from request body.
     */
    const { email } = await req.json();

    /**
     * Validate input.
     */
    if (!email) {
        return NextResponse.json(
            { error: "Email is required." },
            { status: 400 }
        );
    }

    /**
     * Initialize Supabase server client.
     */
    const supabase = await getSupabaseServerClient();

    /**
     * Base app URL for redirect after user clicks magic link.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    /**
     * Trigger magic link email.
     *
     * Supabase handles:
     * - Generating secure token
     * - Sending email
     * - Validating link on click
     */
    const { error } = await supabase.auth.signInWithOtp({
        email,

        options: {
            /**
             * Where the user is redirected after clicking the email link.
             * Must match your Supabase auth settings.
             */
            emailRedirectTo: `${appUrl}/api/auth/callback`,

            /**
             * Automatically creates a new user if email does not exist.
             *
             * TEMPLATE NOTE:
             * - true  → seamless signup + login
             * - false → only allow existing users (no auto-registration)
             */
            shouldCreateUser: true,
        },
    });

    /**
     * Handle failure (invalid email, rate limit, etc.)
     */
    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }

    /**
     * Success response.
     * Client should show "Check your email" message.
     */
    return NextResponse.json({ success: true });
}