// FILE: src/app/dashboard/page.tsx
// ROUTE: /dashboard
// ROLE: protected page — calls requireUser() which redirects to /login if not authed
//
// This file NEVER changes regardless of auth provider.
// requireUser() handles the redirect — different implementation per block,
// same behaviour for your app.
// ─────────────────────────────────────────────────────────────────────────────

import { requireUser } from "@/src/lib/auth";
import LogoutButton from "@/src/components/auth/logout-button";

export default async function DashboardPage() {
    // requireUser() returns user if logged in, redirects to /login if not
    const user = await requireUser();

    return (
        <main className="min-h-screen bg-background">

            {/* Navbar */}
            <nav className="border-b px-6 py-4 flex items-center justify-between">
                <span className="font-semibold tracking-tight">My SaaS</span>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                    <LogoutButton />
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}.
                    </p>
                </div>

                {/* Placeholder content — replace with your app */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["Metric 1", "Metric 2", "Metric 3"].map((m) => (
                        <div key={m} className="rounded-lg border bg-card p-6">
                            <p className="text-sm text-muted-foreground">{m}</p>
                            <p className="text-2xl font-semibold mt-1">—</p>
                        </div>
                    ))}
                </div>

                <div className="rounded-lg border border-dashed p-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        Your app content goes here.
                    </p>
                </div>
            </div>

        </main>
    );
}