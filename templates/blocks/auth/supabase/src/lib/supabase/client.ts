"use client";

// FILE: src/lib/supabase/client.ts
// ROUTE: not a route — imported by "use client" components ONLY
// ROLE: creates a browser-side Supabase singleton
//
// Use this in:
//   - Client components (anything with "use client" at the top)
//   - Login/signup forms
//   - OAuth buttons
//
// NEVER use this in server components or API routes — use server.ts instead.
// ─────────────────────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr";

// Singleton — reuses the same instance across the app
// Prevents multiple GoTrue clients warning in dev
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (client) return client;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return client;
}
