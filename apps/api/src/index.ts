import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { ALLOWED_ORIGIN, PORT } from './env.js';
import { healthRouter } from './routes/health.js';
import { canvasesRouter } from './routes/canvases.js';
import { attachSocketIO } from './ws/index.js';

const app = express();

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '4mb' }));

app.use(healthRouter);
app.use(canvasesRouter);

const server = http.createServer(app);
attachSocketIO(server, ALLOWED_ORIGIN);

server.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  console.log(`[api] ws endpoint  ws://localhost:${PORT}/ws?canvasId=…`);
});
