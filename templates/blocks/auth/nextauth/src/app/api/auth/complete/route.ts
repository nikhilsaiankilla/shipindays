// FILE: src/app/api/auth/complete/route.ts
// ROUTE: GET /api/auth/complete
// ROLE: checks if user is new or existing → routes accordingly
//
// NextAuth calls this after successful OAuth or magic link login
// as the callbackUrl.
//
// Flow:
//   Google/Magic link success → NextAuth → redirects here
//   → read session
//   → check DB for existing user
//   → existing → /dashboard
//   → new      → /onboarding
//
// TODO: replace the DB check with your actual database query
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers";

export async function GET() {
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    const session = await auth();

    if (!session?.user) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    const user = session.user;

    // Decide your authId source (IMPORTANT)
    // NextAuth doesn't always include id by default
    const authId =
        // @ts-ignore (depends on your NextAuth config)
        user.id || user.email;

    if (!authId || !user.email) {
        return NextResponse.redirect(`${appUrl}/login?error=invalid_user`);
    }

    // Check if user exists
    const existingUser = await getUser({
        field: "email",
        value: user?.email,
    });

    // Create user if not exists
    if (!existingUser) {
        await createUser({
            email: user.email,
            authId,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            lastLoginAt: new Date(),
        });

        return NextResponse.redirect(`${appUrl}/onboarding`);
    }else{
        await updateUserLogin({ authId, lastLoginAt: new Date() });
    }

    return NextResponse.redirect(`${appUrl}/dashboard`);
}