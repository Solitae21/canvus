import http from 'node:http';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { HOST, NODE_ENV, PORT, isAllowedOrigin } from './env.js';
import { healthRouter } from './routes/health.js';
import { canvasesRouter } from './routes/canvases.js';
import { attachSocketIO } from './ws/index.js';

const app = express();

const originGuard: RequestHandler = (req, res, next) => {
  if (!isAllowedOrigin(req.headers.origin)) {
    res.status(403).json({ error: 'origin_not_allowed' });
    return;
  }
  next();
};

const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'invalid_json' });
    return;
  }
  next(err);
};

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = typeof err?.status === 'number' ? err.status : 500;
  if (status === 413) {
    res.status(413).json({ error: 'payload_too_large' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'internal_error' });
};

app.disable('x-powered-by');
app.use(helmet());
app.use(originGuard);
app.use(cors({ origin: (origin, callback) => callback(null, isAllowedOrigin(origin)) }));
app.use(rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}));
app.use(express.json({ limit: '4mb' }));
app.use(jsonErrorHandler);

app.use(healthRouter);
app.use(canvasesRouter);
app.use(errorHandler);

const server = http.createServer(app);
await attachSocketIO(server);

server.listen(PORT, HOST, () => {
  console.log(`[${NODE_ENV}] API listening on http://${HOST}:${PORT}`);
  console.log(`[${NODE_ENV}] WebSocket at ws://localhost:${PORT}/ws?canvasId=...`);
});
