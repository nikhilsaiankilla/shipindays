// FILE: src/app/api/auth/[...nextauth]/route.ts
// ROUTE: /api/auth/* (GET + POST)
// ROLE: NextAuth v5 handler — REQUIRED for Google OAuth to work
//
// Google redirects back to /api/auth/callback/google after login.
// This catch-all route handles that redirect and all other NextAuth endpoints:
//
//   GET  /api/auth/session              ← reads current session
//   GET  /api/auth/csrf                 ← CSRF token
//   GET  /api/auth/providers            ← lists configured providers
//   GET  /api/auth/signin/google        ← starts Google OAuth
//   GET  /api/auth/callback/google      ← Google redirects back here ← CRITICAL
//   POST /api/auth/signout              ← signs out
//
// Without this file Google OAuth CANNOT complete — the callback has nowhere to land.
// ─────────────────────────────────────────────────────────────────────────────

import { handlers } from "@/src/lib/auth";

export const { GET, POST } = handlers;