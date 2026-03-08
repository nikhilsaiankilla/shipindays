export async function loadAuthProvider() {
  const provider = process.env.AUTH_PROVIDER;

  switch (provider) {
    case "supabase":
      return (await import("@shipindays/supabase-auth")).SupabaseAuthProvider;

    case "nextauth":
      return (await import("@shipindays/nextauth")).NextAuthProvider;

    default:
      throw new Error("Unsupported auth provider");
  }
}
