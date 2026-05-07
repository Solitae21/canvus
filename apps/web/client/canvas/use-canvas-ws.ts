"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { connectCanvasWs, type WsEnvelope } from "@/lib/ws";

const CURSOR_COLORS = ["#60a5fa", "#f472b6", "#34d399", "#fb923c", "#a78bfa"];

export function useCanvasWs(
  canvasId: string,
  messageHandler: ((envelope: WsEnvelope) => void) | null
): { send: (envelope: WsEnvelope) => void; userId: string; name: string; color: string } {
  const [userId] = useState<string>(() => crypto.randomUUID());
  const [name] = useState<string>(() => "User " + userId.slice(0, 4));
  const [color] = useState<string>(() => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]);
  const wsRef = useRef<ReturnType<typeof connectCanvasWs> | null>(null);
  const handlerRef = useRef(messageHandler);
  // Update handler ref inside an effect to avoid ref access during render
  useEffect(() => {
    handlerRef.current = messageHandler;
  }, [messageHandler]);

  useEffect(() => {
    const client = connectCanvasWs(canvasId, { userId });
    wsRef.current = client;
    const unsub = client.onMessage((envelope) => {
      // Filter own echoes using clientId
      if (envelope.clientId === userId) return;
      handlerRef.current?.(envelope);
    });
    return () => {
      unsub();
      client.close();
      wsRef.current = null;
    };
  }, [canvasId, userId]);

  const send = useCallback((envelope: WsEnvelope) => {
    wsRef.current?.send(envelope);
  }, []);

  return { send, userId, name, color };
}
