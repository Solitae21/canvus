import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { ALLOWED_ORIGIN, NODE_ENV, PORT } from './env.js';
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[${NODE_ENV}] API listening on http://localhost:${PORT}`);
  console.log(`[${NODE_ENV}] WebSocket at ws://localhost:${PORT}/ws?canvasId=…`);
});
