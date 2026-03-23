// FILE: src/app/(marketing)/page.tsx
// ROUTE: / (homepage)
// ROLE: public marketing landing page
import PoweredByShipindays from "../components/branding/powered-by-shipindays";
import BrandingHero from "../components/branding/banding-hero";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <BrandingHero />
      <footer className="border-t px-6 py-4 flex items-center justify-center">
        <PoweredByShipindays />
      </footer>
    </main>
  );
}