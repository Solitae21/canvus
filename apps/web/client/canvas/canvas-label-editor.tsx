"use client";

import { useEffect, useRef } from "react";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";
import { MAX_CANVAS_LABEL_LENGTH } from "@/lib/canvas-security";

export interface CanvasLabelEditorProps {
  shape: Shape;
  offsetX: number;
  offsetY: number;
  scale: number;
  onCommit: (value: string) => void;
  onCancel: () => void;
}

const CanvasLabelEditor = ({
  shape,
  offsetX,
  offsetY,
  scale,
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
    left: shape.x * scale + offsetX,
    top: shape.y * scale + offsetY,
    width: shape.w * scale,
    height: shape.h * scale,
    fontSize: 14 * scale,
  };

  if (shape.type === "sticky") {
    return (
      <textarea
        ref={textareaRef}
        defaultValue={shape.label}
        maxLength={MAX_CANVAS_LABEL_LENGTH}
        onBlur={(e) => onCommit(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        className="absolute resize-none rounded leading-snug outline-none ring-2 ring-blue-400"
        style={{
          ...baseStyle,
          padding: 12 * scale,
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
      maxLength={MAX_CANVAS_LABEL_LENGTH}
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
      className="absolute text-center outline-none ring-2 ring-blue-400 rounded bg-transparent"
      style={{
        ...baseStyle,
        color: "#ffffff",
      }}
    />
  );
};

export default CanvasLabelEditor;
