"use client"

import React from 'react'
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = () => {
    const router = useRouter();

    useEffect(() => {
        const completeAuth = async () => {
            // Simulated delay for smooth transition feel
            try {
                await fetch(`/api/auth/complete`);
            } catch (error) {
                router.replace("/login?error=auth_failed");
            }
        };

        completeAuth();
    }, [router]);
    return (
        <div>auth loader</div>
    )
}

export default page