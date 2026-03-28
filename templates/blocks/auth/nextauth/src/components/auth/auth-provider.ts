"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

/**
 * Wraps the app with NextAuth's SessionProvider.
 *
 * This enables client-side access to authentication state via:
 * - useSession()
 * - signIn()
 * - signOut()
 *
 * Without this provider, auth hooks will not work in client components.
 */
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        /**
         * SessionProvider manages:
         * - Session state (user data)
         * - Automatic session refresh
         * - Sync between tabs/windows
         *
         * TEMPLATE NOTE:
         * You can pass props here (e.g. refetchInterval, refetchOnWindowFocus)
         * to control how often the session updates.
         */
        <SessionProvider>
            {children}
        </SessionProvider>
    );
};

export default AuthProvider;