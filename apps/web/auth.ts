import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Credentials provider + JWT sessions need no database adapter; the API owns the DB.
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
