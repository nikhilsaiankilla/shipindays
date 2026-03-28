// FILE: src/lib/supabase/client.ts
// ROLE: Browser-side Supabase client (singleton)
//
// This client is used ONLY in client components ("use client").
//
// Typical use cases:
// - Triggering OAuth flows
// - Sending magic link requests
// - Client-side Supabase queries (optional)
//
// DO NOT use this in:
// - Server components
// - API routes
// - Middleware
//
// For server-side usage, use the server client instead (e.g. "@/src/lib/auth/server").

import { createBrowserClient } from "@supabase/ssr";

/**
 * Singleton instance of the Supabase browser client.
 *
 * Ensures:
 * - Only one client instance exists across the app
 * - Prevents multiple GoTrue client warnings in development
 * - Avoids duplicate auth listeners and inconsistent session state
 */
let client: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  /**
   * Reuse existing client if already initialized.
   */
  if (client) return client;

  /**
   * Create a new Supabase browser client.
   *
   * Uses public environment variables exposed to the client:
   * - NEXT_PUBLIC_SUPABASE_URL
   * - NEXT_PUBLIC_SUPABASE_ANON_KEY
   *
   * TEMPLATE NOTE:
   * These must be defined in your environment (.env.local).
   */
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}