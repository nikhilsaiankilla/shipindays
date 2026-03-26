// FILE: src/lib/auth/index.ts
// ROUTE: not a route — imported by middleware, dashboard, API routes
// ROLE: NextAuth v5 config — Google + Magic Link (Email) only
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { redirect } from "next/navigation";

export const {
    handlers,
    auth,
    signIn: nextAuthSignIn,
    signOut: nextAuthSignOut,
} = NextAuth({
    providers: [
        // ── Google OAuth ────────────────────────────────────────────────────────
        Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) session.user.id = token.id as string;
            return session;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
});

// ── Contract functions ────────────────────────────────────────────────────────

export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user) return null;
    return session.user;
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}

export async function signOut() {
    await nextAuthSignOut({ redirectTo: "/" });
}