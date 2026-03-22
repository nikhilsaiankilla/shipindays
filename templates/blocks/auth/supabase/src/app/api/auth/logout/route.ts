// FILE: src/app/api/auth/logout/route.ts
// ROUTE: POST /api/auth/logout
// ROLE: signs the user out — called by LogoutButton component
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
