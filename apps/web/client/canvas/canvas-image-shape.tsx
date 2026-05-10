"use client";

import { useEffect, useState } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import type { Shape } from "@/redux/slice/canvas/canvas-slice";
import { isSafeImageDataUrl } from "@/lib/canvas-security";

interface CanvasImageShapeProps {
  shape: Shape;
}

const CanvasImageShape = ({ shape }: CanvasImageShapeProps) => {
  const [loaded, setLoaded] = useState<{ src: string; image: HTMLImageElement } | null>(null);
  const img = loaded && loaded.src === shape.src && isSafeImageDataUrl(shape.src)
    ? loaded.image
    : null;

  useEffect(() => {
    if (!shape.src || !isSafeImageDataUrl(shape.src)) {
      return;
    }
    const src = shape.src;
    let cancelled = false;
    const el = new window.Image();
    el.referrerPolicy = "no-referrer";
    el.onload = () => {
      if (!cancelled) setLoaded({ src, image: el });
    };
    el.onerror = () => {
      if (!cancelled) setLoaded(null);
    };
    el.src = src;

    return () => {
      cancelled = true;
    };
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
