import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { internalApi } from "@/lib/internal-api";
import { getClientIp } from "@/lib/client-ip";

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
      async authorize(credentials, request) {
        const email = normalizeEmail(credentials?.email);
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || password.length === 0) return null;

        let res: Response;
        try {
          res = await internalApi("/internal/auth/verify-credentials", {
            method: "POST",
            body: { email, password },
            clientIp: request instanceof Request ? getClientIp(request) : undefined,
          });
        } catch (err) {
          // API unreachable (e.g. not running, ECONNREFUSED). Log the cause so it
          // shows up in the web-server console rather than being silently swallowed
          // by Auth.js as a generic Configuration error.
          console.error("[auth] verify-credentials request failed:", err);
          throw err;
        }
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
  // In production AUTH_SECRET (or NEXTAUTH_SECRET) MUST be set in the environment
  // — e.g. on Vercel. Leaving it undefined here makes Auth.js fail loudly with a
  // Configuration error rather than silently signing with a guessable key.
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : developmentSecret),
  // Trust the deployment host (Vercel, custom domains, proxies) so Auth.js can
  // resolve callback URLs without a separately-configured AUTH_URL.
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,   // 7 days — explicit expiry set on both JWT and httpOnly cookie
    updateAge: 24 * 60 * 60,    // slide forward at most once per active day
  },
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
