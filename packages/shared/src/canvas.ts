export type ShapeType =
  | 'rect' | 'rounded-rect' | 'diamond' | 'oval'
  | 'parallelogram' | 'trapezoid' | 'hexagon' | 'cylinder'
  | 'document' | 'predefined-process' | 'manual-input' | 'stored-data'
  | 'internal-storage' | 'circle' | 'off-page' | 'delay'
  | 'sticky';

export type PlaceableShapeType =
  | 'rect' | 'rounded-rect' | 'diamond' | 'oval'
  | 'parallelogram' | 'trapezoid' | 'hexagon' | 'cylinder'
  | 'document' | 'predefined-process' | 'manual-input' | 'stored-data'
  | 'internal-storage' | 'circle' | 'off-page' | 'delay'
  | 'sticky';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;
  strokeColor: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

export interface Canvas {
  id: string;
  name: string;
  shapes: Shape[];
  connections: Connection[];
  updatedAt: string;
}

export interface CanvasSummary {
  id: string;
  name: string;
  updatedAt: string;
}
