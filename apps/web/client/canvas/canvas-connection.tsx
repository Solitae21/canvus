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

const CanvasConnection = ({ connection, shapeMap }: CanvasConnectionProps) => {
  const from = shapeMap.get(connection.fromId);
  const to = shapeMap.get(connection.toId);
  if (!from || !to) return null;

  const fromPt = connection.fromPort
    ? getPortPoint(from, connection.fromPort)
    : { x: from.x + from.w / 2, y: from.y + from.h / 2 };

  const toPt = connection.toPort
    ? getPortPoint(to, connection.toPort)
    : { x: to.x + to.w / 2, y: to.y + to.h / 2 };

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
