import "dotenv/config";

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined): boolean =>
  value?.toLowerCase() === "true";

const parseOrigins = (value: string): string[] =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Express's `trust proxy` setting. Numeric = number of trusted proxy hops in
// front of the API (typical PaaS = 1); "true"/"false" trust all/none. Getting
// this right is what makes per-IP rate limiting actually see the client IP.
const parseTrustProxy = (value: string | undefined, production: boolean): boolean | number => {
  if (value === undefined) return production ? 1 : false;
  if (value.toLowerCase() === "true") return true;
  if (value.toLowerCase() === "false") return false;
  const hops = Number(value);
  return Number.isInteger(hops) && hops >= 0 ? hops : false;
};

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = parsePort(process.env.PORT, 4000);
// Default to localhost in dev; bind to all interfaces in production so
// container/PaaS port scanners (e.g. Render) can detect the open port.
export const HOST = process.env.HOST ?? (NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
export const ALLOWED_ORIGINS = parseOrigins(ALLOWED_ORIGIN);
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
export const ALLOW_GLOBAL_CANVAS_LIST = parseBoolean(process.env.ALLOW_GLOBAL_CANVAS_LIST);
export const TRUST_PROXY = parseTrustProxy(process.env.TRUST_PROXY, NODE_ENV === "production");
// Legacy unauthenticated "guest" canvas store. Anyone can read/write guest
// canvases, so operators who only want authenticated boards can turn this off.
export const ENABLE_GUEST_CANVASES = process.env.ENABLE_GUEST_CANVASES?.toLowerCase() !== "false";
// Shared secret the web (BFF) sends on internal routes. Empty means internal routes are disabled.
export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
};
