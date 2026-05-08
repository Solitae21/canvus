import Link from "next/link";
import { AmbientBackground } from "@/client/landing-page/ambient-background";
import { PALETTE } from "@/client/landing-page/palette";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        color: PALETTE.text,
        fontFamily:
          "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      <AmbientBackground />

      <header
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 28px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: PALETTE.text,
          }}
        >
          <BrandMark />
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            CanvUs
          </span>
        </Link>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: PALETTE.textMuted,
            textDecoration: "none",
            transition: "color 160ms ease",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </header>

      <main
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px 80px",
          minHeight: "calc(100vh - 88px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <div style={{ position: "relative", width: 28, height: 28 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background: PALETTE.primaryStrong,
          transform: "rotate(8deg) scale(0.92)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryStrong})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PALETTE.primaryDeep}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4h7v7H4zM13 13h7v7h-7z" />
        </svg>
      </div>
    </div>
  );
}
