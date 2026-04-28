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
 * Returns the point on a shape's border where a line from (fromX, fromY) to
 * the shape's center would exit the shape. Used to prevent arrowheads from
 * being hidden inside shapes.
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

  // Diamond: intersect ray with each of its 4 edge segments
  if (shape.type === "diamond") {
    const segments: [number, number, number, number][] = [
      [cx,      sy,      sx + w,  cy    ],
      [sx + w,  cy,      cx,      sy + h],
      [cx,      sy + h,  sx,      cy    ],
      [sx,      cy,      cx,      sy    ],
    ];
    for (const [x1, y1, x2, y2] of segments) {
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

  // Bounding box fallback (covers rect, rounded-rect, and all other shapes)
  const hw = w / 2;
  const hh = h / 2;
  const tx = dx > 0 ? hw / dx : dx < 0 ? hw / -dx : Infinity;
  const ty = dy > 0 ? hh / dy : dy < 0 ? hh / -dy : Infinity;
  const t = Math.min(tx, ty);
  return { x: cx + dx * t, y: cy + dy * t };
}

const CanvasConnection = ({ connection, shapeMap }: CanvasConnectionProps) => {
  const from = shapeMap.get(connection.fromId);
  const to   = shapeMap.get(connection.toId);
  if (!from || !to) return null;

  const toCx  = to.x  + to.w  / 2;
  const toCy  = to.y  + to.h  / 2;

  const fromPt = connection.fromPort
    ? getPortPoint(from, connection.fromPort)
    : getShapeEdgePoint(from, toCx, toCy);

  const toPt = connection.toPort
    ? getPortPoint(to, connection.toPort)
    : getShapeEdgePoint(to, fromPt.x, fromPt.y);

  return (
    <Arrow
      points={[fromPt.x, fromPt.y, toPt.x, toPt.y]}
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
