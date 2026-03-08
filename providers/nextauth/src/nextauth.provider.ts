import { AuthProvider } from "@shipindays/auth";
import { signIn, signOut, auth } from "./auth.config";

export class NextAuthProvider implements AuthProvider {
  async signInWithMagicLink(email: string): Promise<void> {
    await signIn("email", {
      email,
      redirect: false,
    });
  }

  async signInWithGoogle(): Promise<void> {
    await signIn("google");
  }

  async getUser() {
    const session = await auth();

    if (!session?.user) return null;

    return {
      id: session.user.id as string,
      email: session.user.email as string,
    };
  }

  async signOut(): Promise<void> {
    await signOut();
  }
}
