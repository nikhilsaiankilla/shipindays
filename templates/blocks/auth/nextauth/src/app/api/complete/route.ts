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

import { NextResponse } from "next/server"
import { getUser, createUser, updateUserLogin } from "@/src/db/db-helpers"
import { auth } from "../auth/[...nextauth]/route"

export async function GET() {
    const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000"

    const session = await auth()

    if (!session?.user) {
        return NextResponse.redirect(`${appUrl}/login?error=no_session`)
    }

    const user = session.user

    if (!user.id || !user.email) {
        throw new Error("Invalid session: missing id/email")
    }

    const existingUser = await getUser({
        field: "authId",
        value: user.id,
    })

    if (!existingUser) {
        await createUser({
            authId: user.id,
            email: user.email,
            name: user.name ?? undefined,
            image: user.image ?? undefined,
            lastLoginAt: new Date(),
        })

        return NextResponse.redirect(`${appUrl}/onboarding`)
    }

    await updateUserLogin({
        authId: user.id,
        lastLoginAt: new Date(),
    })

    return NextResponse.redirect(`${appUrl}/dashboard`)
}