import http from 'node:http';
import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { HOST, NODE_ENV, PORT, TRUST_PROXY, isAllowedOrigin } from './env.js';
import { healthRouter } from './routes/health.js';
import { canvasesRouter } from './routes/canvases.js';
import { authRouter } from './routes/auth.js';
import { boardsRouter } from './routes/boards.js';
import { attachSocketIO } from './ws/index.js';

// Catch stray async rejections / sync throws so the cause is always visible in
// the log and the process does not exit silently (which leaves tsx watch alive
// but nothing bound to PORT, causing ECONNREFUSED on sign-in).
process.on('unhandledRejection', (reason) => console.error('[api] unhandledRejection', reason));
process.on('uncaughtException', (err) => console.error('[api] uncaughtException', err));

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
// Behind a proxy/PaaS, req.ip is the proxy's address unless we declare how many
// hops to trust. Without this the per-IP rate limiter buckets every client
// together. See TRUST_PROXY in env.ts.
app.set('trust proxy', TRUST_PROXY);
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
app.use(authRouter);
app.use(boardsRouter);
app.use(errorHandler);

const server = http.createServer(app);

// Start listening before setting up Socket.IO / Redis so that HTTP auth routes
// (sign-in, register) serve even if realtime setup fails.
server.listen(PORT, HOST, () => {
  console.log(`[${NODE_ENV}] API listening on http://${HOST}:${PORT}`);
  console.log(`[${NODE_ENV}] WebSocket at ws://localhost:${PORT}/ws?canvasId=...`);
});

// Socket.IO + Redis are best-effort: a failure degrades realtime collaboration
// but must not take down sign-in.
attachSocketIO(server).catch((err) => {
  console.error('[api] Socket.IO setup failed — realtime unavailable:', err);
});
