import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server as HttpServer } from 'node:http';
import { REDIS_URL } from '../env.js';

export let io: Server;

export async function attachSocketIO(server: HttpServer, allowedOrigin: string): Promise<void> {
  io = new Server(server, {
    cors: { origin: allowedOrigin },
    path: '/ws',
  });

  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    const canvasId = socket.handshake.query.canvasId as string | undefined;
    if (!canvasId) {
      socket.disconnect();
      return;
    }

    socket.join(canvasId);

    socket.on('message', (envelope: unknown) => {
      socket.to(canvasId).emit('message', envelope);
    });

    socket.on('disconnect', () => socket.leave(canvasId));
  });
}

export function broadcastToCanvas(canvasId: string, envelope: unknown): void {
  io?.to(canvasId).emit('message', envelope);
}
