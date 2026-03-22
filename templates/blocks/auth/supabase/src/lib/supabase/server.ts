// FILE: src/lib/supabase/server.ts
// ROUTE: not a route — imported by server components and API routes ONLY
// ROLE: creates a Supabase client that reads session cookies server-side
//
// Use this in:
//   - Server components (app/dashboard/page.tsx)
//   - API routes (app/api/*)
//   - middleware.ts
//
// NEVER use this in "use client" components — use client.ts instead.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — safe to ignore
            // middleware handles cookie refresh instead
          }
        },
      },
    },
  );
}
