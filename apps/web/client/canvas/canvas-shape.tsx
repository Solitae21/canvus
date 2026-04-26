"use client";

import { Rect, Ellipse, Line, Text } from "react-konva";
import type Konva from "konva";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";
import {
  PENDING_HIGHLIGHT,
  STICKY_TEXT_FILL,
  TEXT_FILL,
} from "./canvas-defaults";

export interface CanvasShapeProps {
  shape: Shape;
  pendingArrow: boolean;
  draggable: boolean;
  nodeRef: (node: Konva.Shape | null) => void;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const CanvasShape = ({
  shape,
  pendingArrow,
  draggable,
  nodeRef,
  onClick,
  onDblClick,
  onDragEnd,
}: CanvasShapeProps) => {
  const stroke = pendingArrow ? PENDING_HIGHLIGHT : shape.strokeColor;
  const strokeWidth = pendingArrow ? 3 : 2;
  const handlers = { draggable, onClick, onDblClick, onDragEnd };

  if (shape.type === "oval" || shape.type === "circle") {
    return (
      <Ellipse
        ref={nodeRef}
        x={shape.x + shape.w / 2}
        y={shape.y + shape.h / 2}
        radiusX={shape.w / 2}
        radiusY={shape.h / 2}
        fill={shape.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...handlers}
      />
    );
  }

  if (shape.type === "diamond") {
    return (
      <Line
        ref={nodeRef}
        x={shape.x}
        y={shape.y}
        points={[
          shape.w / 2, 0,
          shape.w, shape.h / 2,
          shape.w / 2, shape.h,
          0, shape.h / 2,
        ]}
        closed
        fill={shape.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        {...handlers}
      />
    );
  }

  return (
    <Rect
      ref={nodeRef}
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      cornerRadius={shape.type === "sticky" ? 6 : 0}
      fill={shape.fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      {...handlers}
    />
  );
};

export const CanvasShapeLabel = ({ shape }: { shape: Shape }) => {
  const isSticky = shape.type === "sticky";
  return (
    <Text
      x={shape.x}
      y={shape.y}
      width={shape.w}
      height={shape.h}
      text={shape.label}
      align={isSticky ? "left" : "center"}
      verticalAlign="middle"
      wrap="word"
      padding={isSticky ? 12 : 4}
      fill={isSticky ? STICKY_TEXT_FILL : TEXT_FILL}
      fontSize={14}
      listening={false}
    />
  );
};

export default CanvasShape;
