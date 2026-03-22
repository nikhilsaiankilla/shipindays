// FILE: src/types/next-auth.d.ts
// ROUTE: not a route — picked up automatically by TypeScript
// ROLE: augments NextAuth Session type to include user.id
//       without this, session.user.id gives a TypeScript error
// ─────────────────────────────────────────────────────────────────────────────

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
