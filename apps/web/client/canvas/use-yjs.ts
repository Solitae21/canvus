"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  undo: () => void;
  redo: () => void;
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
  // Lazy useState init runs exactly once per component lifetime, unlike
  // useMemo which React intentionally double-invokes in dev StrictMode.
  // Double-invocation of `new Y.Doc(...)` would leave two doc instances in
  // flight — the discarded one still holds maps that local actions would
  // mutate without the active UndoManager seeing them.
  const [doc] = useState(() => new Y.Doc({ guid: roomName }));
  const shapes = useMemo(() => doc.getMap<Shape>("shapes"), [doc]);
  const connections = useMemo(() => doc.getMap<Connection>("connections"), [doc]);
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const [provider, setProvider] = useState<SocketIOProvider | null>(null);
  const [status, setStatus] = useState<YjsConnectionStatus>(
    autoConnect ? "connecting" : "disconnected",
  );
  const [isSynced, setIsSynced] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    const um = new Y.UndoManager([shapes, connections], { captureTimeout: 500 });
    undoManagerRef.current = um;

    const update = () => {
      setCanUndo(um.undoStack.length > 0);
      setCanRedo(um.redoStack.length > 0);
    };
    update();
    um.on("stack-item-added", update);
    um.on("stack-item-popped", update);
    um.on("stack-cleared", update);
    return () => {
      um.off("stack-item-added", update);
      um.off("stack-item-popped", update);
      um.off("stack-cleared", update);
      um.destroy();
      if (undoManagerRef.current === um) {
        undoManagerRef.current = null;
      }
    };
  }, [shapes, connections]);

  const undo = useCallback(() => undoManagerRef.current?.undo(), []);
  const redo = useCallback(() => undoManagerRef.current?.redo(), []);

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
      // Don't destroy the doc here: it's owned by useState lazy init and
      // lives for the component's lifetime. Destroying it in a dev-StrictMode
      // cleanup would invalidate state across the simulated remount.
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
    undo,
    redo,
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
