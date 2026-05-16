"use client";

import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { useYjsCanvas } from "@/client/canvas/use-yjs";
import { useGetBoardQuery } from "@/redux/api/boardsApi";

const base64ToBytes = (b64: string): Uint8Array => {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export function BoardSnapshotLoader({ boardId }: { boardId: string }) {
  const { doc } = useYjsCanvas();
  const { data } = useGetBoardQuery(boardId);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    if (!data?.snapshot?.state) return;
    const bytes = base64ToBytes(data.snapshot.state);
    if (bytes.length === 0) return;
    Y.applyUpdate(doc, bytes, "snapshot-seed");
    seededRef.current = true;
  }, [data?.snapshot, doc]);

  return null;
}
