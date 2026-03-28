import NextAuth from "next-auth";
import { authOptions } from "@/src/lib/auth/options";

/**
 * Initialize NextAuth with the configured auth options.
 *
 * `authOptions` contains:
 * - Providers (Google, GitHub, etc.)
 * - Callbacks (session, jwt, etc.)
 * - Pages configuration
 */
const handler = NextAuth(authOptions);

/**
 * Next.js App Router route handlers.
 *
 * Exposes NextAuth as both GET and POST handlers:
 * - GET  → used for fetching session, CSRF, providers, etc.
 * - POST → used for actions like sign-in, sign-out, callbacks
 *
 * These routes are typically mounted at:
 * /api/auth/[...nextauth]
 */
export { handler as GET, handler as POST };