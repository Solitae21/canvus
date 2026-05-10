"use client";

import { useEffect, useRef } from "react";
import type * as Y from "yjs";
import type { Connection } from "@canvus/shared";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectShape,
  setPendingFromId,
  setTool,
  undo,
  redo,
  setMultiSelection,
  copySelection,
  type Shape,
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

export function useCanvasKeyboard(
  yjsShapes: Y.Map<Shape>,
  yjsConnections: Y.Map<Connection>,
) {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const selectedConnectionId = useAppSelector((s) => s.canvas.selectedConnectionId);
  const selectedIds = useAppSelector((s) => s.canvas.selectedIds);
  const selectedConnectionIds = useAppSelector((s) => s.canvas.selectedConnectionIds);
  const tool = useAppSelector((s) => s.canvas.tool);
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const clipboard = useAppSelector((s) => s.canvas.clipboard);

  // Stable refs so event handlers don't go stale
  const selectedIdRef = useRef(selectedId);
  const selectedConnectionIdRef = useRef(selectedConnectionId);
  const selectedIdsRef = useRef(selectedIds);
  const selectedConnectionIdsRef = useRef(selectedConnectionIds);
  const toolRef = useRef(tool);
  const shapesRef = useRef(shapes);
  const clipboardRef = useRef(clipboard);
  const yjsShapesRef = useRef(yjsShapes);
  const yjsConnectionsRef = useRef(yjsConnections);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    selectedConnectionIdRef.current = selectedConnectionId;
    selectedIdsRef.current = selectedIds;
    selectedConnectionIdsRef.current = selectedConnectionIds;
    toolRef.current = tool;
    shapesRef.current = shapes;
    clipboardRef.current = clipboard;
    yjsShapesRef.current = yjsShapes;
    yjsConnectionsRef.current = yjsConnections;
  }, [
    clipboard,
    selectedConnectionId,
    selectedConnectionIds,
    selectedId,
    selectedIds,
    shapes,
    tool,
    yjsConnections,
    yjsShapes,
  ]);

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

      // ── Copy / Paste ─────────────────────────────────────────────────────────
      if (ctrl && e.key === "c") {
        e.preventDefault();
        dispatch(copySelection());
        return;
      }
      if (ctrl && e.key === "v") {
        e.preventDefault();
        const cb = clipboardRef.current;
        if (cb && cb.shapes.length > 0) {
          const idMap = new Map<string, string>();
          for (const s of cb.shapes) idMap.set(s.id, newId());
          const newShapes = cb.shapes.map(s => ({ ...s, id: idMap.get(s.id)!, x: s.x + 20, y: s.y + 20 }));
          const newConns = cb.connections.map(c => ({ ...c, id: newId(), fromId: idMap.get(c.fromId)!, toId: idMap.get(c.toId)! }));
          const yjs = yjsShapesRef.current;
          const yjsConns = yjsConnectionsRef.current;
          yjs.doc!.transact(() => {
            for (const s of newShapes) yjs.set(s.id, s);
            for (const c of newConns) yjsConns.set(c.id, c);
          });
          dispatch(setMultiSelection({ shapeIds: newShapes.map(s => s.id), connectionIds: newConns.map(c => c.id) }));
        }
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
            yjsShapesRef.current.set(newShape.id, newShape);
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
      if (e.key === "Backspace" || e.key === "Delete") {
        const hasMulti =
          selectedIdsRef.current.length > 0 || selectedConnectionIdsRef.current.length > 0;
        if (hasMulti) {
          e.preventDefault();
          const shapeIds = selectedIdsRef.current;
          const connectionIds = selectedConnectionIdsRef.current;
          const shapeIdSet = new Set(shapeIds);
          const connIdSet = new Set(connectionIds);
          const yjs = yjsShapesRef.current;
          const yjsConns = yjsConnectionsRef.current;
          yjs.doc!.transact(() => {
            for (const id of shapeIds) yjs.delete(id);
            for (const c of Array.from(yjsConns.values())) {
              if (connIdSet.has(c.id) || shapeIdSet.has(c.fromId) || shapeIdSet.has(c.toId)) {
                yjsConns.delete(c.id);
              }
            }
          });
          dispatch(setMultiSelection({ shapeIds: [], connectionIds: [] }));
          return;
        }
        if (selectedIdRef.current) {
          e.preventDefault();
          const id = selectedIdRef.current;
          const yjs = yjsShapesRef.current;
          const yjsConns = yjsConnectionsRef.current;
          yjs.doc!.transact(() => {
            yjs.delete(id);
            for (const c of Array.from(yjsConns.values())) {
              if (c.fromId === id || c.toId === id) yjsConns.delete(c.id);
            }
          });
          dispatch(selectShape(null));
          return;
        }
        if (selectedConnectionIdRef.current) {
          e.preventDefault();
          yjsConnectionsRef.current.delete(selectedConnectionIdRef.current);
          dispatch(selectShape(null));
          return;
        }
      }

      // ── Escape ───────────────────────────────────────────────────────────────
      if (e.key === "Escape") {
        dispatch(selectShape(null)); // clears selectedId + selectedIds + selectedConnectionIds
        dispatch(setPendingFromId(null));
        return;
      }

      // ── Arrow nudge ──────────────────────────────────────────────────────────
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        const multiIds = selectedIdsRef.current;
        const singleId = selectedIdRef.current;

        if (multiIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 8 : 1;
          const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
          const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
          const yjs = yjsShapesRef.current;
          yjs.doc!.transact(() => {
            for (const id of multiIds) {
              const shape = yjs.get(id) ?? shapesRef.current.find((s) => s.id === id);
              if (shape) yjs.set(id, { ...shape, x: shape.x + dx, y: shape.y + dy });
            }
          });
          return;
        }

        if (singleId) {
          e.preventDefault();
          const step = e.shiftKey ? 8 : 1;
          const yjs = yjsShapesRef.current;
          const shape = yjs.get(singleId) ?? shapesRef.current.find((s) => s.id === singleId);
          if (shape) {
            const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
            const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
            yjs.set(singleId, { ...shape, x: shape.x + dx, y: shape.y + dy });
          }
          return;
        }
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
