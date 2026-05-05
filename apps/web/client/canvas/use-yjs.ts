"use client";

import { useEffect, useMemo, useState } from "react";
import type { Shape } from "@canvus/shared";
import { SocketIOProvider } from "y-socket.io";
import * as Y from "yjs";

type YjsConnectionStatus = "disconnected" | "connecting" | "connected";

type UseYjsOptions = {
  roomName?: string;
  serverUrl?: string;
  autoConnect?: boolean;
};

type UseYjsResult = {
  doc: Y.Doc;
  provider: SocketIOProvider | null;
  shapes: Y.Map<Shape>;
  status: YjsConnectionStatus;
  isConnected: boolean;
  isSynced: boolean;
};

export const useYjs = (
  canvasId: string,
  {
    roomName = `canvas:${canvasId}`,
    serverUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    autoConnect = true,
  }: UseYjsOptions = {},
): UseYjsResult => {
  const doc = useMemo(() => new Y.Doc({ guid: roomName }), [roomName]);
  const shapes = useMemo(() => doc.getMap<Shape>("shapes"), [doc]);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [status, setStatus] = useState<YjsConnectionStatus>(
    autoConnect ? "connecting" : "disconnected",
  );
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    const nextProvider = new SocketIOProvider(
      serverUrl,
      roomName,
      doc,
      {
        autoConnect,
      },
      {
        path: "/ws",
        transports: ["polling", "websocket"],
      },
    );

    const handleStatus = ({ status: nextStatus }: { status: YjsConnectionStatus }) => {
      setStatus(nextStatus);
    };

    const handleSync = (synced: boolean) => {
      setIsSynced(synced);
    };

    let disposed = false;

    nextProvider.on("status", handleStatus);
    nextProvider.on("sync", handleSync);
    queueMicrotask(() => {
      if (!disposed) setProvider(nextProvider);
    });

    return () => {
      disposed = true;
      nextProvider.off("status", handleStatus);
      nextProvider.off("sync", handleSync);
      nextProvider.destroy();
      doc.destroy();
    };
  }, [autoConnect, doc, roomName, serverUrl]);

  return {
    doc,
    provider,
    shapes,
    status,
    isConnected: status === "connected",
    isSynced,
  };
};
