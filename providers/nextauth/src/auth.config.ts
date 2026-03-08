import NextAuth, { type DefaultSession } from "next-auth";
import Email from "next-auth/providers/email";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }
}

type NextAuthExports = ReturnType<typeof NextAuth>;

const nextAuth = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Email({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
});

export const handlers: NextAuthExports["handlers"] = nextAuth.handlers;
export const auth: NextAuthExports["auth"] = nextAuth.auth;
export const signIn: NextAuthExports["signIn"] = nextAuth.signIn;
export const signOut: NextAuthExports["signOut"] = nextAuth.signOut;
