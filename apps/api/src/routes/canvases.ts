import { Router } from 'express';
import * as store from '../store/memory.js';
import { broadcastToCanvas } from '../ws/index.js';
import { ALLOW_GLOBAL_CANVAS_LIST } from '../env.js';
import {
  isValidIdentifier,
  normalizeCanvasName,
  parseIdList,
  validateCanvasPayload,
} from '../validation.js';

export const canvasesRouter: Router = Router();

canvasesRouter.get('/canvases', (req, res) => {
  const ids = parseIdList(req.query.ids);
  if (!ids.ok) {
    res.status(400).json({ error: 'invalid_query', detail: ids.detail });
    return;
  }

  if (!ids.value && !ALLOW_GLOBAL_CANVAS_LIST) {
    res.json([]);
    return;
  }

  res.json(store.list(ids.value));
});

canvasesRouter.post('/canvases', (req, res) => {
  const name = normalizeCanvasName(req.body?.name);
  const created = store.create(name);
  res.status(201).json(created);
});

canvasesRouter.get('/canvases/:id', (req, res) => {
  const { id } = req.params;
  if (!isValidIdentifier(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const canvas = store.get(id);
  if (!canvas) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.json(canvas);
});

canvasesRouter.put('/canvases/:id', (req, res) => {
  const { id } = req.params;
  if (!isValidIdentifier(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const payload = validateCanvasPayload(req.body);
  if (!payload.ok) {
    res.status(400).json({ error: 'invalid_body', detail: payload.detail });
    return;
  }

  const updated = store.replace(id, payload.value);
  if (!updated) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  broadcastToCanvas(id, { type: 'canvas:replaced', payload: updated, clientId: 'server' });
  res.json(updated);
});

canvasesRouter.patch('/canvases/:id', (req, res) => {
  const { id } = req.params;
  if (!isValidIdentifier(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const name = normalizeCanvasName(req.body?.name);
  if (!name) {
    res.status(400).json({ error: 'invalid_body', detail: 'name must be a non-empty string' });
    return;
  }
  const updated = store.rename(id, name);
  if (!updated) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  broadcastToCanvas(id, {
    type: 'canvas:renamed',
    payload: { id: updated.id, name: updated.name, updatedAt: updated.updatedAt },
    clientId: 'server',
  });
  res.json(updated);
});

canvasesRouter.delete('/canvases/:id', (req, res) => {
  const { id } = req.params;
  if (!isValidIdentifier(id)) {
    res.status(400).json({ error: 'invalid_id' });
    return;
  }

  const ok = store.remove(id);
  if (!ok) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.status(204).send();
});
