// Import Next.js metadata type for SEO typing
import type { Metadata } from "next";

// Import Geist fonts from Google Fonts integration
import { Geist, Geist_Mono } from "next/font/google";

// Global CSS applied across the app
import "./globals.css";

// Custom SEO metadata builder
import { buildMetadata } from "@/src/lib/seo";

// Generate and export metadata for the entire app (used by Next.js)
export const metadata: Metadata = buildMetadata();

// Configure Geist Sans font and expose it as a CSS variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configure Geist Mono font and expose it as a CSS variable
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Root layout component wrapping the entire application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language and attach font variables + base styling
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Ensure full height layout and vertical stacking */}
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}