"use client";

import { useState } from "react";
import { Group, Circle, Line } from "react-konva";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";
import type { ConnectionPort } from "@/redux/slice/canvas/canvas-slice";
import { ARROW_COLOR } from "./canvas-defaults";

export interface CanvasShapeConnectorsProps {
  shape: Shape;
  onPortClick: (port: ConnectionPort) => void;
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
}

const PortButton = ({ x, y, onPortClick }: PortButtonProps) => {
  const [hovered, setHovered] = useState(false);
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
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => {
          e.cancelBubble = true;
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

const CanvasShapeConnectors = ({ shape, onPortClick }: CanvasShapeConnectorsProps) => (
  <>
    {PORTS.map(({ port, x, y }) => (
      <PortButton
        key={port}
        x={x(shape.w, shape.h)}
        y={y(shape.w, shape.h)}
        onPortClick={() => onPortClick(port)}
      />
    ))}
  </>
);

export default CanvasShapeConnectors;
