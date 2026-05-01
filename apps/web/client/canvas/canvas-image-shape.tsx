"use client";

import { useEffect, useState } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";

interface CanvasImageShapeProps {
  shape: Shape;
}

const CanvasImageShape = ({ shape }: CanvasImageShapeProps) => {
  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!shape.src) return;
    const el = new window.Image();
    el.onload = () => setImg(el);
    el.src = shape.src;
  }, [shape.src]);

  if (img) {
    return <KonvaImage image={img} width={shape.w} height={shape.h} />;
  }

  return (
    <Rect
      width={shape.w}
      height={shape.h}
      fill="rgba(255,255,255,0.05)"
      stroke="#555"
      strokeWidth={1}
      dash={[6, 4]}
    />
  );
};

export default CanvasImageShape;
