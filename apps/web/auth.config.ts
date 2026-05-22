import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { internalApi } from "@/lib/internal-api";

const developmentSecret = "canvus-local-development-auth-secret";

const normalizeEmail = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length === 0 ? null : trimmed;
};

export const authConfig = {
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || password.length === 0) return null;

        const res = await internalApi("/internal/auth/verify-credentials", {
          method: "POST",
          body: { email, password },
        });
        if (!res.ok) return null;

        const user = (await res.json()) as {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
        };

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
  ],
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
