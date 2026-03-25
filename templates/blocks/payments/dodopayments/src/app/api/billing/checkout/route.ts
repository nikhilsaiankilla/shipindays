// FILE: src/app/api/billing/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { billing } from "@/src/lib/payments"; // adjust path if needed
import { getSupabaseServerClient } from "@/src/lib/auth/server";
import { getUser } from "@/src/db/db-helpers";

export const GET = async (req: NextRequest) => {
    try {
        const supabase = await getSupabaseServerClient();

        // 1. Get logged in user
        const {
            data: { user: authUser },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser || !authUser?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Get DB user (important: don't trust auth blindly)
        const dbUser = await getUser({
            field: "email",
            value: authUser?.email,
        });

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. Get priceId from query
        const { searchParams } = new URL(req?.url);
        const priceId = searchParams.get("priceId");

        if (!priceId) {
            return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
        }

        // 4. Create checkout
        const checkout = await billing.createCheckout(
            priceId,
            dbUser?.email
        );

        return NextResponse.json(checkout);
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
};