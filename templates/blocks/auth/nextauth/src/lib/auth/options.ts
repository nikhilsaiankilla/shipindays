import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration.
 *
 * Defines:
 * - OAuth providers
 * - Session strategy
 * - Custom pages
 * - JWT + session callbacks
 *
 * TEMPLATE NOTE:
 * This is the central place to configure authentication behavior.
 * Extend providers, callbacks, and session logic here.
 */
export const authOptions: NextAuthOptions = {
    /**
     * Authentication providers.
     *
     * Currently only Google is enabled.
     *
     * TEMPLATE NOTE:
     * Add more providers here (GitHub, Discord, etc.)
     * Example:
     * GitHubProvider({ clientId, clientSecret })
     */
    providers: [
        GoogleProvider({
            /**
             * OAuth credentials from environment variables.
             * Must be set in your .env file.
             */
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],

    /**
     * Session configuration.
     *
     * Using JWT strategy:
     * - No database session storage
     * - Session data stored in signed token (cookie)
     */
    session: {
        strategy: "jwt",

        /**
         * Session validity duration (in seconds).
         * Here: 30 days
         */
        maxAge: 30 * 24 * 60 * 60,
    },

    /**
     * Custom auth pages.
     *
     * Overrides default NextAuth pages.
     */
    pages: {
        signIn: "/login",
    },

    /**
     * Callbacks control how data flows between:
     * - OAuth provider → JWT → Session → UI
     */
    callbacks: {
        /**
         * JWT callback:
         * Runs whenever a token is created/updated.
         *
         * Used here to persist user.id inside the token.
         */
        async jwt({ token, user }) {
            /**
             * On initial login, `user` is available.
             * Persist user.id into token for later use.
             */
            if (user) token.id = user.id;

            return token;
        },

        /**
         * Session callback:
         * Runs whenever session is accessed (client/server).
         *
         * Used to expose token data to the session object.
         */
        async session({ session, token }) {
            if (session.user) {
                /**
                 * Attach user.id from token → session.user
                 *
                 * NOTE:
                 * Type is cast because NextAuth default types
                 * don't include custom fields.
                 */
                (session.user as any).id = token.id;
            }

            return session;
        },
    },

    /**
     * Secret used to sign/encrypt JWT tokens.
     *
     * TEMPLATE NOTE:
     * Must be set in production (AUTH_SECRET).
     */
    secret: process.env.AUTH_SECRET,
};