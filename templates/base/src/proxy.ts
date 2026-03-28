// FILE: src/middleware.ts
// ROLE: Global request middleware.
//
// Runs before every matched request and can:
// - Redirect users (auth protection)
// - Modify headers/cookies
// - Block or allow access
//
// TEMPLATE NOTE:
// This is a placeholder. It gets replaced when an auth provider
// (e.g. Supabase / NextAuth) is installed.
//
// If you are not using auth middleware, this file can remain as-is.

import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware entry point.
 *
 * Currently acts as a no-op (passes all requests through).
 * Replace this logic when implementing auth or route protection.
 */
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

/**
 * Controls which routes this middleware runs on.
 *
 * Excludes:
 * - API routes
 * - Next.js internals (_next)
 * - static assets (images, favicon)
 *
 * TEMPLATE NOTE:
 * Modify this matcher if you want middleware to run only on specific routes
 * (e.g. "/dashboard/:path*").
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};