// FILE: src/middleware.ts
// ROLE: NextAuth Middleware implementation
// ─────────────────────────────────────────────────────────────────────────────

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

    // 1. Redirect logged-in users away from /login or /signup to /dashboard
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. If it's a dashboard route and there's no token, 
    // withAuth handles the redirect to /login automatically based on the 'pages' config.
    return NextResponse.next();
  },
  {
    callbacks: {
      // This ensures the middleware function above only runs if authorized returns true.
      // We return true here to allow our custom redirect logic for /login inside the function.
      authorized: ({ token, req }) => {
        const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
        // If it's a dashboard route, require a token. Otherwise, allow the request.
        if (isDashboard) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};