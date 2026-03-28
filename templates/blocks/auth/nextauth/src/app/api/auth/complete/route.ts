// FILE: src/app/api/auth/complete/route.ts
// ROUTE: GET /api/auth/complete
// ROLE: Post-auth handler that syncs auth user → app database
//
// FLOW:
// 1. User completes OAuth/login
// 2. Redirect lands here with active session
// 3. Check if user exists in your DB
// 4. If new → create user + optional onboarding
// 5. If existing → update last login
// 6. Redirect accordingly
//
// TEMPLATE NOTE:
// This is where you map your auth provider user → your internal user model.
// Extend this logic to store additional fields (see below).

import { NextResponse } from "next/server";
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers";
import { requireUser } from "@/src/lib/auth";
// import { sendWelcomeEmail } from '@/src/lib/email'

export async function GET() {
    /**
     * Base app URL used for redirects.
     * Falls back to localhost in development.
     *
     * TEMPLATE NOTE:
     * Set NEXT_PUBLIC_APP_URL in your environment variables for production.
     */
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    /**
     * Get authenticated user from session.
     * requireUser() guarantees a valid session or redirects upstream.
     */
    const user = await requireUser();

    /**
     * Safety check: ensure we have a valid email.
     * Email is used as the primary lookup key in this example.
     *
     * TEMPLATE NOTE:
     * If your auth provider does not guarantee email,
     * switch to using a stable provider ID instead.
     */
    if (!user || !user?.email) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    const authId = user.id;

    /**
     * Check if user exists in YOUR database.
     *
     * Current strategy:
     * - Lookup by email (simple, works for most OAuth flows)
     *
     * TEMPLATE NOTE:
     * You may want to:
     * - Use authId (provider ID) instead of email
     * - Support multiple providers per user
     */
    const existingUser = await getUser({
        field: "email",
        value: user.email,
    });

    /**
     * NEW USER FLOW
     * Create a new user record in your database.
     */
    if (!existingUser) {
        await createUser({
            email: user.email,
            authId: user.id,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            lastLoginAt: new Date(),

            /**
             * TEMPLATE NOTE: EXTENDING USER MODEL
             *
             * This is where you should store additional fields
             * depending on your product requirements.
             *
             * Common examples:
             * - username (custom handle)
             * - role (admin, user, etc.)
             * - plan (free, pro, enterprise)
             * - onboardingCompleted (boolean)
             * - company / teamId (for SaaS apps)
             * - timezone / locale
             * - preferences (theme, notifications, etc.)
             *
             * Example:
             * role: "user",
             * plan: "free",
             * onboardingCompleted: false,
             */
        });

        /**
         * Optional: send welcome email after signup.
         * Failures are intentionally ignored to avoid blocking login flow.
         */
        // try {
        //     await sendWelcomeEmail(user.email, user.name)
        // } catch (error) {
        //     // Non-critical: do not block user flow
        // }

        /**
         * Redirect new users to onboarding flow.
         *
         * TEMPLATE NOTE:
         * If you don't have onboarding, redirect directly to /dashboard.
         */
        return NextResponse.redirect(`${appUrl}/onboarding`);
    } else {
        /**
         * EXISTING USER FLOW
         * Update last login timestamp for analytics / tracking.
         *
         * TEMPLATE NOTE:
         * You can also:
         * - Sync updated profile data (name, image)
         * - Track login count
         * - Update last active IP/device
         */
        await updateUserLogin({
            authId,
            lastLoginAt: new Date(),
        });
    }

    /**
     * Default redirect after successful login.
     */
    return NextResponse.redirect(`${appUrl}/dashboard`);
}