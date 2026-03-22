// FILE: src/app/api/auth/login/route.ts
// ROUTE: POST /api/auth/login
// ROLE: handles login form submission — called by /login page
//
// Uses NextAuth signIn() server-side to authenticate with credentials.
// OAuth (Google, GitHub) is handled automatically by NextAuth at /api/auth/signin.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { nextAuthSignIn } from "@/src/lib/auth";
import { AuthError } from "next-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    await nextAuthSignIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    throw error;
  }
}
