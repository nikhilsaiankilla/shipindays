// FILE: src/app/api/auth/google/route.ts
// ROUTE: GET /api/auth/google
// ROLE: returns the NextAuth Google OAuth URL
//
// Flow: login page calls this → gets URL → redirects user to Google
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";

export async function GET() {
    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const callbackUrl = `${appUrl}/api/auth/complete`;

    // NextAuth handles Google OAuth at /api/auth/signin/google
    // We just redirect there with our callbackUrl
    const googleSignInUrl =
        `${appUrl}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return NextResponse.json({ url: googleSignInUrl });
}