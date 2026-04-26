import type { IncomingMessage, Server } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';

type Envelope = {
  type: string;
  payload?: unknown;
  clientId?: string;
};

const rooms = new Map<string, Set<WebSocket>>();

const join = (canvasId: string, socket: WebSocket): void => {
  let room = rooms.get(canvasId);
  if (!room) {
    room = new Set();
    rooms.set(canvasId, room);
  }
  room.add(socket);
};

const leave = (canvasId: string, socket: WebSocket): void => {
  const room = rooms.get(canvasId);
  if (!room) return;
  room.delete(socket);
  if (room.size === 0) rooms.delete(canvasId);
};

export const broadcast = (canvasId: string, envelope: Envelope, except?: WebSocket): void => {
  const room = rooms.get(canvasId);
  if (!room) return;
  const json = JSON.stringify(envelope);
  for (const client of room) {
    if (client === except) continue;
    if (client.readyState === WebSocket.OPEN) client.send(json);
  }
};

const canvasIdFrom = (req: IncomingMessage): string | undefined => {
  if (!req.url) return undefined;
  const url = new URL(req.url, 'http://localhost');
  return url.searchParams.get('canvasId') ?? undefined;
};

export const attachWebSocket = (server: Server): WebSocketServer => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (!req.url?.startsWith('/ws')) {
      socket.destroy();
      return;
    }
    const canvasId = canvasIdFrom(req);
    if (!canvasId) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => {
      join(canvasId, ws);

      ws.on('message', (data) => {
        let envelope: Envelope;
        try {
          envelope = JSON.parse(data.toString());
        } catch {
          return;
        }
        broadcast(canvasId, envelope, ws);
      });

      ws.on('close', () => leave(canvasId, ws));
      ws.on('error', () => leave(canvasId, ws));
    });
  });

  return wss;
};
