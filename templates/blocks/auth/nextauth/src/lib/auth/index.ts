"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./options";

export async function getCurrentUser() {
    try {
        const session = await getServerSession(authOptions);
        return session?.user ?? null;
    } catch (error) {
        return null;
    }
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}

export async function signOut() {
    redirect("/api/auth/signout?callbackUrl=/")
}