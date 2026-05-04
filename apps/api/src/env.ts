import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const PORT = Number(process.env.PORT ?? 4000);
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
