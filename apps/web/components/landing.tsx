import React from "react";
import {
  Github,
  Zap,
  ArrowRight,
  Check,
  Command,
  ShieldCheck,
  Globe,
  ZapIcon,
  Layers,
  Radio,
} from "lucide-react";

export default function ShipInDays() {
  return (
    <div className="min-h-screen w-full bg-white text-[#121212] selection:bg-black selection:text-white font-sans antialiased">
      {/* Minimalist Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <div className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-black flex items-center justify-center">
              <Zap size={12} className="text-white fill-white" />
            </div>
            <span className="text-base font-black tracking-tighter uppercase">
              shipindays
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.2em] text-gray-400">
            <a href="#features" className="hover:text-black transition-colors">
              FEATURES
            </a>
            <a href="#logic" className="hover:text-black transition-colors">
              LOGIC
            </a>
            <a href="#docs" className="hover:text-black transition-colors">
              DOCS
            </a>
          </div>

          <div className="flex items-center gap-8">
            <button className="text-[11px] font-bold tracking-[0.1em] hover:text-indigo-600 transition-colors">
              SIGN IN
            </button>
            <button className="bg-black text-white text-[11px] font-bold px-7 py-3 tracking-[0.1em] hover:bg-gray-800 transition-all">
              CLONE REPO
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - High Negative Space */}
      <header className="relative pt-64 pb-32 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-start">
          <div className="mb-8 flex items-center gap-3">
            <span className="h-[1px] w-12 bg-indigo-600" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-600 uppercase">
              Open Source SaaS Engine
            </span>
          </div>

          <h1 className="text-7xl md:text-[120px] font-extrabold tracking-[-0.06em] leading-[0.85] mb-12">
            Build fast. <br />
            <span className="text-gray-200">Ship faster.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-light mb-16">
            An opinionated Next.js boilerplate designed for speed. Swap
            providers with{" "}
            <span className="text-black font-medium underline underline-offset-4">
              one flag
            </span>
            . No configuration headaches.
          </p>

          <div className="flex flex-wrap gap-5">
            <button className="group px-12 py-5 bg-black text-white text-xs font-bold tracking-[0.1em] uppercase hover:pr-14 transition-all flex items-center gap-3">
              Start Building
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
            <button className="px-12 py-5 border border-gray-200 text-xs font-bold tracking-[0.1em] uppercase hover:bg-gray-50 transition-all">
              View GitHub
            </button>
          </div>
        </div>
      </header>

      {/* Feature Grid - Minimal Borders */}
      <section
        id="features"
        className="py-40 px-6 max-w-7xl mx-auto border-t border-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
          <Feature
            icon={<Radio size={20} />}
            title="Provider Switch"
            desc="Switch between Auth0, Clerk, or NextAuth with a single environment flag. Zero manual re-coding."
          />
          <Feature
            icon={<Layers size={20} />}
            title="Atomic Design"
            desc="Pre-built Shadcn components organized for maximum reusability and clean folder structures."
          />
          <Feature
            icon={<ShieldCheck size={20} />}
            title="Type Safe"
            desc="End-to-end safety with TypeScript, Zod, and Drizzle ORM. If it compiles, it works."
          />
        </div>
      </section>

      {/* Comparison - Clean & Numerical */}
      <section id="logic" className="bg-[#fcfcfc] py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24">
            <h2 className="text-4xl font-bold tracking-tighter mb-4">
              Forget Configuration.
            </h2>
            <p className="text-gray-500 font-light">
              The time you save is the product you build.
            </p>
          </div>

          <div className="space-y-px bg-gray-100 border border-gray-100 overflow-hidden">
            <StatRow label="Database Migration" time="2s" action="Automatic" />
            <StatRow label="Provider Switching" time="1s" action="One Flag" />
            <StatRow label="Stripe Integration" time="5s" action="Pre-wired" />
            <StatRow label="Deployment" time="30s" action="Vercel Ready" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-10 text-center">
        <div className="mb-10 opacity-20 flex justify-center">
          <div className="h-8 w-8 bg-black rounded-full" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.5em] text-gray-300 uppercase">
          &copy; 2024 SHIPINDAYS — BUILT FOR PERFORMANCE
        </p>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-start">
      <div className="mb-8 p-4 bg-gray-50 rounded-full text-black">{icon}</div>
      <h3 className="text-lg font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-light">{desc}</p>
    </div>
  );
}

function StatRow({
  label,
  time,
  action,
}: {
  label: string;
  time: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between p-10 bg-white hover:bg-gray-50 transition-colors">
      <span className="text-sm font-bold tracking-tight uppercase">
        {label}
      </span>
      <div className="flex items-center gap-12">
        <span className="text-xs font-mono text-gray-300">{time}</span>
        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase italic">
          {action}
        </span>
      </div>
    </div>
  );
}
