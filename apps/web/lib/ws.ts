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

const wsBase = (): string => {
  const http = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  return http.replace(/^http/, "ws");
};

export const connectCanvasWs = (canvasId: string): CanvasWsClient => {
  const socket = new WebSocket(`${wsBase()}/ws?canvasId=${encodeURIComponent(canvasId)}`);
  const handlers = new Set<(e: WsEnvelope) => void>();

  socket.addEventListener("message", (event) => {
    let envelope: WsEnvelope;
    try {
      envelope = JSON.parse(event.data) as WsEnvelope;
    } catch {
      return;
    }
    for (const h of handlers) h(envelope);
  });

  return {
    send: (envelope) => {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(envelope));
    },
    onMessage: (handler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close: () => socket.close(),
  };
};
