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
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers";
import { requireUser } from "@/src/lib/auth";
// import { sendWelcomeEmail} from '@/src/lib/email' 

export async function GET() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Get the logged-in user from the session
    const user = await requireUser();

    if (!user || !user?.email) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    const authId = user.id;

    // Check if user exists in YOUR DB
    const existingUser = await getUser({
        field: "email",
        value: user?.email,
    });

    // If new user → create
    if (!existingUser) {
        await createUser({
            email: user?.email!,
            authId: user?.id,
            name: user?.name ?? undefined,
            image: user?.image ?? undefined,
            lastLoginAt: new Date(),
        });

        // uncomment this if you want to send welcome email 
        // try {
        // await sendWelcomeEmail(user?.email, user?.name)
        // } catch (error) {
        // do nothing 
        // }
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