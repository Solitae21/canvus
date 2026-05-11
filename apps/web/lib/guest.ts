"use client";

import { generateGuestName, pickColor } from "./random-name";

const SESSION_KEY = "canvus.guest.session";
const CANVASES_KEY = "canvus.guest.canvases";
const USER_ID_KEY = "canvus.guest.userId";
const NAME_KEY = "canvus.guest.name";
const COLOR_KEY = "canvus.guest.color";

export interface GuestIdentity {
  userId: string;
  name: string;
  color: string;
}

const FALLBACK_IDENTITY: GuestIdentity = {
  userId: "00000000-0000-0000-0000-000000000000",
  name: "Guest",
  color: "#60a5fa",
};

let cachedIdentity: GuestIdentity | null = null;
let cachedIdentityKey: string | null = null;

const newId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getIdentityCacheKey = ({ userId, name, color }: GuestIdentity): string =>
  `${userId}\u0000${name}\u0000${color}`;

const cacheIdentity = (identity: GuestIdentity): GuestIdentity => {
  const key = getIdentityCacheKey(identity);
  if (cachedIdentity && cachedIdentityKey === key) return cachedIdentity;
  cachedIdentity = identity;
  cachedIdentityKey = key;
  return identity;
};

export const getGuestIdentity = (): GuestIdentity => {
  if (typeof window === "undefined") return FALLBACK_IDENTITY;
  const ls = window.localStorage;
  let userId = ls.getItem(USER_ID_KEY);
  let name = ls.getItem(NAME_KEY);
  let color = ls.getItem(COLOR_KEY);
  if (!userId) {
    userId = newId();
    ls.setItem(USER_ID_KEY, userId);
  }
  if (!name) {
    name = generateGuestName();
    ls.setItem(NAME_KEY, name);
  }
  if (!color) {
    color = pickColor();
    ls.setItem(COLOR_KEY, color);
  }
  return cacheIdentity({ userId, name, color });
};

export const isGuest = (): boolean =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(SESSION_KEY) === "1";

export const startGuestSession = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, "1");
};

export const endGuestSession = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(CANVASES_KEY);
  window.localStorage.removeItem(USER_ID_KEY);
  window.localStorage.removeItem(NAME_KEY);
  window.localStorage.removeItem(COLOR_KEY);
  cachedIdentity = null;
  cachedIdentityKey = null;
};

export const getGuestCanvasIds = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CANVASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
};

export const addGuestCanvas = (id: string): void => {
  if (typeof window === "undefined") return;
  const ids = getGuestCanvasIds();
  if (ids.includes(id)) return;
  window.localStorage.setItem(CANVASES_KEY, JSON.stringify([...ids, id]));
};

export const removeGuestCanvas = (id: string): void => {
  if (typeof window === "undefined") return;
  const ids = getGuestCanvasIds().filter((x) => x !== id);
  window.localStorage.setItem(CANVASES_KEY, JSON.stringify(ids));
};
