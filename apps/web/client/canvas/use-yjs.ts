"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Connection, Shape } from "@canvus/shared";
import { SocketIOProvider } from "y-socket.io";
import * as Y from "yjs";

type YjsConnectionStatus = "disconnected" | "connecting" | "connected";

type UseYjsOptions = {
  roomName?: string;
  serverUrl?: string;
  autoConnect?: boolean;
};

type YjsCanvasValue = {
  doc: Y.Doc;
  provider: SocketIOProvider | null;
  shapes: Y.Map<Shape>;
  connections: Y.Map<Connection>;
  status: YjsConnectionStatus;
  isConnected: boolean;
  isSynced: boolean;
  undoManager: Y.UndoManager;
  canUndo: boolean;
  canRedo: boolean;
};

const YjsCanvasContext = createContext<YjsCanvasValue | null>(null);

const useYjsInternal = (
  canvasId: string,
  {
    roomName = `canvas:${canvasId}`,
    serverUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    autoConnect = true,
  }: UseYjsOptions = {},
): YjsCanvasValue => {
  const doc = useMemo(() => new Y.Doc({ guid: roomName }), [roomName]);
  const shapes = useMemo(() => doc.getMap<Shape>("shapes"), [doc]);
  const connections = useMemo(() => doc.getMap<Connection>("connections"), [doc]);
  const undoManager = useMemo(
    () => new Y.UndoManager([shapes, connections], { captureTimeout: 500 }),
    [shapes, connections],
  );
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [status, setStatus] = useState<YjsConnectionStatus>(
    autoConnect ? "connecting" : "disconnected",
  );
  const [isSynced, setIsSynced] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const update = () => {
      setCanUndo(undoManager.undoStack.length > 0);
      setCanRedo(undoManager.redoStack.length > 0);
    };
    update();
    undoManager.on("stack-item-added", update);
    undoManager.on("stack-item-popped", update);
    undoManager.on("stack-cleared", update);
    return () => {
      undoManager.off("stack-item-added", update);
      undoManager.off("stack-item-popped", update);
      undoManager.off("stack-cleared", update);
      undoManager.destroy();
    };
  }, [undoManager]);

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
    connections,
    status,
    isConnected: status === "connected",
    isSynced,
    undoManager,
    canUndo,
    canRedo,
  };
};

export const YjsCanvasProvider = ({
  canvasId,
  children,
  options,
}: {
  canvasId: string;
  children: ReactNode;
  options?: UseYjsOptions;
}) => {
  const value = useYjsInternal(canvasId, options);
  return createElement(YjsCanvasContext.Provider, { value }, children);
};

export const useYjsCanvas = (): YjsCanvasValue => {
  const ctx = useContext(YjsCanvasContext);
  if (!ctx) {
    throw new Error("useYjsCanvas must be used within a YjsCanvasProvider");
  }
  return ctx;
};
