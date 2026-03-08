import { AuthProvider } from "@shipindays/auth";
import { supabaseClient } from "./client";
import { supabaseServer } from "./server";

export class SupabaseAuthProvider implements AuthProvider {
  async signInWithMagicLink(email: string) {
    await supabaseClient.auth.signInWithOtp({
      email,
    });
  }

  async signInWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async getUser() {
    const { data } = await supabaseServer.auth.getUser();

    if (!data.user) return null;

    return {
      id: data.user.id,
      email: data.user.email!,
    };
  }

  async signOut() {
    await supabaseClient.auth.signOut();
  }
}
