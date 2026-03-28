"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
    /**
     * Tracks whether logout is in progress.
     * Used to disable the button and show a loading state.
     */
    const [loading, setLoading] = useState(false);

    /**
     * Next.js router for client-side navigation.
     */
    const router = useRouter();

    /**
     * Handles logout flow:
     * 1. Calls NextAuth signOut to invalidate session
     * 2. Redirects user to /login
     * 3. Refreshes app state to clear any cached session data
     */
    async function handleLogout() {
        setLoading(true);

        try {
            /**
             * Terminates the current session.
             * NextAuth handles cookie/session cleanup internally.
             */
            await signOut();

            /**
             * Redirect to login page after logout.
             */
            router.push("/login");

            /**
             * Forces re-fetch of server components to avoid stale auth state.
             */
            router.refresh();
        } catch (error) {
            /**
             * Restore UI state if logout fails so user can retry.
             */
            console.error("Logout failed:", error);
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="group relative flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-black rounded-lg font-black uppercase text-[10px] tracking-widest transition-all hover:bg-red-50 hover:-translate-y-0.5 active:translate-y-0 shadow-[3px_3px_0px_#000] hover:shadow-[4px_4px_0px_#ef4444] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    {/* Spinner + status text during logout */}
                    <Loader2 size={14} className="animate-spin" />
                    <span>Terminating...</span>
                </>
            ) : (
                <>
                    {/* Default logout icon and label */}
                    <LogOut size={14} className="group-hover:text-red-500 transition-colors" />
                    <span>Logout</span>
                </>
            )}
            
            {/* Decorative element (visual only, no functional role) */}
            <div className="absolute -top-2 -right-1 w-4 h-2 bg-red-500/20 rotate-12 group-hover:bg-red-500/40 transition-colors" />
        </button>
    );
}