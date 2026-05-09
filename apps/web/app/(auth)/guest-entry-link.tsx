"use client";

import { useRouter } from "next/navigation";
import { PALETTE } from "@/client/landing-page/palette";
import { startGuestSession } from "@/lib/guest";

export function GuestDivider() {
  return (
    <div
      style={{
        marginTop: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          height: 1,
          flex: 1,
          maxWidth: 60,
          background: PALETTE.borderSoft,
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: PALETTE.textFaint,
          letterSpacing: "0.04em",
        }}
      >
        or
      </span>
      <span
        style={{
          height: 1,
          flex: 1,
          maxWidth: 60,
          background: PALETTE.borderSoft,
        }}
      />
    </div>
  );
}

export function GuestEntryButton() {
  const router = useRouter();

  const onClick = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        marginTop: 14,
        width: "100%",
        background: "transparent",
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        padding: "11px 16px",
        color: PALETTE.text,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        font: "inherit",
        transition: "border-color 0.15s ease, background 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = PALETTE.borderStrong;
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = PALETTE.border;
        e.currentTarget.style.background = "transparent";
      }}
    >
      Continue as guest →
    </button>
  );
}
