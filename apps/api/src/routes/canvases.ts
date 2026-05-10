import { Router } from 'express';
import type { Connection, Shape } from '@canvus/shared';
import * as store from '../store/memory.js';
import { broadcastToCanvas } from '../ws/index.js';

export const canvasesRouter: Router = Router();

canvasesRouter.get('/canvases', (_req, res) => {
  res.json(store.list());
});

canvasesRouter.post('/canvases', (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name : undefined;
  const created = store.create(name);
  res.status(201).json(created);
});

canvasesRouter.get('/canvases/:id', (req, res) => {
  const canvas = store.get(req.params.id);
  if (!canvas) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json(canvas);
});

canvasesRouter.put('/canvases/:id', (req, res) => {
  const body = req.body ?? {};
  if (!Array.isArray(body.shapes) || !Array.isArray(body.connections)) {
    res.status(400).json({ error: 'invalid_body', detail: 'shapes and connections must be arrays' });
    return;
  }
  const updated = store.replace(req.params.id, {
    name: typeof body.name === 'string' ? body.name : undefined,
    shapes: body.shapes as Shape[],
    connections: body.connections as Connection[],
  });
  if (!updated) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  broadcastToCanvas(req.params.id, { type: 'canvas:replaced', payload: updated, clientId: 'server' });
  res.json(updated);
});

canvasesRouter.patch('/canvases/:id', (req, res) => {
  const body = req.body ?? {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    res.status(400).json({ error: 'invalid_body', detail: 'name must be a non-empty string' });
    return;
  }
  const updated = store.rename(req.params.id, name);
  if (!updated) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  broadcastToCanvas(req.params.id, {
    type: 'canvas:renamed',
    payload: { id: updated.id, name: updated.name, updatedAt: updated.updatedAt },
    clientId: 'server',
  });
  res.json(updated);
});

canvasesRouter.delete('/canvases/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.status(204).send();
});
