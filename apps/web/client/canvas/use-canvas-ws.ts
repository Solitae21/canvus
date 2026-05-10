"use client";

import { useEffect, useRef } from "react";
import type { WsEnvelope } from "@/lib/ws";
import { useCanvasWsContext } from "./canvas-ws-context";

export function useCanvasWs(
  _canvasId: string,
  messageHandler: ((envelope: WsEnvelope) => void) | null,
): { send: (envelope: WsEnvelope) => void; userId: string; name: string; color: string } {
  const { send, subscribe, userId, name, color } = useCanvasWsContext();
  const handlerRef = useRef(messageHandler);
  useEffect(() => {
    handlerRef.current = messageHandler;
  }, [messageHandler]);
  useEffect(() => {
    return subscribe((envelope) => handlerRef.current?.(envelope));
  }, [subscribe]);
  return { send, userId, name, color };
}
