"use client";

import { useEffect, useRef } from "react";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";

export interface CanvasLabelEditorProps {
  shape: Shape;
  offsetX: number;
  offsetY: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

const CanvasLabelEditor = ({
  shape,
  offsetX,
  offsetY,
  onCommit,
  onCancel,
}: CanvasLabelEditorProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = inputRef.current ?? textareaRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const baseStyle: React.CSSProperties = {
    left: shape.x + offsetX,
    top: shape.y + offsetY,
    width: shape.w,
    height: shape.h,
  };

  if (shape.type === "sticky") {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={shape.label}
        onBlur={(e) => onCommit(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        className="absolute resize-none rounded p-3 text-sm leading-snug outline-none ring-2 ring-blue-400"
        style={{
          ...baseStyle,
          background: shape.fill,
          color: "#1f2937",
        }}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      defaultValue={shape.label}
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
      className="absolute text-center text-sm outline-none ring-2 ring-blue-400 rounded bg-transparent"
      style={{
        ...baseStyle,
        color: "#ffffff",
      }}
    />
  );
};

export default CanvasLabelEditor;
