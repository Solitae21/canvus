"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useToast } from "@/components/toast/toast-provider";

/**
 * Pings the Auth.js session endpoint once on load. A 500 here means the server
 * is misconfigured (almost always a missing `AUTH_SECRET`); surfacing it as a
 * toast turns the previously-silent console error into something the user can
 * see, instead of a dead "Sign in" button.
 */
function AuthHealthCheck() {
  const { error } = useToast();
  const warned = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => {
        if (warned.current || res.ok) return;
        warned.current = true;
        if (res.status >= 500) {
          error(
            "Sign-in is temporarily unavailable — the authentication service isn't configured correctly. Please try again shortly.",
            { title: "Authentication unavailable" },
          );
        }
      })
      .catch((err: unknown) => {
        // Ignore the abort that fires on unmount; report genuine failures.
        if (warned.current || (err instanceof DOMException && err.name === "AbortError")) {
          return;
        }
        warned.current = true;
        error(
          "Couldn't reach the authentication service. Check your connection and try again.",
          { title: "Network error" },
        );
      });
    return () => controller.abort();
  }, [error]);

  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthHealthCheck />
      {children}
    </NextAuthSessionProvider>
  );
}
