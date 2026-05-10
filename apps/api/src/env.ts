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

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = parsePort(process.env.PORT, 4000);
export const HOST = process.env.HOST ?? "127.0.0.1";
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
export const ALLOWED_ORIGINS = parseOrigins(ALLOWED_ORIGIN);
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
export const ALLOW_GLOBAL_CANVAS_LIST = parseBoolean(process.env.ALLOW_GLOBAL_CANVAS_LIST);

export const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  return ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin);
};
