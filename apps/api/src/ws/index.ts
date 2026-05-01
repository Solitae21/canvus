import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';

export let io: Server;

export function attachSocketIO(server: HttpServer, allowedOrigin: string): void {
  io = new Server(server, {
    cors: { origin: allowedOrigin },
    path: '/ws',
  });

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
