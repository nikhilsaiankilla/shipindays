// FILE: src/app/api/auth/complete/route.ts
// ROUTE: GET /api/auth/complete
// ROLE: checks if user is new or existing → routes accordingly
//
// NextAuth calls this after successful OAuth or magic link login
// as the callbackUrl.
//
// Flow:
//   Google/Magic link success → NextAuth → redirects here
//   → read session
//   → check DB for existing user
//   → existing → /dashboard
//   → new      → /onboarding
//
// TODO: replace the DB check with your actual database query
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const session = await auth();

    if (!session?.user) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`);
    }

    // ── TODO: Check if user exists in your database ───────────────────────────
    // Replace this with your actual DB query.
    //
    // Example with Mongoose:
    //   import { connectDB } from "@/lib/db";
    //   import User from "@/lib/db/models/User";
    //   await connectDB();
    //   const existing = await User.findOne({ email: session.user.email });
    //   if (!existing) {
    //     await User.create({
    //       email: session.user.email,
    //       name:  session.user.name,
    //       image: session.user.image,
    //     });
    //     return NextResponse.redirect(`${appUrl}/onboarding`);
    //   }
    //   return NextResponse.redirect(`${appUrl}/dashboard`);
    //
    // Example with Drizzle:
    //   import { db } from "@/lib/db";
    //   import { users } from "@/lib/db/schema";
    //   import { eq } from "drizzle-orm";
    //   const [existing] = await db.select().from(users).where(eq(users.email, session.user.email!));
    //   if (!existing) {
    //     await db.insert(users).values({ email: session.user.email!, name: session.user.name });
    //     return NextResponse.redirect(`${appUrl}/onboarding`);
    //   }
    //   return NextResponse.redirect(`${appUrl}/dashboard`);
    // ─────────────────────────────────────────────────────────────────────────

    // Default: send everyone to dashboard
    return NextResponse.redirect(`${appUrl}/dashboard`);
}