// FILE: src/middleware.ts
// ROUTE: runs on every request before page renders
// ROLE: Supabase Auth middleware
//
// INJECTED BY CLI when user picks "Supabase Auth"
// Overwrites base placeholder at src/middleware.ts
//
// Does two things:
//   1. Refreshes the Supabase session cookie on every request (required by Supabase SSR)
//   2. Redirects unauthenticated users away from /dashboard to /login
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Create Supabase client that can refresh session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
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

  // IMPORTANT: always call getUser() in middleware
  // This refreshes the session and keeps cookies up to date
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard and all nested routes
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");
  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /login and /signup
  const isAuthPage =
    req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup";
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
