// Server-to-server base URL for the API. Falls back to the public API URL.
const API_BASE =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_KEY = process.env.INTERNAL_API_KEY ?? "";

type InternalFetchOptions = {
  method?: string;
  body?: unknown;
  /** Authenticated user id resolved from the NextAuth session. */
  userId?: string;
};

/**
 * Calls an internal API route, attaching the shared secret and (optionally) the
 * authenticated user id. Only ever runs on the server — the API is the single
 * owner of database access; the web app reaches the DB exclusively through this.
 */
export async function internalApi(
  path: string,
  options: InternalFetchOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = { "x-internal-key": INTERNAL_KEY };
  if (options.userId) headers["x-user-id"] = options.userId;
  if (options.body !== undefined) headers["content-type"] = "application/json";

  return fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });
}
