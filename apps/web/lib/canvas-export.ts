import type Konva from "konva";
import type { Connection, Shape } from "@canvus/shared";

const PADDING = 40;
const PIXEL_RATIO = 2;
const JPEG_QUALITY = 0.92;
const WHITE_BG = "#ffffff";

interface Bbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const computeBbox = (shapes: Shape[]): Bbox | null => {
  if (shapes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const s of shapes) {
    if (s.x < minX) minX = s.x;
    if (s.y < minY) minY = s.y;
    if (s.x + s.w > maxX) maxX = s.x + s.w;
    if (s.y + s.h > maxY) maxY = s.y + s.h;
  }
  return {
    x: minX - PADDING,
    y: minY - PADDING,
    width: maxX - minX + PADDING * 2,
    height: maxY - minY + PADDING * 2,
  };
};

const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "canvas";

const triggerDownload = (href: string, filename: string): void => {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const withResetTransform = <T>(stage: Konva.Stage, fn: () => T): T => {
  const prev = {
    x: stage.x(),
    y: stage.y(),
    scaleX: stage.scaleX(),
    scaleY: stage.scaleY(),
  };
  stage.position({ x: 0, y: 0 });
  stage.scale({ x: 1, y: 1 });
  try {
    return fn();
  } finally {
    stage.position({ x: prev.x, y: prev.y });
    stage.scale({ x: prev.scaleX, y: prev.scaleY });
  }
};

export const exportJson = (
  name: string,
  shapes: Shape[],
  connections: Connection[],
): void => {
  const blob = new Blob(
    [JSON.stringify({ name, shapes, connections }, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `${slugify(name)}.json`);
  URL.revokeObjectURL(url);
};

export const exportPng = (
  stage: Konva.Stage,
  shapes: Shape[],
  name: string,
): boolean => {
  const bbox = computeBbox(shapes);
  if (!bbox) return false;
  const dataUrl = withResetTransform(stage, () =>
    stage.toDataURL({
      mimeType: "image/png",
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      pixelRatio: PIXEL_RATIO,
    }),
  );
  triggerDownload(dataUrl, `${slugify(name)}.png`);
  return true;
};

const toCompositedJpegDataUrl = (stage: Konva.Stage, bbox: Bbox): string => {
  const source = withResetTransform(stage, () =>
    stage.toCanvas({
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      pixelRatio: PIXEL_RATIO,
    }),
  ) as HTMLCanvasElement;
  const out = document.createElement("canvas");
  out.width = source.width;
  out.height = source.height;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.fillStyle = WHITE_BG;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(source, 0, 0);
  return out.toDataURL("image/jpeg", JPEG_QUALITY);
};

export const exportJpeg = (
  stage: Konva.Stage,
  shapes: Shape[],
  name: string,
): boolean => {
  const bbox = computeBbox(shapes);
  if (!bbox) return false;
  const dataUrl = toCompositedJpegDataUrl(stage, bbox);
  triggerDownload(dataUrl, `${slugify(name)}.jpg`);
  return true;
};

export const exportPdf = async (
  stage: Konva.Stage,
  shapes: Shape[],
  name: string,
): Promise<boolean> => {
  const bbox = computeBbox(shapes);
  if (!bbox) return false;
  const dataUrl = toCompositedJpegDataUrl(stage, bbox);
  const { jsPDF } = await import("jspdf");
  const orientation = bbox.width > bbox.height ? "l" : "p";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [bbox.width, bbox.height],
  });
  pdf.addImage(dataUrl, "JPEG", 0, 0, bbox.width, bbox.height);
  pdf.save(`${slugify(name)}.pdf`);
  return true;
};
