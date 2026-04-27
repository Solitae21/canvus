"use client";

import { Rect, Ellipse, Line, Text, Shape } from "react-konva";
import type { Shape as ShapeType } from "@/redux/slice/canvas/canvas-slice";
import {
  PENDING_HIGHLIGHT,
  STICKY_TEXT_FILL,
  TEXT_FILL,
} from "./canvas-defaults";

export interface CanvasShapeProps {
  shape: ShapeType;
  pendingArrow: boolean;
}

const CanvasShape = ({ shape, pendingArrow }: CanvasShapeProps) => {
  const stroke = pendingArrow ? PENDING_HIGHLIGHT : shape.strokeColor;
  const strokeWidth = pendingArrow ? 3 : 2;
  const { w, h, fill } = shape;

  if (shape.type === "oval" || shape.type === "circle") {
    return (
      <Ellipse
        x={w / 2}
        y={h / 2}
        radiusX={w / 2}
        radiusY={h / 2}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "diamond") {
    return (
      <Line
        x={0}
        y={0}
        points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "rounded-rect") {
    return (
      <Rect
        x={0}
        y={0}
        width={w}
        height={h}
        cornerRadius={Math.min(w, h) * 0.15}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "parallelogram") {
    const offset = w * 0.2;
    return (
      <Line
        x={0}
        y={0}
        points={[offset, 0, w, 0, w - offset, h, 0, h]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "trapezoid") {
    const offset = w * 0.15;
    return (
      <Line
        x={0}
        y={0}
        points={[0, 0, w, 0, w - offset, h, offset, h]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "hexagon") {
    const side = w * 0.25;
    return (
      <Line
        x={0}
        y={0}
        points={[side, 0, w - side, 0, w, h / 2, w - side, h, side, h, 0, h / 2]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "cylinder") {
    const rx = w / 2;
    const ry = h * 0.13;
    const k = 0.5523; // bezier approximation constant for ellipse
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          // Top cap (full ellipse via 4 bezier segments)
          ctx.beginPath();
          ctx.moveTo(0, ry);
          ctx.bezierCurveTo(0, ry - k * ry, rx - k * rx, 0, rx, 0);
          ctx.bezierCurveTo(rx + k * rx, 0, w, ry - k * ry, w, ry);
          ctx.bezierCurveTo(w, ry + k * ry, rx + k * rx, 2 * ry, rx, 2 * ry);
          ctx.bezierCurveTo(rx - k * rx, 2 * ry, 0, ry + k * ry, 0, ry);
          ctx.closePath();
          ctx.fillStrokeShape(s);
          // Body sides + bottom front arc
          ctx.beginPath();
          ctx.moveTo(0, ry);
          ctx.lineTo(0, h - ry);
          ctx.bezierCurveTo(0, h - ry + k * ry, rx - k * rx, h, rx, h);
          ctx.bezierCurveTo(rx + k * rx, h, w, h - ry + k * ry, w, h - ry);
          ctx.lineTo(w, ry);
          ctx.fillStrokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "document") {
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w, 0);
          ctx.lineTo(w, h * 0.82);
          ctx.bezierCurveTo(w * 0.75, h * 0.65, w * 0.25, h * 1.0, 0, h * 0.82);
          ctx.closePath();
          ctx.fillStrokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "predefined-process") {
    const lineX = w * 0.15;
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.rect(0, 0, w, h);
          ctx.fillStrokeShape(s);
          ctx.beginPath();
          ctx.moveTo(lineX, 0);
          ctx.lineTo(lineX, h);
          ctx.moveTo(w - lineX, 0);
          ctx.lineTo(w - lineX, h);
          ctx.strokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "manual-input") {
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.moveTo(0, h * 0.2);
          ctx.lineTo(w, 0);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStrokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "stored-data") {
    const indent = w * 0.15;
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w - indent, 0);
          (ctx as unknown as CanvasRenderingContext2D).quadraticCurveTo(w + indent * 0.5, h / 2, w - indent, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStrokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "internal-storage") {
    const hLine = h * 0.2;
    const vLine = w * 0.2;
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.rect(0, 0, w, h);
          ctx.fillStrokeShape(s);
          ctx.beginPath();
          ctx.moveTo(0, hLine);
          ctx.lineTo(w, hLine);
          ctx.moveTo(vLine, 0);
          ctx.lineTo(vLine, h);
          ctx.strokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  if (shape.type === "off-page") {
    return (
      <Line
        x={0}
        y={0}
        points={[0, 0, w, 0, w, h * 0.65, w / 2, h, 0, h * 0.65]}
        closed
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (shape.type === "delay") {
    const rx = Math.min(w * 0.3, h / 2);
    return (
      <Shape
        sceneFunc={(ctx, s) => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(w - rx, 0);
          (ctx as unknown as CanvasRenderingContext2D).arc(w - rx, h / 2, h / 2, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStrokeShape(s);
        }}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        width={w}
        height={h}
      />
    );
  }

  return (
    <Rect
      x={0}
      y={0}
      width={w}
      height={h}
      cornerRadius={shape.type === "sticky" ? 6 : 0}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
};

export const CanvasShapeLabel = ({ shape }: { shape: ShapeType }) => {
  const isSticky = shape.type === "sticky";
  return (
    <Text
      x={0}
      y={0}
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
