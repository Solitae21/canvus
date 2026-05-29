/**
 * Best-effort extraction of the end user's IP from the incoming request. The
 * hosting platform (Vercel, a reverse proxy) sets these headers; we forward the
 * result to the API so it can rate-limit auth attempts per real client rather
 * than per BFF instance.
 */
export const getClientIp = (req: Request): string | undefined => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp || undefined;
};
