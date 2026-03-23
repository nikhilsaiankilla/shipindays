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
import { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

function normalizeSameSite(
  sameSite: boolean | "lax" | "strict" | "none" | undefined
): "lax" | "strict" | "none" | undefined {
  if (sameSite === true) return "lax";
  if (sameSite === false) return undefined;
  return sameSite;
}

export function createSupabaseAuthServer(cookieStore: CookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
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

export const getSupabaseServerClient = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies();

  return createSupabaseAuthServer({
    getAll: () =>
      cookieStore.getAll().map((c) => ({
        name: c.name,
        value: c.value,
      })),
    set: (name, value, options) => {
      cookieStore.set({ name, value, ...options });
    },
  });
};
