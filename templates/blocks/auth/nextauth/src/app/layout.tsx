// FILE: src/app/layout.tsx
// ROUTE: wraps every single page in the app
// ROLE: root layout with SessionProvider for NextAuth
//
// INJECTED BY CLI — overwrites base layout.tsx
// NextAuth requires SessionProvider to make useSession() work in client components.
// Supabase does NOT need this — base layout.tsx is used as-is for Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My SaaS",
  description: "Built with shipindays",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* SessionProvider makes useSession() available in all client components */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
