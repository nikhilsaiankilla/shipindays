// FILE: src/middleware.ts
// ROUTE: runs on every request before page renders
// ROLE: placeholder — REPLACED by chosen auth block
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};