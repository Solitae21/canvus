"use client";

import { useEffect, useRef } from "react";
import * as Y from "yjs";
import type { Connection, Shape } from "@canvus/shared";
import { useYjsCanvas } from "@/client/canvas/use-yjs";
import { useSaveBoardMutation } from "@/redux/api/boardsApi";

const SAVE_INTERVAL_MS = 30_000;

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export function BoardAutoSaver({ boardId }: { boardId: string }) {
  const { doc, shapes, connections } = useYjsCanvas();
  const [save] = useSaveBoardMutation();
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    const onUpdate = (_update: Uint8Array, origin: unknown) => {
      if (origin === "snapshot-seed") return;
      dirtyRef.current = true;
    };
    doc.on("update", onUpdate);
    return () => {
      doc.off("update", onUpdate);
    };
  }, [doc]);

  useEffect(() => {
    const tick = async () => {
      if (savingRef.current || !dirtyRef.current) return;
      dirtyRef.current = false;
      savingRef.current = true;
      try {
        const state = bytesToBase64(Y.encodeStateAsUpdate(doc));
        const shapesArr: Shape[] = Array.from(shapes.values());
        const connArr: Connection[] = Array.from(connections.values());
        await save({
          id: boardId,
          state,
          shapes: shapesArr,
          connections: connArr,
        }).unwrap();
      } catch {
        dirtyRef.current = true;
      } finally {
        savingRef.current = false;
      }
    };
    const handle = setInterval(tick, SAVE_INTERVAL_MS);
    return () => {
      clearInterval(handle);
    };
  }, [boardId, doc, shapes, connections, save]);

  return null;
}
