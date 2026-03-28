// FILE: src/middleware.ts
// ROLE: NextAuth-based route protection + redirect control
//
// This middleware runs before matched requests and handles:
// - Blocking unauthenticated access to protected routes (/dashboard)
// - Redirecting authenticated users away from auth pages (/login, /signup)
//
// Uses `withAuth` to integrate NextAuth session/token handling.

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  /**
   * Middleware handler executed AFTER `authorized` returns true.
   * Used for custom redirect logic (not primary auth enforcement).
   */
  function proxy(req) {
    const token = req.nextauth.token;

    /**
     * Route classification
     */
    const isAuthPage =
      req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/signup";

    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

    /**
     * Redirect authenticated users away from auth pages.
     * Prevents logged-in users from accessing /login or /signup again.
     */
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    /**
     * Protected routes (/dashboard):
     * - If no token → handled by `authorized` callback + NextAuth config
     * - If token exists → request proceeds normally
     */
    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Controls whether the request is allowed to proceed to the handler.
       *
       * IMPORTANT:
       * - Returning false triggers NextAuth's built-in redirect (usually to /login)
       * - Returning true allows request to reach the middleware function above
       */
      authorized: ({ token, req }) => {
        const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

        /**
         * Require authentication for dashboard routes.
         * All other routes remain public.
         */
        if (isDashboard) return !!token;

        return true;
      },
    },
  }
);

/**
 * Middleware matcher configuration.
 *
 * Runs on all routes EXCEPT:
 * - /api (backend routes)
 * - /_next/static (static assets)
 * - /_next/image (image optimization)
 * - /favicon.ico
 *
 * TEMPLATE NOTE:
 * Narrow this matcher (e.g. "/dashboard/:path*") if you want
 * to reduce unnecessary middleware execution for public pages.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};