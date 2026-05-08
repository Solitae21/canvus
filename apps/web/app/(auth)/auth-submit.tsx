"use client";

import { PALETTE } from "@/client/landing-page/palette";

export function AuthSubmit({
  submitting,
  children,
}: {
  submitting?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={submitting}
      style={{
        marginTop: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        height: 46,
        padding: "0 22px",
        fontSize: 14.5,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: PALETTE.primaryDeep,
        background: PALETTE.primary,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        cursor: submitting ? "not-allowed" : "pointer",
        opacity: submitting ? 0.7 : 1,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)",
        transition:
          "box-shadow 220ms ease, transform 180ms ease, background 200ms ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (submitting) return;
        e.currentTarget.style.background = "#c4d4ff";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(86,141,255,0.35), 0 0 0 1px rgba(176,198,255,0.5)";
      }}
      onMouseLeave={(e) => {
        if (submitting) return;
        e.currentTarget.style.background = PALETTE.primary;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)";
      }}
    >
      {children}
      {!submitting && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}
