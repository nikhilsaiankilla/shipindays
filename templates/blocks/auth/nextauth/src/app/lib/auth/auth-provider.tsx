// import { auth } from "@/src/app/api/auth/[...nextauth]/route";;
import { auth } from "@/src/app/api/auth/[...nextauth]/route";
import { SessionProvider } from "next-auth/react";

export default async function AuthProvider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    )
}