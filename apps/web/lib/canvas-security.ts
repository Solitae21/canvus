const SAFE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const SAFE_IMAGE_DATA_URL_RE =
  /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=\s]+$/;

export const MAX_IMAGE_FILE_BYTES = 2_250_000;
export const MAX_IMAGE_DATA_URL_LENGTH = 3_000_000;
export const MAX_CANVAS_LABEL_LENGTH = 2000;

export const isSafeImageFile = (file: File): boolean =>
  SAFE_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_FILE_BYTES;

export const isSafeImageDataUrl = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length <= MAX_IMAGE_DATA_URL_LENGTH &&
  SAFE_IMAGE_DATA_URL_RE.test(value);

export const clampCanvasLabel = (value: string): string =>
  value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").slice(0, MAX_CANVAS_LABEL_LENGTH);
