// FILE: src/lib/supabase/server.ts
// ROLE: Server-side Supabase client using request cookies
//
// Use ONLY in:
// - Server components (app/*)
// - API routes (app/api/*)
// - Middleware
//
// DO NOT use in client components ("use client").
//
// This client:
// - Reads session cookies from the request
// - Writes updated cookies (refresh tokens, etc.)
// - Keeps server-side auth state in sync

import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Abstract cookie store interface.
 *
 * Normalizes Next.js cookie API to what Supabase expects.
 */
type CookieStore = {
  getAll(): Array<{ name: string; value: string }>;
  set(
    name: string,
    value: string,
    options: {
      path?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      maxAge?: number;
      expires?: Date;
    }
  ): void;
};

/**
 * Normalizes sameSite values to valid cookie options.
 *
 * Supabase may return:
 * - boolean (true/false)
 * - string ("lax" | "strict" | "none")
 *
 * This ensures compatibility with Next.js cookie API.
 */
function normalizeSameSite(
  sameSite: boolean | "lax" | "strict" | "none" | undefined
): "lax" | "strict" | "none" | undefined {
  if (sameSite === true) return "lax";
  if (sameSite === false) return undefined;
  return sameSite;
}

/**
 * Creates a Supabase server client using a custom cookie store.
 *
 * Handles:
 * - Reading cookies from incoming request
 * - Writing updated cookies (e.g. refreshed session)
 */
export function createSupabaseAuthServer(cookieStore: CookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /**
         * Read all cookies from request.
         */
        getAll() {
          return cookieStore.getAll();
        },

        /**
         * Write cookies back to response.
         *
         * Ensures:
         * - sameSite is normalized
         * - path is always set (required for proper cookie behavior)
         */
        setAll(cookies: Array<{ name: string; value: string; options: any }>) {
          cookies.forEach(({ name, value, options }: { name: string; value: string; options: any }) => {
            cookieStore.set(name, value, {
              ...options,
              sameSite: normalizeSameSite(options.sameSite),
              path: "/",
            });
          });
        },
      },
    }
  );
}

/**
 * Convenience helper for Next.js App Router.
 *
 * Automatically:
 * - Reads cookies from current request
 * - Passes them into Supabase client
 *
 * Used in server components and API routes.
 */
export const getSupabaseServerClient = async (): Promise<SupabaseClient> => {
  /**
   * Next.js cookie store (request-scoped).
   */
  const cookieStore = await cookies();

  return createSupabaseAuthServer({
    /**
     * Map Next.js cookies → Supabase format.
     */
    getAll: () =>
      cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
      })),

    /**
     * Write cookies back via Next.js API.
     */
    set: (name, value, options) => {
      cookieStore.set({ name, value, ...options });
    },
  });
};