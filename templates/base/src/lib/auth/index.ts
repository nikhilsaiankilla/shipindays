// FILE: src/lib/auth/index.ts
// ROLE: Central auth contract used across the app.
//
// This file acts as an abstraction layer over the actual auth provider
// (e.g. Supabase, NextAuth). It gets replaced at setup time.
//
// IMPORTANT:
// The rest of the app MUST import from "@/src/lib/auth" only.
// Never import directly from provider SDKs in UI or pages.
// This keeps the auth system swappable without breaking the app.

/**
 * Returns the currently authenticated user or null.
 *
 * This should be a safe, non-throwing call used in optional auth contexts
 * (e.g. navbar, conditional UI rendering).
 */
export async function getCurrentUser() {
    throw new Error("Auth provider not configured.");
}

/**
 * Ensures a user is authenticated.
 *
 * If a valid session exists → returns the user.
 * If not → performs a server-side redirect to /login.
 *
 * This is used in protected server components and routes.
 */
export async function requireUser() {
    throw new Error("Auth provider not configured.");
}

/**
 * Signs out the current user.
 *
 * Should:
 * 1. Invalidate the session (cookies / tokens)
 * 2. Optionally trigger a redirect (usually to "/")
 *
 * Typically called from client components (e.g. logout button).
 */
export async function signOut() {
    throw new Error("Auth provider not configured.");
}