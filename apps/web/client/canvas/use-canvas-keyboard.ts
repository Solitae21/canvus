"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addShape,
  deleteShape,
  selectShape,
  setPendingFromId,
  setTool,
  updateShape,
  undo,
  redo,
  type ToolType,
} from "@/redux/slice/canvas/canvas-slice";
import { zoomIn, zoomOut, resetViewport } from "@/redux/slice/ui/ui-slice";
import { newId } from "./canvas-defaults";

const TOOL_KEYS: Record<string, ToolType> = {
  v: "select",
  h: "hand",
  r: "rect",
  d: "diamond",
  o: "oval",
  p: "pen",
  a: "arrow",
  t: "text",
  s: "sticky",
};

export function useCanvasKeyboard() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const tool = useAppSelector((s) => s.canvas.tool);
  const shapes = useAppSelector((s) => s.canvas.shapes);

  // Stable refs so event handlers don't go stale
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  // Space-to-pan state
  const spaceActiveRef = useRef(false);
  const prevToolRef = useRef<ToolType | null>(null);

  useEffect(() => {
    const isEditable = () => {
      const ae = document.activeElement as HTMLElement | null;
      return (
        !!ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.isContentEditable)
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditable()) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // ── Undo / Redo ──────────────────────────────────────────────────────────
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch(undo());
        return;
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch(redo());
        return;
      }

      // ── Duplicate ────────────────────────────────────────────────────────────
      if (ctrl && e.key === "d") {
        e.preventDefault();
        const id = selectedIdRef.current;
        if (id) {
          const shape = shapesRef.current.find((s) => s.id === id);
          if (shape) {
            const newShape = { ...shape, id: newId(), x: shape.x + 20, y: shape.y + 20 };
            dispatch(addShape(newShape));
          }
        }
        return;
      }

      // ── Zoom ─────────────────────────────────────────────────────────────────
      if (ctrl && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        dispatch(zoomIn());
        return;
      }
      if (ctrl && e.key === "-") {
        e.preventDefault();
        dispatch(zoomOut());
        return;
      }
      if (ctrl && e.key === "0") {
        e.preventDefault();
        dispatch(resetViewport());
        return;
      }

      // ── Delete ───────────────────────────────────────────────────────────────
      if ((e.key === "Backspace" || e.key === "Delete") && selectedIdRef.current) {
        e.preventDefault();
        dispatch(deleteShape(selectedIdRef.current));
        return;
      }

      // ── Escape ───────────────────────────────────────────────────────────────
      if (e.key === "Escape") {
        dispatch(selectShape(null));
        dispatch(setPendingFromId(null));
        return;
      }

      // ── Arrow nudge ──────────────────────────────────────────────────────────
      if (
        selectedIdRef.current &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 8 : 1;
        const shape = shapesRef.current.find((s) => s.id === selectedIdRef.current);
        if (shape) {
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          dispatch(updateShape({ id: shape.id, x: shape.x + dx, y: shape.y + dy }));
        }
        return;
      }

      // ── Space to pan ─────────────────────────────────────────────────────────
      if (e.key === " " && !spaceActiveRef.current) {
        e.preventDefault();
        spaceActiveRef.current = true;
        prevToolRef.current = toolRef.current;
        dispatch(setTool("hand"));
        return;
      }

      // ── Tool shortcuts (no modifier) ─────────────────────────────────────────
      if (!ctrl && !e.altKey) {
        const mappedTool = TOOL_KEYS[e.key.toLowerCase()];
        if (mappedTool) {
          dispatch(setTool(mappedTool));
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " && spaceActiveRef.current) {
        spaceActiveRef.current = false;
        if (prevToolRef.current !== null) {
          dispatch(setTool(prevToolRef.current));
          prevToolRef.current = null;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);
}
