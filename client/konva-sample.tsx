"use client";

import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Ellipse, Transformer } from "react-konva";
import Konva from "konva";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectShape } from "@/redux/slice/canvas/canvas-slice";

const KonvaCanvas = () => {
  const dispatch = useAppDispatch();
  const shapes = useAppSelector((s) => s.canvas.shapes);
  const selectedId = useAppSelector((s) => s.canvas.selectedId);
  const tool = useAppSelector((s) => s.canvas.tool);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const shapeRefs = useRef<Map<string, Konva.Shape>>(new Map());
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const updateSize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Attach / detach Transformer whenever selectedId changes
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    if (selectedId) {
      const node = shapeRefs.current.get(selectedId);
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
      }
    } else {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleShapeClick = (id: string) => {
    if (tool === "select") dispatch(selectShape(id));
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty canvas (not on a shape)
    if (e.target === e.target.getStage()) dispatch(selectShape(null));
  };

  if (stageSize.width === 0 || stageSize.height === 0) return null;

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      onClick={handleStageClick}
    >
      <Layer>
        {shapes.map((shape) => {
          const refCallback = (node: Konva.Shape | null) => {
            if (node) shapeRefs.current.set(shape.id, node);
            else shapeRefs.current.delete(shape.id);
          };

          if (shape.type === "oval") {
            return (
              <Ellipse
                key={shape.id}
                ref={refCallback}
                x={shape.x + shape.w / 2}
                y={shape.y + shape.h / 2}
                radiusX={shape.w / 2}
                radiusY={shape.h / 2}
                fill="transparent"
                stroke="#ffffff"
                strokeWidth={2}
                draggable={tool === "select"}
                onClick={() => handleShapeClick(shape.id)}
              />
            );
          }

          return (
            <Rect
              key={shape.id}
              ref={refCallback}
              x={shape.x}
              y={shape.y}
              width={shape.w}
              height={shape.h}
              fill="transparent"
              stroke="#ffffff"
              strokeWidth={2}
              draggable={tool === "select"}
              onClick={() => handleShapeClick(shape.id)}
            />
          );
        })}
        <Transformer ref={transformerRef} />
      </Layer>
    </Stage>
  );
};

export default KonvaCanvas;
