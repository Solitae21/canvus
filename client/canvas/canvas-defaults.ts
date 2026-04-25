import type { Shape, ShapeType } from "@/redux/slice/canvas/canvas-slice";

export type PlaceableShapeType = "rect" | "diamond" | "oval" | "sticky";

export const PLACEABLE_TYPES: ReadonlySet<ShapeType> = new Set<ShapeType>([
  "rect",
  "diamond",
  "oval",
  "sticky",
]);

export const STICKY_FILL = "#FEF3C7";
export const STICKY_STROKE = "#FCD34D";
export const DEFAULT_STROKE = "#ffffff";
export const TEXT_FILL = "#ffffff";
export const STICKY_TEXT_FILL = "#1f2937";
export const ARROW_COLOR = "#a855f7";
export const PENDING_HIGHLIGHT = "#a855f7";

export const GRID_SIZE = 24;
export const GRID_OFFSET = 12;

export const isPlaceable = (tool: string): tool is PlaceableShapeType =>
  PLACEABLE_TYPES.has(tool as ShapeType);

type ShapeDefaults = Pick<Shape, "w" | "h" | "fill" | "strokeColor" | "label">;

export const defaultsFor = (type: PlaceableShapeType): ShapeDefaults => {
  if (type === "sticky") {
    return {
      w: 180,
      h: 180,
      fill: STICKY_FILL,
      strokeColor: STICKY_STROKE,
      label: "",
    };
  }
  return {
    w: 140,
    h: 90,
    fill: "transparent",
    strokeColor: DEFAULT_STROKE,
    label: "",
  };
};

export const newId = (): string =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
