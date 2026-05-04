import { io } from 'socket.io-client';

export type WsEnvelope = {
  type: string;
  payload?: unknown;
  clientId?: string;
};

export type CanvasWsClient = {
  send: (envelope: WsEnvelope) => void;
  onMessage: (handler: (envelope: WsEnvelope) => void) => () => void;
  close: () => void;
};

export type CanvasWsOptions = {
  userId: string;
  metadata?: Record<string, unknown>;
};

export const connectCanvasWs = (canvasId: string, options: CanvasWsOptions): CanvasWsClient => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const query: Record<string, string> = {
    canvasId,
    userId: options.userId,
  };

  if (options.metadata) {
    query.metadata = JSON.stringify(options.metadata);
  }

  const socket = io(base, {
    path: '/ws',
    query,
    transports: ['polling', 'websocket'],
  });

  const handlers = new Set<(e: WsEnvelope) => void>();

  socket.on('message', (envelope: WsEnvelope) => {
    for (const h of handlers) h(envelope);
  });

  return {
    send: (envelope) => socket.emit('message', envelope),
    onMessage: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close: () => socket.disconnect(),
  };
};
