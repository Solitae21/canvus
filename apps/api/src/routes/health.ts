import { Router } from 'express';

export const healthRouter: Router = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'canvus-api',
    health: '/health',
  });
});

healthRouter.get('/health', (_req, res) => {
  res.json({ ok: true });
});
