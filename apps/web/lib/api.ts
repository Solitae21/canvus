import type { Canvas, CanvasSummary, Connection, Shape } from "@canvus/shared";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const json = async <T,>(res: Response): Promise<T> => {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`api ${res.status}: ${detail || res.statusText}`);
  }
  return (await res.json()) as T;
};

export const listCanvases = (): Promise<CanvasSummary[]> =>
  fetch(`${BASE}/canvases`).then((r) => json<CanvasSummary[]>(r));

export const getCanvas = (id: string): Promise<Canvas> =>
  fetch(`${BASE}/canvases/${encodeURIComponent(id)}`).then((r) => json<Canvas>(r));

export const createCanvas = (name?: string): Promise<Canvas> =>
  fetch(`${BASE}/canvases`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((r) => json<Canvas>(r));

export const saveCanvas = (
  id: string,
  doc: { name?: string; shapes: Shape[]; connections: Connection[] },
): Promise<Canvas> =>
  fetch(`${BASE}/canvases/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(doc),
  }).then((r) => json<Canvas>(r));

export const deleteCanvas = async (id: string): Promise<void> => {
  const res = await fetch(`${BASE}/canvases/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`api ${res.status}: ${res.statusText}`);
};
