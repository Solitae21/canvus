import type { Connection, ConnectionPort, Shape, ShapeType } from '@canvus/shared';

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; detail: string };

const SHAPE_TYPES = new Set<ShapeType>([
  'rect',
  'rounded-rect',
  'diamond',
  'oval',
  'parallelogram',
  'trapezoid',
  'hexagon',
  'cylinder',
  'document',
  'predefined-process',
  'manual-input',
  'stored-data',
  'internal-storage',
  'circle',
  'off-page',
  'delay',
  'sticky',
  'image',
]);

const CONNECTION_PORTS = new Set<ConnectionPort>(['top', 'right', 'bottom', 'left']);
const SAFE_COLOR_RE = /^(transparent|#[0-9a-fA-F]{3,8})$/;
const SAFE_IMAGE_DATA_URL_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/;
const SAFE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const CONTROL_CHARS_RE = /[\x00-\x1F\x7F]/g;
const LABEL_CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const MAX_CANVAS_NAME_LENGTH = 120;
export const MAX_LABEL_LENGTH = 2000;
export const MAX_PRESENCE_NAME_LENGTH = 80;
export const MAX_SHAPES = 1000;
export const MAX_CONNECTIONS = 2000;
export const MAX_IMAGE_SRC_LENGTH = 3_000_000;
const MAX_COORDINATE = 1_000_000;
const MAX_SIZE = 10_000;

export const isValidIdentifier = (value: unknown): value is string =>
  typeof value === 'string' && SAFE_ID_RE.test(value);

export const normalizeText = (value: string, maxLength: number): string =>
  value.replace(CONTROL_CHARS_RE, '').trim().slice(0, maxLength);

export const normalizeCanvasName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = normalizeText(value, MAX_CANVAS_NAME_LENGTH);
  return normalized.length > 0 ? normalized : undefined;
};

export const normalizeLabel = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(LABEL_CONTROL_CHARS_RE, '').trim().slice(0, MAX_LABEL_LENGTH);
};

export const normalizePresenceName = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = normalizeText(value, MAX_PRESENCE_NAME_LENGTH);
  return normalized.length > 0 ? normalized : undefined;
};

export const isSafeColor = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 32 && SAFE_COLOR_RE.test(value);

export const isSafeImageDataUrl = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= MAX_IMAGE_SRC_LENGTH &&
  SAFE_IMAGE_DATA_URL_RE.test(value);

const isFiniteNumberInRange = (value: unknown, maxAbs: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= maxAbs;

const isPositiveFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= MAX_SIZE;

const normalizePort = (value: unknown): ConnectionPort | undefined =>
  typeof value === 'string' && CONNECTION_PORTS.has(value as ConnectionPort)
    ? (value as ConnectionPort)
    : undefined;

const validateShape = (value: unknown): ValidationResult<Shape> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, detail: 'shape must be an object' };
  }

  const shape = value as Record<string, unknown>;
  if (!isValidIdentifier(shape.id)) return { ok: false, detail: 'shape.id is invalid' };
  if (typeof shape.type !== 'string' || !SHAPE_TYPES.has(shape.type as ShapeType)) {
    return { ok: false, detail: 'shape.type is invalid' };
  }
  if (!isFiniteNumberInRange(shape.x, MAX_COORDINATE)) return { ok: false, detail: 'shape.x is invalid' };
  if (!isFiniteNumberInRange(shape.y, MAX_COORDINATE)) return { ok: false, detail: 'shape.y is invalid' };
  if (!isPositiveFiniteNumber(shape.w)) return { ok: false, detail: 'shape.w is invalid' };
  if (!isPositiveFiniteNumber(shape.h)) return { ok: false, detail: 'shape.h is invalid' };
  if (!isSafeColor(shape.fill)) return { ok: false, detail: 'shape.fill is invalid' };
  if (!isSafeColor(shape.strokeColor)) return { ok: false, detail: 'shape.strokeColor is invalid' };

  const sanitized: Shape = {
    id: shape.id,
    type: shape.type as ShapeType,
    x: shape.x,
    y: shape.y,
    w: shape.w,
    h: shape.h,
    label: normalizeLabel(shape.label),
    fill: shape.fill,
    strokeColor: shape.strokeColor,
  };

  if (sanitized.type === 'image' && shape.src !== undefined) {
    if (!isSafeImageDataUrl(shape.src)) return { ok: false, detail: 'shape.src is invalid' };
    sanitized.src = shape.src;
  }

  return { ok: true, value: sanitized };
};

