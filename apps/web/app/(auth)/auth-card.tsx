import { PALETTE } from "@/client/landing-page/palette";

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 440,
        animation: "auth-card-in 0.7s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <style>{`
        @keyframes auth-card-in {
          from { opacity: 0; transform: translateY(14px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -28,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(86,141,255,0.18) 0%, transparent 65%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "34px 32px 30px",
          background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
          border: `1px solid ${PALETTE.border}`,
          borderRadius: 20,
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(176,198,255,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            fontFamily:
              "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: PALETTE.primary,
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </div>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: PALETTE.text,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontSize: 14.5,
            color: PALETTE.textMuted,
            lineHeight: 1.55,
            margin: "10px 0 26px",
          }}
        >
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}
