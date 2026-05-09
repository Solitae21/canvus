"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { PALETTE } from "@/client/landing-page/palette";
import { isGuest } from "@/lib/guest";

const subscribeGuest = (cb: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === null || e.key === "canvus.guest.session") cb();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
};

export function GuestBanner() {
  const show = useSyncExternalStore(
    subscribeGuest,
    () => isGuest(),
    () => false,
  );

  if (!show) return null;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 20,
        width: "100%",
        background: PALETTE.surfaceHi,
        borderBottom: `1px solid ${PALETTE.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "10px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          fontFamily:
            "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 10px",
            borderRadius: 999,
            background: "rgba(176,198,255,0.10)",
            border: `1px solid ${PALETTE.borderStrong}`,
            color: PALETTE.primary,
            fontFamily:
              "var(--font-jetbrains-mono), ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: PALETTE.amber,
              boxShadow: `0 0 6px ${PALETTE.amber}`,
            }}
          />
          Guest mode
        </span>

        <span
          style={{
            color: PALETTE.textMuted,
            fontSize: 13.5,
            flex: 1,
            minWidth: 200,
          }}
        >
          You&apos;re using Canvus as a guest. Canvases stay only in this
          browser session.
        </span>

        <Link
          href="/sign-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 8,
            background: PALETTE.primaryStrong,
            color: "#0a1023",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            border: `1px solid ${PALETTE.borderStrong}`,
          }}
        >
          Sign up to save →
        </Link>
      </div>
    </div>
  );
}
