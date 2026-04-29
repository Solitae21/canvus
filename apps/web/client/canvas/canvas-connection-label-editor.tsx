"use client";

import { useEffect, useRef } from "react";
import type { Connection } from "@/redux/slice/canvas/canvas-slice";

export interface CanvasConnectionLabelEditorProps {
  connection: Connection;
  midX: number;
  midY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

const EDITOR_WIDTH = 160;

const CanvasConnectionLabelEditor = ({
  connection,
  midX,
  midY,
  offsetX,
  offsetY,
  scale,
  onCommit,
  onCancel,
}: CanvasConnectionLabelEditorProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const screenX = midX * scale + offsetX - (EDITOR_WIDTH * scale) / 2;
  const screenY = midY * scale + offsetY - 14 * scale;

  return (
    <input
      ref={inputRef}
      defaultValue={connection.label ?? ""}
      onBlur={(e) => onCommit(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="absolute text-center outline-none ring-2 ring-blue-400 rounded"
      style={{
        left: screenX,
        top: screenY,
        width: EDITOR_WIDTH * scale,
        fontSize: Math.max(10, 12 * scale),
        background: "#1a1625",
        color: "#ffffff",
        padding: `${2 * scale}px ${6 * scale}px`,
      }}
    />
  );
};

export default CanvasConnectionLabelEditor;
