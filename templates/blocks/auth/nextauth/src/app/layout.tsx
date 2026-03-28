import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { buildMetadata } from "@/src/lib/seo";
import AuthProvider from "../components/auth/auth-provider";

/**
 * Global metadata applied to the entire app.
 *
 * Uses the centralized SEO builder.
 *
 * TEMPLATE NOTE:
 * Customize SEO defaults in "@/src/lib/seo"
 * instead of modifying metadata here.
 */
export const metadata: Metadata = buildMetadata();

/**
 * Load Geist fonts and expose them as CSS variables.
 * These variables are applied at the <html> level.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      /**
       * Apply font variables globally + enable smoother text rendering.
       */
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        /**
         * Root layout container:
         * - full height
         * - flex column for consistent page layouts
         */
        className="min-h-full flex flex-col"
      >
        {/**
         * Global auth context provider.
         *
         * Makes session/user data available across the app.
         * Required for client-side auth hooks (e.g. useSession).
         *
         * TEMPLATE NOTE:
         * Do not remove unless you replace the auth system.
         */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}