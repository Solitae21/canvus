export const PALETTE = {
  bg: "#0c1324",
  bgDeep: "#070d1f",
  surface: "#151b2d",
  surfaceHi: "#191f31",
  surfaceHigher: "#23293c",
  borderSoft: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#dce1fb",
  textMuted: "#c2c6d8",
  textDim: "#8c90a1",
  textFaint: "#5a6079",
  primary: "#b0c6ff",
  primaryStrong: "#568dff",
  primaryDeep: "#002d6f",
  tertiary: "#bcc7de",
  warm: "#ffb4ab",
  amber: "#ffb454",
  mint: "#7dd3a4",
} as const;

export type Palette = typeof PALETTE;
