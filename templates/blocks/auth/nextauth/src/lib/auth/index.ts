"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./options";

/**
 * Returns the currently authenticated user or null.
 *
 * Safe to use in optional auth contexts (e.g. navbar, public pages).
 * Does NOT throw or redirect on failure.
 */
export async function getCurrentUser() {
    try {
        /**
         * Fetch session from NextAuth using server-side context.
         * Includes user data if authenticated.
         */
        const session = await getServerSession(authOptions);

        /**
         * Return user object or null if not logged in.
         */
        return session?.user ?? null;
    } catch (error) {
        /**
         * Fail-safe: never break rendering due to auth issues.
         */
        return null;
    }
}

/**
 * Ensures a user is authenticated.
 *
 * - If user exists → returns user
 * - If not → redirects to /login (server-side)
 *
 * Used in protected server components and routes.
 */
export async function requireUser() {
    const user = await getCurrentUser();

    /**
     * Redirect unauthenticated users before rendering continues.
     */
    if (!user) redirect("/login");

    return user;
}

/**
 * Server-side sign out helper.
 *
 * Redirects to NextAuth's built-in signout route,
 * which clears session cookies and optionally redirects.
 *
 * TEMPLATE NOTE:
 * - callbackUrl controls where user lands after logout
 * - default here redirects to homepage (/)
 */
export async function signOut() {
    redirect("/api/auth/signout?callbackUrl=/");
}