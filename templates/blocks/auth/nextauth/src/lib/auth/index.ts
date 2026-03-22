// FILE: src/lib/auth/index.ts
// ROUTE: not a route — imported everywhere auth is needed
// ROLE: NextAuth v5 implementation of the auth contract
//
// INJECTED BY CLI when user picks "NextAuth v5"
// Overwrites base placeholder at src/lib/auth/index.ts
//
// Exports the 3 contract functions every auth block must have:
//   getCurrentUser() — returns user or null
//   requireUser()    — returns user or redirects to /login
//   signOut()        — signs out and redirects to /
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// ─── NextAuth config ──────────────────────────────────────────────────────────
// handlers → used by /api/auth/[...nextauth]/route.ts
// auth     → used by middleware + server components to read session
// signIn   → used by login API route
// signOut  → used by logout API route
export const {
  handlers,
  auth,
  signIn: nextAuthSignIn,
  signOut: nextAuthSignOut,
} = NextAuth({
  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    // Needs: AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env.local
    // Setup: console.cloud.google.com → APIs → Credentials → OAuth 2.0
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // ── GitHub OAuth ──────────────────────────────────────────────────────────
    // Needs: AUTH_GITHUB_ID and AUTH_GITHUB_SECRET in .env.local
    // Setup: github.com → Settings → Developer settings → OAuth Apps
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),

    // ── Email + Password ──────────────────────────────────────────────────────
    // Validates credentials against hashed password in DB
    // TODO: swap the User.findOne() call with your actual DB query
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // TODO: replace this with your actual DB lookup
        // Example with Mongoose:
        //   import User from "@/lib/db/models/User";
        //   const user = await User.findOne({ email: credentials.email }).select("+password");
        //   if (!user || !user.password) return null;
        //   const valid = await bcrypt.compare(credentials.password as string, user.password);
        //   if (!valid) return null;
        //   return { id: user._id.toString(), email: user.email, name: user.name };

        // Example with Drizzle:
        //   import { db } from "@/lib/db";
        //   import { users } from "@/lib/db/schema";
        //   import { eq } from "drizzle-orm";
        //   const [user] = await db.select().from(users).where(eq(users.email, credentials.email as string));
        //   if (!user || !user.password) return null;
        //   const valid = await bcrypt.compare(credentials.password as string, user.password);
        //   if (!valid) return null;
        //   return { id: user.id, email: user.email, name: user.name };

        return null; // replace this line with the above
      },
    }),
  ],

  callbacks: {
    // ── JWT callback ──────────────────────────────────────────────────────────
    // Runs when JWT is created or updated.
    // Attach extra fields here to make them available in session.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },

    // ── Session callback ──────────────────────────────────────────────────────
    // Runs whenever session is accessed.
    // Pulls fields from JWT token into session.user.
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login", // redirect here when auth is required
    error: "/login", // redirect here on auth errors
  },

  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
});

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Returns the logged-in user or null.
// Use when you want to show different UI for logged-in vs logged-out users.
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

// ─── requireUser ─────────────────────────────────────────────────────────────
// Returns the logged-in user OR redirects to /login.
// Use on any protected page — user is guaranteed after this call.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// ─── signOut ──────────────────────────────────────────────────────────────────
// Signs the user out and redirects to /.
// Called from /api/auth/logout route.
export async function signOut() {
  await nextAuthSignOut({ redirectTo: "/" });
}
