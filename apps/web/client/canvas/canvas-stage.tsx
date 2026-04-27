"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Transformer, Group } from "react-konva";
import type Konva from "konva";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  addShape,
  updateShape,
  selectShape,
  setTool,
  addConnection,
  setPendingFromId,
  type Shape,
} from "@/redux/slice/canvas/canvas-slice";
import { setPanel, setViewport } from "@/redux/slice/ui/ui-slice";

import { useCanvasKeyboard } from "./use-canvas-keyboard";
import {
  defaultsFor,
  isPlaceable,
  newId,
  GRID_OFFSET,
  GRID_SIZE,
  type PlaceableShapeType,
} from "./canvas-defaults";
import CanvasShape, { CanvasShapeLabel } from "./canvas-shape";
import CanvasConnection from "./canvas-connection";
import CanvasLabelEditor from "./canvas-label-editor";

export interface CanvasStageProps {
  className?: string;
}

const CanvasStage = ({ className }: CanvasStageProps) => {
  useCanvasKeyboard();

  const dispatch = useAppDispatch();
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const connections = useAppSelector((s) => s.canvas.connections);
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const tool = useAppSelector((s) => s.canvas.tool);
  const pendingFromId = useAppSelector((s) => s.canvas.pendingFromId);
  const viewport = useAppSelector((s) => s.ui.viewport);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const shapeRefs = useRef<Map<string, Konva.Group>>(new Map());
  const transformerRef = useRef<Konva.Transformer>(null);
  const prevScaleRef = useRef(viewport.scale);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  // Size the Stage to its container — works in fullscreen pages, sidebars, modals, etc.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () =>
      setStageSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // When scale changes (via header zoom buttons), keep the screen-center stable
  // by adjusting viewport translation around the previous scale.
  useEffect(() => {
    const prev = prevScaleRef.current;
    const next = viewport.scale;
    if (prev === next) return;
    if (stageSize.width === 0 || stageSize.height === 0) {
      prevScaleRef.current = next;
      return;
    }
    const { x: px, y: py } = viewportRef.current;
    const cx = stageSize.width / 2;
    const cy = stageSize.height / 2;
    const worldX = (cx - px) / prev;
    const worldY = (cy - py) / prev;
    prevScaleRef.current = next;
    dispatch(
      setViewport({
        x: cx - worldX * next,
        y: cy - worldY * next,
        scale: next,
      }),
    );
  }, [viewport.scale, stageSize.width, stageSize.height, dispatch]);

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

  const shapeMap = useMemo(() => {
    const m = new Map<string, Shape>();
    for (const s of shapes) m.set(s.id, s);
    return m;
  }, [shapes]);

  const editingShape = editingId ? shapeMap.get(editingId) ?? null : null;

  const placeShape = (type: PlaceableShapeType, x: number, y: number) => {
    const defs = defaultsFor(type);
    dispatch(
      addShape({
        id: newId(),
        type,
        x: x - defs.w / 2,
        y: y - defs.h / 2,
        w: defs.w,
        h: defs.h,
        label: defs.label,
        fill: defs.fill,
        strokeColor: defs.strokeColor,
      }),
    );
    dispatch(setTool("select"));
  };

  const handleShapeClick = (
    shape: Shape,
    e: Konva.KonvaEventObject<MouseEvent>,
  ) => {
    e.cancelBubble = true;
    if (tool === "hand") return;

    if (tool === "arrow") {
      if (pendingFromId == null) {
        dispatch(setPendingFromId(shape.id));
      } else if (pendingFromId !== shape.id) {
        dispatch(
          addConnection({
            id: newId(),
            fromId: pendingFromId,
            toId: shape.id,
          }),
        );
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
    if (!stage || e.target !== stage) return;
    if (tool === "hand") return;

    const pointer = stage.getRelativePointerPosition();
    if (!pointer) return;

    if (isPlaceable(tool)) {
      placeShape(tool, pointer.x, pointer.y);
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
    dispatch(updateShape({ id: shape.id, x: node.x(), y: node.y() }));
  };

  const handleStageDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (tool !== "hand") return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    if (wrapperRef.current) {
      const off = GRID_OFFSET * viewport.scale;
      wrapperRef.current.style.backgroundPosition = `${stage.x() + off}px ${stage.y() + off}px`;
    }
  };

  const handleStageDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (tool !== "hand") return;
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    dispatch(
      setViewport({
        x: stage.x(),
        y: stage.y(),
        scale: viewport.scale,
      }),
    );
  };

  const commitLabel = (value: string) => {
    if (editingId) {
      dispatch(updateShape({ id: editingId, label: value }));
      setEditingId(null);
    }
  };

  const draggableShapes = tool === "select";

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full ${className ?? ""}`.trim()}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE * viewport.scale}px ${GRID_SIZE * viewport.scale}px`,
        backgroundPosition: `${viewport.x + GRID_OFFSET * viewport.scale}px ${viewport.y + GRID_OFFSET * viewport.scale}px`,
        cursor: tool === "hand" ? "grab" : "default",
      }}
    >
      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          x={viewport.x}
          y={viewport.y}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          draggable={tool === "hand"}
          onClick={handleStageClick}
          onDragMove={handleStageDragMove}
          onDragEnd={handleStageDragEnd}
        >
          <Layer>
            {connections.map((c) => (
              <CanvasConnection
                key={c.id}
                connection={c}
                shapeMap={shapeMap}
              />
            ))}

            {shapes.map((shape) => (
              <Group
                key={shape.id}
                ref={(node) => {
                  if (node) shapeRefs.current.set(shape.id, node);
                  else shapeRefs.current.delete(shape.id);
                }}
                x={shape.x}
                y={shape.y}
                draggable={draggableShapes}
                onClick={(e) => handleShapeClick(shape, e)}
                onDblClick={() => setEditingId(shape.id)}
                onDragEnd={(e) => handleShapeDragEnd(shape, e)}
              >
                <CanvasShape
                  shape={shape}
                  pendingArrow={pendingFromId === shape.id}
                />
                {editingId !== shape.id && (
                  <CanvasShapeLabel shape={shape} />
                )}
              </Group>
            ))}

            <Transformer ref={transformerRef} />
          </Layer>
        </Stage>
      )}

      {editingShape && (
        <CanvasLabelEditor
          key={editingShape.id}
          shape={editingShape}
          offsetX={viewport.x}
          offsetY={viewport.y}
          scale={viewport.scale}
          onCommit={commitLabel}
          onCancel={() => setEditingId(null)}
        />
      )}
    </div>
  );
};

export default CanvasStage;
