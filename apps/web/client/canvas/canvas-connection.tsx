"use client";

import { useRef } from "react";
import { Arrow, Circle, Group, Label, Tag, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Connection, Shape, ConnectionPort } from "@/redux/slice/canvas/canvas-slice";

const DEFAULT_CONNECTION_COLOR = "#ffffff";

export interface CanvasConnectionProps {
  connection: Connection;
  shapeMap: Map<string, Shape>;
  isSelected: boolean;
  editingLabel: boolean;
  draggingTipPos?: { x: number; y: number };
  onSelect: () => void;
  onDoubleClick: () => void;
  onTipDragMove: (pos: { x: number; y: number }) => void;
  onTipDragEnd: () => void;
}

function getPortPoint(shape: Shape, port: ConnectionPort): { x: number; y: number } {
  switch (port) {
    case "top":    return { x: shape.x + shape.w / 2, y: shape.y };
    case "right":  return { x: shape.x + shape.w,     y: shape.y + shape.h / 2 };
    case "bottom": return { x: shape.x + shape.w / 2, y: shape.y + shape.h };
    case "left":   return { x: shape.x,               y: shape.y + shape.h / 2 };
  }
}

const STUB = 24; // minimum straight run before the first bend

/**
 * Builds an array of [x, y, x, y, ...] waypoints for an orthogonal
 * (horizontal/vertical only) connector between two shapes.
 * Always picks the best port pair based on current relative positions —
 * stored ports are intentionally ignored so connectors re-route correctly
 * whenever shapes are moved.
 */
export function buildOrthogonalPoints(
  from: Shape,
  to: Shape,
): number[] {
  const fromCx = from.x + from.w / 2;
  const fromCy = from.y + from.h / 2;
  const toCx   = to.x   + to.w   / 2;
  const toCy   = to.y   + to.h   / 2;

  const dx = toCx - fromCx;
  const dy = toCy - fromCy;

  // Pick the face of each shape that points most directly toward the other
  let fromPort: ConnectionPort;
  let toPort: ConnectionPort;
  if (Math.abs(dx) >= Math.abs(dy)) {
    fromPort = dx >= 0 ? "right" : "left";
    toPort   = dx >= 0 ? "left"  : "right";
  } else {
    fromPort = dy >= 0 ? "bottom" : "top";
    toPort   = dy >= 0 ? "top"    : "bottom";
  }

  const fp = getPortPoint(from, fromPort);
  const tp = getPortPoint(to, toPort);

  if (fromPort === "right" || fromPort === "left") {
    if (Math.abs(fp.y - tp.y) < 1) {
      return [fp.x, fp.y, tp.x, tp.y];
    }
    const dir = fromPort === "right" ? 1 : -1;
    const elbowX = dir > 0
      ? Math.max(fp.x + STUB, (fp.x + tp.x) / 2)
      : Math.min(fp.x - STUB, (fp.x + tp.x) / 2);
    return [fp.x, fp.y, elbowX, fp.y, elbowX, tp.y, tp.x, tp.y];
  } else {
    if (Math.abs(fp.x - tp.x) < 1) {
      return [fp.x, fp.y, tp.x, tp.y];
    }
    const dir = fromPort === "bottom" ? 1 : -1;
    const elbowY = dir > 0
      ? Math.max(fp.y + STUB, (fp.y + tp.y) / 2)
      : Math.min(fp.y - STUB, (fp.y + tp.y) / 2);
    return [fp.x, fp.y, fp.x, elbowY, tp.x, elbowY, tp.x, tp.y];
  }
}

/**
 * Returns the world-space midpoint of an orthogonal polyline defined by
 * a flat [x, y, x, y, ...] array.
 */
export function getPathMidpoint(pts: number[]): { x: number; y: number } {
  const count = pts.length / 2;
  if (count < 2) return { x: pts[0] ?? 0, y: pts[1] ?? 0 };

  let totalLen = 0;
  for (let i = 0; i < count - 1; i++) {
    const ddx = pts[(i + 1) * 2] - pts[i * 2];
    const ddy = pts[(i + 1) * 2 + 1] - pts[i * 2 + 1];
    totalLen += Math.sqrt(ddx * ddx + ddy * ddy);
  }

  let half = totalLen / 2;
  for (let i = 0; i < count - 1; i++) {
    const x1 = pts[i * 2],       y1 = pts[i * 2 + 1];
    const x2 = pts[(i + 1) * 2], y2 = pts[(i + 1) * 2 + 1];
    const ddx = x2 - x1,         ddy = y2 - y1;
    const segLen = Math.sqrt(ddx * ddx + ddy * ddy);
    if (half <= segLen) {
      const t = half / segLen;
      return { x: x1 + ddx * t, y: y1 + ddy * t };
    }
    half -= segLen;
  }
  return { x: pts[pts.length - 2], y: pts[pts.length - 1] };
}

