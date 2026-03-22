// FILE: src/app/api/auth/[...nextauth]/route.ts
// ROUTE: /api/auth/* (GET + POST)
// ROLE: NextAuth v5 route handler
//
// INJECTED BY CLI — ONLY the nextauth block has this file.
// Supabase block does NOT have this file — it never gets created for Supabase users.
//
// Handles all NextAuth endpoints automatically:
//   GET  /api/auth/session       ← reads current session
//   GET  /api/auth/csrf          ← CSRF token
//   GET  /api/auth/providers     ← lists configured providers
//   POST /api/auth/signin        ← sign in
//   POST /api/auth/signout       ← sign out
//   GET  /api/auth/callback/:p   ← OAuth redirect lands here
// ─────────────────────────────────────────────────────────────────────────────

import { handlers } from "@/src/lib/auth";

export const { GET, POST } = handlers;
