// FILE: src/app/api/auth/logout/route.ts
// ROUTE: POST /api/auth/logout
// ROLE: signs the user out — called by LogoutButton component
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { nextAuthSignOut } from "@/src/lib/auth";

export async function POST() {
  await nextAuthSignOut({ redirect: false });
  return NextResponse.json({ success: true });
}
