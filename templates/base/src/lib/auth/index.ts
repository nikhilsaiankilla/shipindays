// FILE: src/lib/auth/index.ts
// ROUTE: not a route — imported everywhere auth is needed
// ROLE: placeholder — REPLACED by chosen auth block (supabase or nextauth)
//
// CONTRACT — every auth block must export these exact functions:
//
//   getCurrentUser()  → returns logged-in user or null
//   requireUser()     → returns user or redirects to /login
//   signOut()         → signs out + redirects to /
//
// Your app always imports from "@/lib/auth" — never from the provider directly.
// ─────────────────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
    throw new Error("Auth provider not configured.");
}

export async function requireUser() {
    throw new Error("Auth provider not configured.");
}

export async function signOut() {
    throw new Error("Auth provider not configured.");
}