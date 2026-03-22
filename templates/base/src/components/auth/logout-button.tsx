"use client";

// FILE: src/components/auth/logout-button.tsx
// ROUTE: not a route — used in dashboard navbar
// ROLE: logout button — calls /api/auth/logout which is implemented per block
//
// This component never changes regardless of auth provider.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        setLoading(true);

        await fetch("/api/auth/logout", { method: "POST" });

        router.push("/login");
        router.refresh();
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="text-sm px-3 py-1.5 border rounded-md hover:bg-muted
                 transition-colors disabled:opacity-50"
        >
            {loading ? "Signing out..." : "Sign out"}
        </button>
    );
}