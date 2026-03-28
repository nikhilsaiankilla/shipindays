// FILE: src/app/api/auth/complete/route.ts
// ROUTE: GET /api/auth/complete
// ROLE: Post-auth handler for Supabase sessions
//
// FLOW:
// 1. User completes OAuth / magic link
// 2. Supabase sets session cookie
// 3. Request lands here with active session
// 4. Sync user with your database
// 5. Redirect based on new/existing user
//
// TEMPLATE NOTE:
// This is the bridge between Supabase Auth → your app's user system.

import { NextResponse } from "next/server";
import { requireUser } from "@/src/lib/auth";
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers";
// import { sendWelcomeEmail } from '@/src/lib/email'

export async function GET() {
    /**
     * Base app URL for redirects.
     * Falls back to localhost in development.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    /**
     * Get authenticated user from Supabase session.
     * requireUser() ensures a valid session or redirects upstream.
     */
    const user = await requireUser();

    /**
     * Ensure required fields exist.
     * Email is used here as the lookup key.
     */
    if (!user || !user?.email) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    /**
     * Supabase user ID (UUID).
     * This is the primary identifier from the auth provider.
     */
    const authId = user.id;

    /**
     * Check if user exists in your database.
     *
     * Current strategy:
     * - Lookup by email
     *
     * TEMPLATE NOTE:
     * You can switch to authId-based lookup for better reliability.
     */
    const existingUser = await getUser({
        field: "email",
        value: user.email,
    });

    /**
     * NEW USER FLOW
     * Create a user record in your database.
     */
    if (!existingUser) {
        await createUser({
            email: user.email,
            authId: user.id,

            /**
             * Supabase stores provider data inside `user_metadata`.
             *
             * Common fields (Google example):
             * - full_name
             * - avatar_url
             *
             * TEMPLATE NOTE:
             * These fields depend on the provider and can vary.
             * Always handle them defensively.
             */
            name: user?.user_metadata?.full_name ?? undefined,
            image: user?.user_metadata?.avatar_url ?? undefined,

            lastLoginAt: new Date(),

            /**
             * TEMPLATE NOTE: EXTEND YOUR USER MODEL HERE
             *
             * This is where you attach app-specific fields.
             *
             * Examples:
             * - role: "user" | "admin"
             * - plan: "free" | "pro"
             * - onboardingCompleted: false
             * - teamId / organizationId
             * - preferences (theme, notifications)
             *
             * Example:
             * role: "user",
             * plan: "free",
             * onboardingCompleted: false,
             */
        });

        /**
         * Optional: send welcome email after signup.
         * Failures are ignored to avoid blocking login flow.
         */
        // try {
        //     await sendWelcomeEmail(user.email, user.user_metadata?.full_name)
        // } catch (error) {
        //     // Non-critical
        // }

        /**
         * Redirect new users to onboarding flow.
         * If no onboarding exists, redirect to /dashboard instead.
         */
        return NextResponse.redirect(`${appUrl}/onboarding`);
    } else {
        /**
         * EXISTING USER FLOW
         *
         * Update login metadata for analytics or tracking.
         *
         * TEMPLATE NOTE:
         * You can also:
         * - Sync updated name/image from provider
         * - Track login count or activity
         */
        await updateUserLogin({
            authId,
            lastLoginAt: new Date(),
        });
    }

    /**
     * Default redirect for authenticated users.
     */
    return NextResponse.redirect(`${appUrl}/dashboard`);
}