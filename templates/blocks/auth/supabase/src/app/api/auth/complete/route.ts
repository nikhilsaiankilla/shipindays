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
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createSupabaseServerClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Get the logged-in user from the session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    // ── TODO: Check if user exists in your database ───────────────────────────
    // Replace this with your actual DB query.
    //
    // Example with Drizzle + Supabase Postgres:
    //   import { db } from "@/lib/db";
    //   import { users } from "@/lib/db/schema";
    //   import { eq } from "drizzle-orm";
    //
    //   const [existingUser] = await db
    //     .select()
    //     .from(users)
    //     .where(eq(users.id, user.id));
    //
    //   if (!existingUser) {
    //     // New user — save to DB first
    //     await db.insert(users).values({
    //       id:        user.id,
    //       email:     user.email!,
    //       name:      user.user_metadata?.full_name ?? null,
    //       avatarUrl: user.user_metadata?.avatar_url ?? null,
    //     });
    //     return NextResponse.redirect(`${appUrl}/onboarding`);
    //   }
    //
    //   return NextResponse.redirect(`${appUrl}/dashboard`);
    // ─────────────────────────────────────────────────────────────────────────

    // Default: send everyone to dashboard
    // Replace with the DB check above once you have a users table
    return NextResponse.redirect(`${appUrl}/dashboard`);
}