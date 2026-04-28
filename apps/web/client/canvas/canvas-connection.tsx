"use client";

import { Arrow } from "react-konva";
import type { Connection, Shape, ConnectionPort } from "@/redux/slice/canvas/canvas-slice";
import { ARROW_COLOR } from "./canvas-defaults";

export interface CanvasConnectionProps {
  connection: Connection;
  shapeMap: Map<string, Shape>;
}

function getPortPoint(shape: Shape, port: ConnectionPort): { x: number; y: number } {
  switch (port) {
    case "top":    return { x: shape.x + shape.w / 2, y: shape.y };
    case "right":  return { x: shape.x + shape.w,     y: shape.y + shape.h / 2 };
    case "bottom": return { x: shape.x + shape.w / 2, y: shape.y + shape.h };
    case "left":   return { x: shape.x,               y: shape.y + shape.h / 2 };
  }
}

/**
 * Returns the point on the shape border where a ray from the shape's center
 * toward (fromX, fromY) exits — used to clip arrowheads to the shape edge.
 */
function getShapeEdgePoint(
  shape: Shape,
  fromX: number,
  fromY: number,
): { x: number; y: number } {
  const cx = shape.x + shape.w / 2;
  const cy = shape.y + shape.h / 2;
  const { x: sx, y: sy, w, h } = shape;

  let dx = fromX - cx;
  let dy = fromY - cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.001) return { x: cx, y: cy };
  dx /= len;
  dy /= len;

  // Ellipse
  if (shape.type === "oval" || shape.type === "circle") {
    const rx = w / 2;
    const ry = h / 2;
    const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2);
    return { x: cx + dx * t, y: cy + dy * t };
  }

  // Diamond: intersect ray against each of the 4 edge segments
  if (shape.type === "diamond") {
    const segs: [number, number, number, number][] = [
      [cx,     sy,     sx + w, cy    ],
      [sx + w, cy,     cx,     sy + h],
      [cx,     sy + h, sx,     cy    ],
      [sx,     cy,     cx,     sy    ],
    ];
    for (const [x1, y1, x2, y2] of segs) {
      const ex = x2 - x1;
      const ey = y2 - y1;
      const det = ex * dy - ey * dx;
      if (Math.abs(det) < 0.0001) continue;
      const t = ((y1 - cy) * ex - (x1 - cx) * ey) / det;
      const s = (dx * (y1 - cy) - dy * (x1 - cx)) / det;
      if (t > -0.001 && s >= -0.001 && s <= 1.001) {
        return { x: cx + dx * t, y: cy + dy * t };
      }
    }
  }

  // Bounding-box fallback
  const hw = w / 2;
  const hh = h / 2;
  const tx = dx > 0 ? hw / dx : dx < 0 ? hw / -dx : Infinity;
  const ty = dy > 0 ? hh / dy : dy < 0 ? hh / -dy : Infinity;
  return { x: cx + dx * Math.min(tx, ty), y: cy + dy * Math.min(tx, ty) };
}

const STUB = 24; // minimum straight run before the first bend

/**
 * Builds an array of [x, y, x, y, ...] waypoints for an orthogonal
 * (horizontal/vertical only) connector between two shapes.
 */
function buildOrthogonalPoints(
  from: Shape,
  to: Shape,
  fromPort?: ConnectionPort,
  toPort?: ConnectionPort,
): number[] {
  const fromCx = from.x + from.w / 2;
  const fromCy = from.y + from.h / 2;
  const toCx   = to.x   + to.w   / 2;
  const toCy   = to.y   + to.h   / 2;

  // Auto-detect exit port when none is set
  const dx = toCx - fromCx;
  const dy = toCy - fromCy;
  const resolvedFromPort: ConnectionPort = fromPort ?? (
    Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? "right" : "left")
      : (dy >= 0 ? "bottom" : "top")
  );

  // Source point is always the port midpoint on the shape edge
  const fp = getPortPoint(from, resolvedFromPort);

  // ── Build waypoints ending at the target centre ──────────────────────────
  let pts: number[];

  if (resolvedFromPort === "right" || resolvedFromPort === "left") {
    const dir = resolvedFromPort === "right" ? 1 : -1;

    if (Math.abs(fp.y - toCy) < 1) {
      // Same horizontal row → straight line
      pts = [fp.x, fp.y, toCx, toCy];
    } else {
      // Horizontal stub → vertical run → horizontal run to centre
      const elbowX = dir > 0
        ? Math.max(fp.x + STUB, (fp.x + toCx) / 2)
        : Math.min(fp.x - STUB, (fp.x + toCx) / 2);
      pts = [fp.x, fp.y, elbowX, fp.y, elbowX, toCy, toCx, toCy];
    }
  } else {
    // top / bottom
    const dir = resolvedFromPort === "bottom" ? 1 : -1;

    if (Math.abs(fp.x - toCx) < 1) {
      // Same vertical column → straight line
      pts = [fp.x, fp.y, toCx, toCy];
    } else {
      // Vertical stub → horizontal run → vertical run to centre
      const elbowY = dir > 0
        ? Math.max(fp.y + STUB, (fp.y + toCy) / 2)
        : Math.min(fp.y - STUB, (fp.y + toCy) / 2);
      pts = [fp.x, fp.y, fp.x, elbowY, toCx, elbowY, toCx, toCy];
    }
  }

  // ── Clip the last point to the target shape's actual border ───────────────
  // Determine approach direction from the penultimate waypoint
  const n = pts.length;
  const approachX = pts[n - 4];
  const approachY = pts[n - 3];
  const FAR = 1e6;
  const isHorizApproach = Math.abs(approachY - toCy) < 1;

  let clippedTo: { x: number; y: number };
  if (toPort) {
    clippedTo = getPortPoint(to, toPort);
  } else {
    const clipFromX = isHorizApproach
      ? (approachX < toCx ? toCx - FAR : toCx + FAR)
      : approachX;
    const clipFromY = isHorizApproach
      ? approachY
      : (approachY < toCy ? toCy - FAR : toCy + FAR);
    clippedTo = getShapeEdgePoint(to, clipFromX, clipFromY);
  }

  pts[n - 2] = clippedTo.x;
  pts[n - 1] = clippedTo.y;

  return pts;
}

const CanvasConnection = ({ connection, shapeMap }: CanvasConnectionProps) => {
  const from = shapeMap.get(connection.fromId);
  const to   = shapeMap.get(connection.toId);
  if (!from || !to) return null;

  const points = buildOrthogonalPoints(
    from, to,
    connection.fromPort,
    connection.toPort,
  );

  return (
    <Arrow
      points={points}
      stroke={ARROW_COLOR}
      fill={ARROW_COLOR}
      pointerLength={10}
      pointerWidth={10}
      strokeWidth={2}
      listening={false}
    />
  );
};

export default CanvasConnection;
