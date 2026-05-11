"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectShape, selectConnection } from "@/redux/slice/canvas/canvas-slice";
import type { Shape, Connection } from "@canvus/shared";
import { useYjsCanvas } from "./use-yjs";
import { usePresence } from "@/lib/use-presence";

const DEFAULT_CONNECTION_COLOR = "#ffffff";

const ColorRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const isTransparent = value === "transparent" || !value;
  const swatchValue = isTransparent ? "#ffffff" : value;

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-on-surface-variant tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-on-surface-variant w-20 text-right">
          {isTransparent ? "transparent" : value}
        </span>
        <label
          className="relative w-7 h-7 rounded-lg cursor-pointer overflow-hidden
                     ring-1 ring-white/[0.08] hover:ring-white/[0.16]
                     transition-all duration-150"
          style={{
            background: isTransparent
              ? "repeating-conic-gradient(#3a3a3a 0% 25%, #2a2a2a 0% 50%) 0 / 8px 8px"
              : swatchValue,
          }}
        >
          <input
            type="color"
            value={swatchValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

type PanelContent =
  | { kind: "shape"; shape: Shape }
  | { kind: "connection"; connection: Connection };

const CanvasRightPanel = () => {
  const dispatch = useAppDispatch();
  const { shapes: yjsShapes, connections: yjsConnections } = useYjsCanvas();
  const isOpen = useAppSelector((s) => s.ui.panels.right);
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const selectedConnectionId = useAppSelector((s) => s.canvas.selectedConnectionId);
  const shape = useAppSelector((s) =>
    selectedId ? s.canvas.shapes.find((sh) => sh.id === selectedId) : undefined,
  );
  const connection = useAppSelector((s) =>
    selectedConnectionId
      ? s.canvas.connections.find((c) => c.id === selectedConnectionId)
      : undefined,
  );

  const content: PanelContent | null = connection
    ? { kind: "connection", connection }
    : shape
      ? { kind: "shape", shape }
      : null;

  const visible = isOpen && content !== null;

  // Cache the most recent content so the exit animation has something to render
  // after the underlying selection is cleared. Refresh during render while
  // there's live content — React handles the immediate re-render itself.
  const [stickyContent, setStickyContent] = useState<PanelContent | null>(content);
  if (content && stickyContent !== content) {
    setStickyContent(content);
  }

  const { shouldRender, isExiting } = usePresence(visible, 200);

  if (!shouldRender) return null;

  const displayed = content ?? stickyContent;
  if (!displayed) return null;

  const updateConnection = (conn: Connection, patch: Partial<Connection>) => {
    const existing = yjsConnections.get(conn.id) ?? conn;
    yjsConnections.set(conn.id, { ...existing, ...patch });
  };

  const updateShape = (sh: Shape, patch: Partial<Shape>) => {
    const existing = yjsShapes.get(sh.id) ?? sh;
    yjsShapes.set(sh.id, { ...existing, ...patch });
  };

  return (
    <div
      className={`fixed right-4 top-20 w-72
                 bg-surface-container/80 backdrop-blur-[16px]
                 border border-white/[0.06] rounded-2xl
                 shadow-xl pointer-events-auto z-30 ${
                   isExiting ? "animate-side-panel-out" : "animate-side-panel-in"
                 }`}
    >
      {displayed.kind === "connection" ? (
        <>
          <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
            <div className="text-[11px] font-medium tracking-widest uppercase text-on-surface-variant">
              Properties
            </div>
            <div className="text-sm font-medium text-on-surface mt-0.5">
              Connector
            </div>
          </div>

          <div className="px-4 py-2">
            <ColorRow
              label="Color"
              value={displayed.connection.color ?? DEFAULT_CONNECTION_COLOR}
              onChange={(v) => updateConnection(displayed.connection, { color: v })}
            />
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => {
                yjsConnections.delete(displayed.connection.id);
                dispatch(selectConnection(null));
              }}
              className="w-full text-xs text-red-400 hover:text-red-300
                         hover:bg-red-500/[0.08] rounded-lg py-2
                         transition-colors duration-150"
            >
              Delete connector
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
            <div className="text-[11px] font-medium tracking-widest uppercase text-on-surface-variant">
              Properties
            </div>
            <div className="text-sm font-medium text-on-surface mt-0.5 capitalize">
              {displayed.shape.type.replace(/-/g, " ")}
            </div>
          </div>

          <div className="px-4 py-2">
            <ColorRow
              label="Fill"
              value={displayed.shape.fill}
              onChange={(v) => updateShape(displayed.shape, { fill: v })}
            />
            <ColorRow
              label="Stroke"
              value={displayed.shape.strokeColor}
              onChange={(v) => updateShape(displayed.shape, { strokeColor: v })}
            />
          </div>

          <div className="px-4 pb-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => {
                const id = displayed.shape.id;
                yjsShapes.doc!.transact(() => {
                  yjsShapes.delete(id);
                  for (const c of Array.from(yjsConnections.values())) {
                    if (c.fromId === id || c.toId === id) yjsConnections.delete(c.id);
                  }
                });
                dispatch(selectShape(null));
              }}
              className="w-full text-xs text-red-400 hover:text-red-300
                         hover:bg-red-500/[0.08] rounded-lg py-2
                         transition-colors duration-150"
            >
              Delete shape
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasRightPanel;
