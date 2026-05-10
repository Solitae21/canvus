import type { Canvas, CanvasSummary, Shape, Connection } from '@canvus/shared';

const canvases = new Map<string, Canvas>();

const newId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const summary = (c: Canvas): CanvasSummary => ({
  id: c.id,
  name: c.name,
  updatedAt: c.updatedAt,
});

export const list = (): CanvasSummary[] =>
  Array.from(canvases.values()).map(summary);

export const get = (id: string): Canvas | undefined => canvases.get(id);

export const create = (name = 'Untitled'): Canvas => {
  const now = new Date().toISOString();
  const canvas: Canvas = {
    id: newId(),
    name,
    shapes: [],
    connections: [],
    updatedAt: now,
  };
  canvases.set(canvas.id, canvas);
  return canvas;
};

export const replace = (
  id: string,
  data: { name?: string; shapes: Shape[]; connections: Connection[] },
): Canvas | undefined => {
  const existing = canvases.get(id);
  if (!existing) return undefined;
  const updated: Canvas = {
    id,
    name: data.name ?? existing.name,
    shapes: data.shapes,
    connections: data.connections,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(id, updated);
  return updated;
};

export const rename = (id: string, name: string): Canvas | undefined => {
  const existing = canvases.get(id);
  if (!existing) return undefined;
  const updated: Canvas = {
    ...existing,
    name,
    updatedAt: new Date().toISOString(),
  };
  canvases.set(id, updated);
  return updated;
};

export const remove = (id: string): boolean => canvases.delete(id);
