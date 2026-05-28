"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { connectCanvasWs, type WsEnvelope } from "@/lib/ws";
import { getGuestIdentity, type GuestIdentity } from "@/lib/guest";

type Subscriber = (envelope: WsEnvelope) => void;

interface CanvasWsValue {
  send: (envelope: WsEnvelope) => void;
  subscribe: (handler: Subscriber) => () => void;
  userId: string;
  name: string;
  color: string;
}

const Ctx = createContext<CanvasWsValue | null>(null);

export const CanvasWsProvider = ({
  canvasId,
  roomId,
  identity,
  authToken,
  children,
}: {
  canvasId: string;
  roomId?: string;
  identity?: GuestIdentity;
  authToken?: string;
  children: ReactNode;
}) => {
  const [fallbackIdentity] = useState<GuestIdentity>(() => identity ?? getGuestIdentity());
  const currentIdentity = identity ?? fallbackIdentity;
  const wsRef = useRef<ReturnType<typeof connectCanvasWs> | null>(null);
  const subscribersRef = useRef<Set<Subscriber>>(new Set());

  useEffect(() => {
    const client = connectCanvasWs(roomId ?? canvasId, {
      userId: currentIdentity.userId,
      metadata: { name: currentIdentity.name, color: currentIdentity.color },
      authToken,
    });
    wsRef.current = client;
    const unsub = client.onMessage((envelope) => {
      if (envelope.clientId === currentIdentity.userId) return;
      subscribersRef.current.forEach((s) => s(envelope));
    });
    return () => {
      unsub();
      client.close();
      wsRef.current = null;
    };
  }, [authToken, canvasId, currentIdentity.color, currentIdentity.name, currentIdentity.userId, roomId]);

  const send = useCallback((envelope: WsEnvelope) => {
    wsRef.current?.send(envelope);
  }, []);

  const subscribe = useCallback((handler: Subscriber) => {
    subscribersRef.current.add(handler);
    return () => {
      subscribersRef.current.delete(handler);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        send,
        subscribe,
        userId: currentIdentity.userId,
        name: currentIdentity.name,
        color: currentIdentity.color,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useCanvasWsContext = (): CanvasWsValue => {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useCanvasWsContext must be used within a CanvasWsProvider");
  }
  return v;
};
