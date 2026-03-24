// FILE: src/app/api/auth/complete/route.ts
// ROUTE: GET /api/auth/complete
// ROLE: checks if user is new or existing → routes accordingly
//
// Flow:
//   callback lands here with active session
//   → check if user exists in your DB
//   → existing user → /dashboard
//   → new user      → /onboarding  (or /dashboard if you don't have onboarding)
//
// TODO: replace the DB check with your actual database query
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers";

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Get the logged-in user from the session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    // Check if user exists in YOUR DB
    const existingUser = await getUser({
        field: "authId",
        value: user?.id,
    });

    // If new user → create
    if (!existingUser) {
        await createUser({
            email: user.email!,
            authId: user.id,
            name: user.user_metadata?.full_name ?? undefined,
            image: user.user_metadata?.avatar_url ?? undefined,
            lastLoginAt: new Date(),
        });

        return NextResponse.redirect(`${appUrl}/onboarding`);
    } else {
        await updateUserLogin({
            authId,
            lastLoginAt: new Date(),
        });
    }
    // Default: send everyone to dashboard
    // Replace with the DB check above once you have a users table
    return NextResponse.redirect(`${appUrl}/dashboard`);
}