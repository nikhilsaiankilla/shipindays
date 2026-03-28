// FILE: src/app/dashboard/page.tsx
// ROUTE: /dashboard
// ROLE: Protected user landing page.
//
// This page is server-rendered and protected via requireUser().
// If the user is not authenticated, they are redirected before this renders.

import { requireUser } from "@/src/lib/auth";
import LogoutButton from "@/src/components/auth/logout-button";
import { Ship, Zap, Star, ArrowRight, Layout, Terminal } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    /**
     * Fetch the currently authenticated user.
     * This runs on the server, ensuring secure session validation.
     * If no user is found, a redirect happens before rendering.
     */
    const user = await requireUser();
    
    /**
     * Derive a display name from the user's email.
     * Falls back to "Commander" if no email is available.
     */
    const userName = user.email ? user.email.split("@")[0] : "Commander";

    return (
        <main className="h-screen w-full bg-[#FDFCF0] flex flex-col overflow-hidden text-black font-sans">
            
            {/* Top navigation bar with branding and session controls */}
            <nav className="h-16 border-b-4 border-black px-6 flex items-center justify-between bg-white z-20">
                <div className="flex items-center gap-3">
                    
                    {/* Logo container with stylized rotation and shadow */}
                    <div className="bg-black p-1.5 border-2 border-white rotate-[-3deg] shadow-[2px_2px_0px_#FFA500]">
                        <Ship size={18} className="text-white" />
                    </div>

                    {/* App branding */}
                    <span className="font-black uppercase italic tracking-tighter text-lg">
                        SHIPINDAYS // <span className="text-orange-500">ENGINE_ROOM</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    
                    {/* Session status indicator with user identifier */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-zinc-100 border-2 border-black rounded-full text-[9px] font-black uppercase">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Session_Active // {userName}
                    </div>

                    {/* Handles client-side logout via API */}
                    <LogoutButton />
                </div>
            </nav>

            {/* Main dashboard workspace */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
                
                {/* Subtle background grid for visual texture */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{ 
                        backgroundImage: `radial-gradient(#000 2px, transparent 2px)`, 
                        backgroundSize: '32px 32px' 
                    }} 
                />

                <div className="max-w-2xl w-full relative z-10">
                    
                    {/* Version badge / environment label */}
                    <div className="inline-block bg-white border-2 border-black px-4 py-1 mb-6 rotate-[-1deg] shadow-[3px_3px_0px_#000]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Developer_Workspace // v1.0.4
                        </p>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] mb-8">
                        Design your <br /> 
                        <span className="text-orange-500 underline decoration-black/10">
                            Dashboard
                        </span> here.
                    </h1>

                    {/* Personalized welcome message */}
                    <p className="text-lg font-bold text-zinc-500 italic mb-12 max-w-lg mx-auto leading-tight">
                        "Welcome back, {userName}. The authentication kernel is live. Now, verify your payment flow and show some love to the engine."
                    </p>

                    {/* Action cards guiding user next steps */}
                    <div className="grid sm:grid-cols-2 gap-6 mb-12">
                        
                        {/* Payment testing card */}
                        <div className="bg-white border-4 border-black p-6 rounded-[15px_40px_10px_35px] shadow-[8px_8px_0px_#3B82F6] hover:-translate-y-1 transition-all text-left group">
                            <div className="w-10 h-10 bg-blue-50 border-2 border-black rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Zap size={20} />
                            </div>

                            <h3 className="font-black uppercase italic text-sm mb-2">
                                01. Test Payments
                            </h3>

                            <p className="text-[11px] font-bold text-zinc-400 mb-6 leading-tight">
                                Check if Stripe/Dodo webhooks are firing correctly.
                            </p>

                            {/* Navigates to pricing page for upgrade flow */}
                            <Link 
                                href="/pricing" 
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Upgrade Now <ArrowRight size={12} />
                            </Link>
                        </div>

                        {/* GitHub support / growth card */}
                        <div className="bg-white border-4 border-black p-6 rounded-[40px_15px_35px_10px] shadow-[8px_8px_0px_#FFA500] hover:-translate-y-1 transition-all text-left group">
                            <div className="w-10 h-10 bg-orange-50 border-2 border-black rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Star size={20} />
                            </div>

                            <h3 className="font-black uppercase italic text-sm mb-2">
                                02. Support Engine
                            </h3>

                            <p className="text-[11px] font-bold text-zinc-400 mb-6 leading-tight">
                                If everything is working, help us grow the kernel.
                            </p>

                            {/* External link to GitHub repo */}
                            <Link 
                                href="https://github.com/nikhilsaiankilla/shipindays" 
                                target="_blank" 
                                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                Star on GitHub <Star size={12} />
                            </Link>
                        </div>

                    </div>

                    {/* Developer hint showing file path for quick navigation */}
                    <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-300 font-bold uppercase">
                        <Terminal size={14} />
                        EDIT_THIS_PAGE: src/app/dashboard/page.tsx
                    </div>
                </div>
            </div>

            {/* Decorative background element for visual personality */}
            <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none hidden md:block">
                <Layout size={100} strokeWidth={1} className="rotate-12" />
            </div>
        </main>
    );
}