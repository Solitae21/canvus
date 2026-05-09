"use client";

const SESSION_KEY = "canvus.guest.session";
const CANVASES_KEY = "canvus.guest.canvases";

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
