"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/src/lib/auth";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        setLoading(true);
        try {
            await signOut();
            router.push("/login");
            router.refresh();
        } catch (error) {
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
                    <Loader2 size={14} className="animate-spin" />
                    <span>Terminating...</span>
                </>
            ) : (
                <>
                    <LogOut size={14} className="group-hover:text-red-500 transition-colors" />
                    <span>Logout</span>
                </>
            )}
            
            {/* Subtle "Tape" effect decoration (optional) */}
            <div className="absolute -top-2 -right-1 w-4 h-2 bg-red-500/20 rotate-12 group-hover:bg-red-500/40 transition-colors" />
        </button>
    );
}