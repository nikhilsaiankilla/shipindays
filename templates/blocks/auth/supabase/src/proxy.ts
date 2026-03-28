// FILE: src/middleware.ts
// ROLE: Supabase Auth middleware (edge)
//
// Runs before matched requests and handles:
// 1. Refreshing Supabase session cookies (required for SSR)
// 2. Protecting private routes (/dashboard)
// 3. Redirecting authenticated users away from auth pages

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  /**
   * Base response object.
   * Will be mutated if cookies are updated.
   */
  let res = NextResponse.next({ request: req });

  /**
   * Create Supabase client bound to the request.
   *
   * Custom cookie handlers are required so Supabase can:
   * - Read session cookies
   * - Refresh tokens
   * - Persist updated cookies in the response
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Read cookies from incoming request.
         */
        getAll() {
          return req.cookies.getAll();
        },

        /**
         * Write updated cookies back to response.
         *
         * Flow:
         * 1. Update request cookies (so current execution sees latest state)
         * 2. Recreate response object
         * 3. Attach cookies to response
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value),
          );

          res = NextResponse.next({ request: req });

          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  /**
   * IMPORTANT:
   * Always call getUser() in middleware.
   *
   * This:
   * - Validates session
   * - Refreshes expired tokens
   * - Ensures cookies stay in sync
   *
   * Skipping this leads to stale or broken sessions.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * Protect dashboard routes.
   *
   * If user is not authenticated → redirect to /login
   * Includes callbackUrl so user can be returned after login.
   */
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url);

    /**
     * Preserve original destination for post-login redirect.
     */
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  /**
   * Prevent authenticated users from accessing auth pages.
   */
  const isAuthPage =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/signup";

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  /**
   * Default: allow request to proceed with updated cookies.
   */
  return res;
}

/**
 * Middleware matcher.
 *
 * Runs on all routes except:
 * - API routes
 * - Next.js static assets
 * - Image optimization
 * - favicon
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};