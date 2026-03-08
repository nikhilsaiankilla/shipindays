export interface AuthProvider {
  signInWithMagicLink(email: string): Promise<void>;

  signInWithGoogle(): Promise<void>;

  getUser(): Promise<{
    id: string;
    email: string;
  } | null>;

  signOut(): Promise<void>;
}