const validateConnection = (
  value: unknown,
  shapeIds: Set<string>,
): ValidationResult<Connection> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, detail: 'connection must be an object' };
  }

  const connection = value as Record<string, unknown>;
  if (!isValidIdentifier(connection.id)) return { ok: false, detail: 'connection.id is invalid' };
  if (!isValidIdentifier(connection.fromId) || !shapeIds.has(connection.fromId)) {
    return { ok: false, detail: 'connection.fromId is invalid' };
  }
  if (!isValidIdentifier(connection.toId) || !shapeIds.has(connection.toId)) {
    return { ok: false, detail: 'connection.toId is invalid' };
  }
  if (connection.color !== undefined && !isSafeColor(connection.color)) {
    return { ok: false, detail: 'connection.color is invalid' };
  }

  const sanitized: Connection = {
    id: connection.id,
    fromId: connection.fromId,
    toId: connection.toId,
  };
  const fromPort = normalizePort(connection.fromPort);
  const toPort = normalizePort(connection.toPort);
  if (fromPort) sanitized.fromPort = fromPort;
  if (toPort) sanitized.toPort = toPort;
  if (typeof connection.color === 'string') sanitized.color = connection.color;
  if (connection.label !== undefined) sanitized.label = normalizeLabel(connection.label);

  return { ok: true, value: sanitized };
};

export const validateCanvasPayload = (
  body: unknown,
): ValidationResult<{ name?: string; shapes: Shape[]; connections: Connection[] }> => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, detail: 'body must be an object' };
  }

  const payload = body as Record<string, unknown>;
  if (!Array.isArray(payload.shapes) || !Array.isArray(payload.connections)) {
    return { ok: false, detail: 'shapes and connections must be arrays' };
  }
  if (payload.shapes.length > MAX_SHAPES) return { ok: false, detail: `shapes cannot exceed ${MAX_SHAPES}` };
  if (payload.connections.length > MAX_CONNECTIONS) {
    return { ok: false, detail: `connections cannot exceed ${MAX_CONNECTIONS}` };
  }

  const shapes: Shape[] = [];
  const shapeIds = new Set<string>();
  for (const rawShape of payload.shapes) {
    const result = validateShape(rawShape);
    if (!result.ok) return result;
    if (shapeIds.has(result.value.id)) return { ok: false, detail: 'shape ids must be unique' };
    shapeIds.add(result.value.id);
    shapes.push(result.value);
  }

  const connections: Connection[] = [];
  const connectionIds = new Set<string>();
  for (const rawConnection of payload.connections) {
    const result = validateConnection(rawConnection, shapeIds);
    if (!result.ok) return result;
    if (connectionIds.has(result.value.id)) return { ok: false, detail: 'connection ids must be unique' };
    connectionIds.add(result.value.id);
    connections.push(result.value);
  }

  return {
    ok: true,
    value: {
      name: normalizeCanvasName(payload.name),
      shapes,
      connections,
    },
  };
};

export const parseIdList = (value: unknown): ValidationResult<string[] | undefined> => {
  if (value === undefined) return { ok: true, value: undefined };

  const rawValues = Array.isArray(value) ? value : [value];
  const ids = rawValues.flatMap((item) =>
    typeof item === 'string'
      ? item.split(',').map((part) => part.trim()).filter(Boolean)
      : [],
  );

  if (ids.length > 100) return { ok: false, detail: 'ids cannot exceed 100 items' };
  if (!ids.every(isValidIdentifier)) return { ok: false, detail: 'ids contains an invalid id' };
  return { ok: true, value: Array.from(new Set(ids)) };
};
