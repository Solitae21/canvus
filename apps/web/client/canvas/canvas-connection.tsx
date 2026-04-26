"use client";

import { Arrow } from "react-konva";
import type { Connection, Shape } from "@/redux/slice/canvas/canvas-slice";
import { ARROW_COLOR } from "./canvas-defaults";

export interface CanvasConnectionProps {
  connection: Connection;
  shapeMap: Map<string, Shape>;
}

const CanvasConnection = ({ connection, shapeMap }: CanvasConnectionProps) => {
  const from = shapeMap.get(connection.fromId);
  const to = shapeMap.get(connection.toId);
  if (!from || !to) return null;

  const fx = from.x + from.w / 2;
  const fy = from.y + from.h / 2;
  const tx = to.x + to.w / 2;
  const ty = to.y + to.h / 2;

  return (
    <Arrow
      points={[fx, fy, tx, ty]}
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
