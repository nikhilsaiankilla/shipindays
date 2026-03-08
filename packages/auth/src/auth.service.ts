import { loadAuthProvider } from "./provider-loader";

let provider: any;

export async function getAuthProvider() {
  if (!provider) {
    const Provider = await loadAuthProvider();
    provider = new Provider();
  }

  return provider;
}