/**
 * Builds orthogonal waypoints from a shape to a free cursor position.
 * Used during connector tip drag to keep the line H/V-only.
 * Always auto-detects the best exit port based on current positions.
 */
function buildOrthogonalPointsToPos(
  from: Shape,
  targetX: number,
  targetY: number,
): number[] {
  const fromCx = from.x + from.w / 2;
  const fromCy = from.y + from.h / 2;

  const dx = targetX - fromCx;
  const dy = targetY - fromCy;
  const fromPort: ConnectionPort =
    Math.abs(dx) >= Math.abs(dy)
      ? (dx >= 0 ? "right" : "left")
      : (dy >= 0 ? "bottom" : "top");

  const fp = getPortPoint(from, fromPort);

  if (fromPort === "right" || fromPort === "left") {
    const dir = fromPort === "right" ? 1 : -1;
    if (Math.abs(fp.y - targetY) < 1) {
      return [fp.x, fp.y, targetX, targetY];
    }
    const elbowX = dir > 0
      ? Math.max(fp.x + STUB, (fp.x + targetX) / 2)
      : Math.min(fp.x - STUB, (fp.x + targetX) / 2);
    return [fp.x, fp.y, elbowX, fp.y, elbowX, targetY, targetX, targetY];
  } else {
    const dir = fromPort === "bottom" ? 1 : -1;
    if (Math.abs(fp.x - targetX) < 1) {
      return [fp.x, fp.y, targetX, targetY];
    }
    const elbowY = dir > 0
      ? Math.max(fp.y + STUB, (fp.y + targetY) / 2)
      : Math.min(fp.y - STUB, (fp.y + targetY) / 2);
    return [fp.x, fp.y, fp.x, elbowY, targetX, elbowY, targetX, targetY];
  }
}



const LABEL_WIDTH = 160;

const CanvasConnection = ({
  connection,
  shapeMap,
  isSelected,
  editingLabel,
  draggingTipPos,
  onSelect,
  onDoubleClick,
  onTipDragMove,
  onTipDragEnd,
}: CanvasConnectionProps) => {
  const from = shapeMap.get(connection.fromId);
  const to   = shapeMap.get(connection.toId);
  if (!from || !to) return null;

  const points = buildOrthogonalPoints(from, to);

  const tipX = points[points.length - 2];
  const tipY = points[points.length - 1];

  // During drag: orthogonal routing from source port to cursor (keeps H/V lines only)
  const activePoints = draggingTipPos
    ? buildOrthogonalPointsToPos(from, draggingTipPos.x, draggingTipPos.y)
    : points;

  // Label follows the midpoint of the active path (moves with the line during drag)
  const mid = getPathMidpoint(activePoints);
  const color = connection.color ?? DEFAULT_CONNECTION_COLOR;

  const tipCircleRef = useRef<Konva.Circle>(null);

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect();
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onDoubleClick();
  };

  const handleTipDragEnd = () => {
    tipCircleRef.current?.position({ x: tipX, y: tipY });
    onTipDragEnd();
  };

  return (
    <Group>
      <Arrow
        points={activePoints}
        stroke={isSelected ? "#60a5fa" : color}
        fill={isSelected ? "#60a5fa" : color}
        pointerLength={10}
        pointerWidth={10}
        strokeWidth={isSelected ? 3 : 2}
        hitStrokeWidth={20}
        onClick={handleClick}
        onDblClick={handleDblClick}
      />

      {isSelected && (
        <Circle
          ref={tipCircleRef}
          x={tipX}
          y={tipY}
          radius={6}
          fill="#60a5fa"
          stroke="#ffffff"
          strokeWidth={1.5}
          draggable
          onDragMove={(e: KonvaEventObject<DragEvent>) => {
            onTipDragMove(e.target.position());
          }}
          onDragEnd={handleTipDragEnd}
          onMouseEnter={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = "crosshair";
          }}
          onMouseLeave={(e) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = "";
          }}
          onClick={(e: KonvaEventObject<MouseEvent>) => { e.cancelBubble = true; }}
        />
      )}

      {connection.label && !editingLabel && (
        <Label x={mid.x} y={mid.y} offsetX={LABEL_WIDTH / 2} offsetY={10}>
          <Tag fill="#1a1625" cornerRadius={4} opacity={0.9} />
          <Text
            text={connection.label}
            fill="#ffffff"
            fontSize={12}
            padding={4}
            width={LABEL_WIDTH}
            align="center"
            listening={false}
          />
        </Label>
      )}
    </Group>
  );
};

export default CanvasConnection;
