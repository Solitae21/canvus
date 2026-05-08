import { PALETTE } from "./palette";

export function AmbientBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        background: PALETTE.bg,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -120,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(86,141,255,0.18) 0%, rgba(86,141,255,0.04) 38%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "-15%",
          width: 580,
          height: 580,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(176,198,255,0.10) 0%, transparent 65%)",
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1200,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(86,141,255,0.08) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(220,225,251,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          backgroundPosition: "14px 14px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
