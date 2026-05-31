"use client";

import { useMemo, useState } from "react";
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
    <div className="group/row flex items-center justify-between gap-3 py-2.5">
      <span className="text-[11.5px] font-medium text-on-surface-variant tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10.5px] tracking-widest uppercase
                     text-on-surface-variant/70 group-hover/row:text-on-surface-variant
                     transition-colors duration-150 w-19.5 text-right tabular-nums"
        >
          {isTransparent ? "transparent" : value}
        </span>
        <label
          className="relative w-7 h-7 rounded-lg cursor-pointer overflow-hidden
                     ring-1 ring-white/10 hover:ring-white/25
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.4)]
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
          {/* Corner tick — sells the "drafting swatch" character */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 w-1.5 h-1.5
                       border-t border-l border-white/40"
          />
        </label>
      </div>
    </div>
  );
};

/* — Read-only spec row. Used for X/Y/W/H or endpoint IDs. — */
const SpecRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/3 transition-colors">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/60">
      {label}
    </span>
    <span className="font-mono text-[11px] tabular-nums text-on-surface/85">
      {value}
    </span>
  </div>
);

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

  const content = useMemo<PanelContent | null>(() => {
    if (connection) return { kind: "connection", connection };
    if (shape) return { kind: "shape", shape };
    return null;
  }, [connection, shape]);

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

  const isConnection = displayed.kind === "connection";
  const id = isConnection ? displayed.connection.id : displayed.shape.id;
  const typeLabel = isConnection
    ? "Connector"
    : displayed.shape.type.replace(/-/g, " ");

  return (
    <div
      className={`fixed right-4 top-20 w-72
                 bg-surface-container/85 backdrop-blur-xl
                 border border-white/[0.07] rounded-2xl
                 shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
                 pointer-events-auto z-30 overflow-hidden ${
                   isExiting ? "animate-side-panel-out" : "animate-side-panel-in"
                 }`}
    >
      {/* Hairline highlight at top edge — drafting paper character */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-6 right-6 h-px
                   bg-linear-to-r from-transparent via-white/20 to-transparent"
      />

      {/* ── Header ── editorial type + drafting spec ID ── */}
      <div className="relative px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="mono-caps">Properties</span>
          <span
            className="font-mono text-[9.5px] tracking-[0.18em] uppercase
                       text-on-surface-variant/55 tabular-nums"
            title={id}
          >
            {id.slice(0, 8)}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <h3 className="text-[19px] font-semibold text-on-surface tracking-tight capitalize leading-none">
            {typeLabel}
          </h3>
          <span className="text-[12px] font-medium text-copper/85 leading-none">
            {isConnection ? "edge" : "node"}
          </span>
        </div>
      </div>

      {/* Section rule */}
      <div className="mx-4 rule" />

      {/* ── Section: Appearance ── */}
      <div className="px-4 pt-3 pb-1">
        <div className="mono-caps text-[9.5px] mb-1.5 opacity-80">Appearance</div>
        {isConnection ? (
          <ColorRow
            label="Color"
            value={displayed.connection.color ?? DEFAULT_CONNECTION_COLOR}
            onChange={(v) => updateConnection(displayed.connection, { color: v })}
          />
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* ── Section: Geometry / Endpoints (read-only spec) ── */}
      {!isConnection && (
        <>
          <div className="mx-4 rule" />
          <div className="px-4 pt-3 pb-3">
            <div className="mono-caps text-[9.5px] mb-1.5 opacity-80">Geometry</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <SpecRow label="x" value={Math.round(displayed.shape.x).toString()} />
              <SpecRow label="y" value={Math.round(displayed.shape.y).toString()} />
              <SpecRow label="w" value={Math.round(displayed.shape.w).toString()} />
              <SpecRow label="h" value={Math.round(displayed.shape.h).toString()} />
            </div>
          </div>
        </>
      )}

      {/* ── Danger zone ── */}
      <div className="mx-4 rule" />
      <div className="px-3 py-2.5">
        <button
          onClick={() => {
            if (isConnection) {
              yjsConnections.delete(displayed.connection.id);
              dispatch(selectConnection(null));
            } else {
              const shapeId = displayed.shape.id;
              yjsShapes.doc!.transact(() => {
                yjsShapes.delete(shapeId);
                for (const c of Array.from(yjsConnections.values())) {
                  if (c.fromId === shapeId || c.toId === shapeId)
                    yjsConnections.delete(c.id);
                }
              });
              dispatch(selectShape(null));
            }
          }}
          className="group/del w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg
                     text-[12px] font-medium text-red-300/85
                     border border-transparent hover:border-red-400/30
                     hover:bg-red-500/10 hover:text-red-200
                     transition-all duration-150"
        >
          <span className="flex items-center gap-2">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80 group-hover/del:opacity-100"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Delete {isConnection ? "connector" : "shape"}
          </span>
          <span className="keycap opacity-70 group-hover/del:opacity-100 transition-opacity">
            ⌫
          </span>
        </button>
      </div>
    </div>
  );
};

export default CanvasRightPanel;
