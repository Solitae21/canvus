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

export const connectCanvasWs = (canvasId: string): CanvasWsClient => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const socket = io(base, {
    path: '/ws',
    query: { canvasId },
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
