import { auth } from "@/auth";

export default auth((req) => {
  const isAuthed = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/canvas");
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
  matcher: ["/dashboard/:path*", "/canvas/:path*", "/sign-in", "/sign-up"],
};
