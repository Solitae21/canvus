"use client";

import { useRef, useState } from "react";
import { Group, Circle, Line } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";
import type { ConnectionPort } from "@/redux/slice/canvas/canvas-slice";
import { ARROW_COLOR } from "./canvas-defaults";

export interface CanvasShapeConnectorsProps {
  shape: Shape;
  onPortClick: (port: ConnectionPort) => void;
  onPortDragStart: (port: ConnectionPort, pos: { x: number; y: number }) => void;
  onPortDragMove: (port: ConnectionPort, pos: { x: number; y: number }) => void;
  onPortDragEnd: (port: ConnectionPort, pos: { x: number; y: number }) => void;
}

const PORT_RADIUS = 8;
const PORT_PLUS_HALF = 4;
const PORT_HIT_RADIUS = 12;
const PORT_FILL_NORMAL = "#1a1625";
const PORT_FILL_HOVER = "#2d2547";

interface PortButtonProps {
  x: number;
  y: number;
  onPortClick: () => void;
  onDragStart: (pos: { x: number; y: number }) => void;
  onDragMove: (pos: { x: number; y: number }) => void;
  onDragEnd: (pos: { x: number; y: number }) => void;
}

const getPointerPosition = (
  e: KonvaEventObject<DragEvent>,
): { x: number; y: number } | null => e.target.getStage()?.getRelativePointerPosition() ?? null;

const PortButton = ({
  x,
  y,
  onPortClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: PortButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const draggedRef = useRef(false);

  return (
    <Group x={x} y={y}>
      <Circle
        radius={PORT_RADIUS}
        fill={hovered ? PORT_FILL_HOVER : PORT_FILL_NORMAL}
        stroke={ARROW_COLOR}
        strokeWidth={1.5}
        listening={false}
      />
      <Line
        points={[-PORT_PLUS_HALF, 0, PORT_PLUS_HALF, 0]}
        stroke={ARROW_COLOR}
        strokeWidth={1.5}
        listening={false}
      />
      <Line
        points={[0, -PORT_PLUS_HALF, 0, PORT_PLUS_HALF]}
        stroke={ARROW_COLOR}
        strokeWidth={1.5}
        listening={false}
      />
      <Circle
        radius={PORT_HIT_RADIUS}
        fill="transparent"
        draggable
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDragStart={(e) => {
          e.cancelBubble = true;
          draggedRef.current = false;
          const pos = getPointerPosition(e);
          if (pos) onDragStart(pos);
        }}
        onDragMove={(e) => {
          e.cancelBubble = true;
          draggedRef.current = true;
          const pos = getPointerPosition(e);
          if (pos) onDragMove(pos);
        }}
        onDragEnd={(e) => {
          e.cancelBubble = true;
          const pos = getPointerPosition(e);
          e.target.position({ x: 0, y: 0 });
          if (pos) onDragEnd(pos);
        }}
        onClick={(e) => {
          e.cancelBubble = true;
          if (draggedRef.current) {
            draggedRef.current = false;
            return;
          }
          onPortClick();
        }}
      />
    </Group>
  );
};

const PORTS: Array<{
  port: ConnectionPort;
  x: (w: number, h: number) => number;
  y: (w: number, h: number) => number;
}> = [
  { port: "top",    x: (w) => w / 2, y: () => 0       },
  { port: "right",  x: (w) => w,     y: (_, h) => h / 2 },
  { port: "bottom", x: (w) => w / 2, y: (_, h) => h   },
  { port: "left",   x: () => 0,      y: (_, h) => h / 2 },
];

const CanvasShapeConnectors = ({
  shape,
  onPortClick,
  onPortDragStart,
  onPortDragMove,
  onPortDragEnd,
}: CanvasShapeConnectorsProps) => (
  <>
    {PORTS.map(({ port, x, y }) => (
      <PortButton
        key={port}
        x={x(shape.w, shape.h)}
        y={y(shape.w, shape.h)}
        onPortClick={() => onPortClick(port)}
        onDragStart={(pos) => onPortDragStart(port, pos)}
        onDragMove={(pos) => onPortDragMove(port, pos)}
        onDragEnd={(pos) => onPortDragEnd(port, pos)}
      />
    ))}
  </>
);

export default CanvasShapeConnectors;
