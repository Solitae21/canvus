import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const developmentSecret = "canvus-local-development-auth-secret";

export const authConfig = {
  providers: [Google],
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : developmentSecret),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
