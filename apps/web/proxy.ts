import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  // `req.auth` is only truthy for a session that actually verified. Anything
  // unverifiable (no cookie, or a stale cookie from a rotated/missing secret)
  // is treated as signed-out, so we never trap the user in a
  // /sign-in ⇄ /dashboard redirect loop.
  const isAuthed = !!req.auth?.user;

  const isProtected = pathname.startsWith("/dashboard");
  if (isProtected && !isAuthed) {
    const url = new URL("/sign-in", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return Response.redirect(url);
  }

  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  if (isAuthPage && isAuthed) {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
