import { createAuthClient } from "better-auth/react";

// No baseURL — defaults to window.location.origin, works in both dev and prod
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
