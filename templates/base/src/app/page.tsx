// FILE: src/app/(marketing)/page.tsx
// ROUTE: / (homepage)
// ROLE: public marketing landing page
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import PoweredByShipindays from "../components/branding/powered-by-shipindays";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-2xl text-center space-y-6">

        <h1 className="text-5xl font-bold tracking-tight">
          Your SaaS, ready to ship.
        </h1>

        <p className="text-xl text-muted-foreground">
          Auth, payments, and email — wired up and working.
          Just add your idea.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-foreground text-background rounded-md
                       font-medium hover:bg-foreground/90 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border rounded-md font-medium
                       hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
      
      <footer className="border-t px-6 py-4 flex items-center justify-center">
        <PoweredByShipindays />
      </footer>
    </main>
  );
}