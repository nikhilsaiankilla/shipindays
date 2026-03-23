// FILE: src/middleware.ts
// ROUTE: runs on every request before page renders
// ROLE: NextAuth v5 middleware
//
// INJECTED BY CLI when user picks "NextAuth v5"
// Overwrites base placeholder at src/middleware.ts
//
// Does two things:
//   1. Reads the NextAuth JWT on every request
//   2. Redirects unauthenticated users away from /dashboard to /login
//   3. Redirects logged-in users away from /login and /signup to /dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@/src/lib/auth";
import { NextResponse } from "next/server";

export default proxy((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  // Protect /dashboard and all nested routes
  const isProtected = pathname.startsWith("/dashboard");
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from /login and /signup
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
