// FILE: src/app/api/auth/signup/route.ts
// ROUTE: POST /api/auth/signup
// ROLE: creates a new user account — called by /signup page
//
// Hashes the password with bcrypt and saves to your database.
// TODO: replace the DB save section with your actual DB (Mongoose or Drizzle).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { nextAuthSignIn } from "@/src/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  // Hash password — never store plain text passwords
  const hashedPassword = await bcrypt.hash(password, 12);

  // ── TODO: Save user to your database ─────────────────────────────────────
  // Replace this section with your actual DB call.
  //
  // Example with Mongoose:
  //   import User from "@/lib/db/models/User";
  //   import { connectDB } from "@/lib/db";
  //   await connectDB();
  //   const existing = await User.findOne({ email });
  //   if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  //   await User.create({ name, email, password: hashedPassword });
  //
  // Example with Drizzle:
  //   import { db } from "@/lib/db";
  //   import { users } from "@/lib/db/schema";
  //   import { eq } from "drizzle-orm";
  //   const [existing] = await db.select().from(users).where(eq(users.email, email));
  //   if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  //   await db.insert(users).values({ email, name, password: hashedPassword });
  // ─────────────────────────────────────────────────────────────────────────

  // Auto sign-in after signup
  await nextAuthSignIn("credentials", {
    email,
    password, // use plain password here — authorize() will hash-compare
    redirect: false,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
