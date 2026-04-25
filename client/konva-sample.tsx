"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Line,
  Text,
  Arrow,
  Transformer,
} from "react-konva";
import Konva from "konva";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addShape,
  updateShape,
  selectShape,
  setTool,
  addConnection,
  setPendingFromId,
  type Shape,
  type ShapeType,
} from "@/redux/slice/canvas/canvas-slice";
import { setPanel } from "@/redux/slice/ui/ui-slice";
import { useCanvasKeyboard } from "@/client/canvas/use-canvas-keyboard";

type PlaceableShapeType = "rect" | "diamond" | "oval" | "sticky";
const PLACEABLE = new Set<ShapeType>(["rect", "diamond", "oval", "sticky"]);

const defaultsFor = (t: PlaceableShapeType) => {
  if (t === "sticky") {
    return { w: 180, h: 180, fill: "#FEF3C7", strokeColor: "#FCD34D", label: "" };
  }
  return { w: 140, h: 90, fill: "transparent", strokeColor: "#ffffff", label: "" };
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const KonvaCanvas = () => {
  useCanvasKeyboard();

  const dispatch = useAppDispatch();
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const connections = useAppSelector((s) => s.canvas.connections);
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const tool = useAppSelector((s) => s.canvas.tool);
  const pendingFromId = useAppSelector((s) => s.canvas.pendingFromId);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());
  const transformerRef = useRef<Konva.Transformer>(null);
  const editorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const updateSize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedId) {
      const node = shapeRefs.current.get(selectedId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedId, shapes]);

  useEffect(() => {
    if (editingId && editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
    }
  }, [editingId]);

  const shapeMap = useMemo(() => {
    const m = new Map<string, Shape>();
    for (const s of shapes) m.set(s.id, s);
    return m;
  }, [shapes]);

  const editingShape = editingId ? shapeMap.get(editingId) ?? null : null;

  const handleShapeClick = (
    shape: Shape,
    e: Konva.KonvaEventObject<MouseEvent>,
  ) => {
    e.cancelBubble = true;

    if (tool === "arrow") {
      if (pendingFromId == null) {
        dispatch(setPendingFromId(shape.id));
      } else if (pendingFromId !== shape.id) {
        dispatch(addConnection({ id: newId(), fromId: pendingFromId, toId: shape.id }));
        dispatch(setPendingFromId(null));
        dispatch(setTool("select"));
      }
      return;
    }

    if (tool === "select") {
      dispatch(selectShape(shape.id));
      dispatch(setPanel({ panel: "right", open: true }));
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    if (e.target !== stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (PLACEABLE.has(tool as ShapeType)) {
      const t = tool as PlaceableShapeType;
      const defs = defaultsFor(t);
      dispatch(
        addShape({
          id: newId(),
          type: t,
          x: pointer.x - defs.w / 2,
          y: pointer.y - defs.h / 2,
          w: defs.w,
          h: defs.h,
          label: defs.label,
          fill: defs.fill,
          strokeColor: defs.strokeColor,
        }),
      );
      dispatch(setTool("select"));
      return;
    }

    if (tool === "arrow") {
      if (pendingFromId) dispatch(setPendingFromId(null));
      return;
    }

    dispatch(selectShape(null));
    dispatch(setPanel({ panel: "right", open: false }));
  };

  const handleShapeDragEnd = (
    shape: Shape,
    e: Konva.KonvaEventObject<DragEvent>,
  ) => {
    const node = e.target;
    let x = node.x();
    let y = node.y();
    if (shape.type === "oval" || shape.type === "circle") {
      x -= shape.w / 2;
      y -= shape.h / 2;
    }
    dispatch(updateShape({ id: shape.id, x, y }));
  };

  const commitLabel = (value: string) => {
    if (editingId) {
      dispatch(updateShape({ id: editingId, label: value }));
      setEditingId(null);
    }
  };

  if (stageSize.width === 0 || stageSize.height === 0) return null;

  const draggable = tool === "select";

  return (
    <div className="relative w-full h-full">
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
      >
        <Layer>
          {connections.map((c) => {
            const from = shapeMap.get(c.fromId);
            const to = shapeMap.get(c.toId);
            if (!from || !to) return null;
            const fx = from.x + from.w / 2;
            const fy = from.y + from.h / 2;
            const tx = to.x + to.w / 2;
            const ty = to.y + to.h / 2;
            return (
              <Arrow
                key={c.id}
                points={[fx, fy, tx, ty]}
                stroke="#a855f7"
                fill="#a855f7"
                pointerLength={10}
                pointerWidth={10}
                strokeWidth={2}
                listening={false}
              />
            );
          })}

          {shapes.map((shape) => {
            const refCallback = (node: Konva.Shape | null) => {
              if (node) shapeRefs.current.set(shape.id, node);
              else shapeRefs.current.delete(shape.id);
            };

            const isPending = pendingFromId === shape.id;
            const stroke = isPending ? "#a855f7" : shape.strokeColor;
            const strokeWidth = isPending ? 3 : 2;

            const common = {
              draggable,
              onClick: (e: Konva.KonvaEventObject<MouseEvent>) =>
                handleShapeClick(shape, e),
              onDblClick: () => setEditingId(shape.id),
              onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                handleShapeDragEnd(shape, e),
            };

            if (shape.type === "oval" || shape.type === "circle") {
              return (
                <Ellipse
                  key={shape.id}
                  ref={refCallback}
                  x={shape.x + shape.w / 2}
                  y={shape.y + shape.h / 2}
                  radiusX={shape.w / 2}
                  radiusY={shape.h / 2}
                  fill={shape.fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  {...common}
                />
              );
            }

            if (shape.type === "diamond") {
              return (
                <Line
                  key={shape.id}
                  ref={refCallback}
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
                  {...common}
                />
              );
            }

            const cornerRadius = shape.type === "sticky" ? 6 : 0;
            return (
              <Rect
                key={shape.id}
                ref={refCallback}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                cornerRadius={cornerRadius}
                fill={shape.fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                {...common}
              />
            );
          })}

          {shapes.map((shape) => {
            if (editingId === shape.id) return null;
            const isSticky = shape.type === "sticky";
            return (
              <Text
                key={`label-${shape.id}`}
                x={shape.x}
                y={shape.y}
                width={shape.w}
                height={shape.h}
                text={shape.label}
                align={isSticky ? "left" : "center"}
                verticalAlign="middle"
                wrap="word"
                padding={isSticky ? 12 : 4}
                fill={isSticky ? "#1f2937" : "#ffffff"}
                fontSize={14}
                listening={false}
              />
            );
          })}

          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>

      {editingShape &&
        (editingShape.type === "sticky" ? (
          <textarea
            key={editingShape.id}
            ref={(el) => {
              editorRef.current = el;
            }}
            defaultValue={editingShape.label}
            onBlur={(e) => commitLabel(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setEditingId(null);
              }
            }}
            className="absolute resize-none rounded p-3 text-sm leading-snug outline-none ring-2 ring-blue-400"
            style={{
              left: editingShape.x,
              top: editingShape.y,
              width: editingShape.w,
              height: editingShape.h,
              background: editingShape.fill,
              color: "#1f2937",
            }}
          />
        ) : (
          <input
            key={editingShape.id}
            ref={(el) => {
              editorRef.current = el;
            }}
            defaultValue={editingShape.label}
            onBlur={(e) => commitLabel(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLInputElement).blur();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setEditingId(null);
              }
            }}
            className="absolute text-center text-sm outline-none ring-2 ring-blue-400 rounded bg-transparent"
            style={{
              left: editingShape.x,
              top: editingShape.y,
              width: editingShape.w,
              height: editingShape.h,
              color: "#ffffff",
            }}
          />
        ))}
    </div>
  );
};

export default KonvaCanvas;
