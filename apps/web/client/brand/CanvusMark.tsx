const PALETTE = {
  primary: "#b0c6ff",
  primaryStrong: "#568dff",
  primaryDeep: "#002d6f",
} as const;

type Size = number;

export function CanvusGlyph({
  size = 14,
  color = PALETTE.primaryDeep,
}: {
  size?: Size;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19 4 H5 V20 H19"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="13" y="10" width="4" height="4" rx="1" fill={color} />
    </svg>
  );
}

export function CanvusMark({ size = 28 }: { size?: Size }) {
  const inner = Math.round(size * 0.5);

  return (
    <div
      style={{ position: "relative", width: size, height: size }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: Math.round(size * 0.28),
          background: PALETTE.primaryStrong,
          transform: "rotate(8deg) scale(0.92)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: Math.round(size * 0.28),
          background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryStrong})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <CanvusGlyph size={inner} color={PALETTE.primaryDeep} />
      </div>
    </div>
  );
}
