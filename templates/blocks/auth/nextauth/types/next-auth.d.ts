import NextAuth, { DefaultSession } from "next-auth";

/**
 * Module augmentation for NextAuth types.
 *
 * Extends the default Session object to include a required `user.id`.
 * This ensures type safety across the app when accessing user.id.
 *
 * Without this, TypeScript only knows about name/email/image
 * and will complain when you try to use user.id.
 */
declare module "next-auth" {
    interface Session {
        user: {
            /**
             * Unique identifier for the authenticated user.
             * Must be added manually in the NextAuth callbacks (e.g. session callback).
             */
            id: string;
        } & DefaultSession["user"];
    }
}