"use server"

// FILE: src/lib/auth/index.ts
// ROUTE: not a route — imported everywhere auth is needed
// ROLE: Supabase Auth implementation of the auth contract
//
// INJECTED BY CLI when user picks "Supabase Auth"
// Overwrites base placeholder at src/lib/auth/index.ts
//
// Exports the 3 contract functions every auth block must have:
//   getCurrentUser() — returns user or null
//   requireUser()    — returns user or redirects to /login
//   signOut()        — signs out and redirects to /
// ─────────────────────────────────────────────────────────────────────────────

import { getSupabaseServerClient } from "@/src/lib/auth/server";
import { redirect } from "next/navigation";

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Returns the currently logged-in user, or null if not logged in.
//
// Use this when you want to show different UI for logged-in vs logged-out:
//   const user = await getCurrentUser();
//   if (user) { show dashboard link } else { show login link }
export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── requireUser ─────────────────────────────────────────────────────────────
// Returns the logged-in user OR redirects to /login if not authenticated.
//
// Use this on any protected page:
//   const user = await requireUser(); // if not logged in, redirects automatically
//   // user is guaranteed here — safe to use
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// ─── signOut ──────────────────────────────────────────────────────────────────
// Signs the user out and redirects to /.
// Called from /api/auth/logout route.
export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
