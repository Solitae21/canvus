"use client";

import { useEffect, useState } from "react";
import type { CanvasSummary } from "@canvus/shared";
import { PALETTE } from "@/client/landing-page/palette";

export function DeleteCanvasDialog({
  open,
  onClose,
  canvas,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  canvas: CanvasSummary;
  onConfirm: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-canvas-title"
      aria-describedby="delete-canvas-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <style>{`
        @keyframes dash-dialog-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dash-dialog-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes dash-dialog-pop-in {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes dash-dialog-pop-out {
          from { opacity: 1; transform: translateY(0)    scale(1); }
          to   { opacity: 0; transform: translateY(6px)  scale(0.97); }
        }
      `}</style>

      <div
        onClick={busy || !open ? undefined : onClose}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(7,13,31,0.55) 0%, rgba(7,13,31,0.85) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: open
            ? "dash-dialog-fade-in 220ms ease both"
            : "dash-dialog-fade-out 200ms ease both",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          borderRadius: 20,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
          border: `1px solid ${PALETTE.borderStrong}`,
          boxShadow:
            "0 32px 80px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,180,171,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          animation: open
            ? "dash-dialog-pop-in 260ms cubic-bezier(0.16,1,0.3,1) both"
            : "dash-dialog-pop-out 200ms cubic-bezier(0.4,0,1,1) both",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(220,225,251,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            backgroundPosition: "11px 11px",
            maskImage:
              "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 0%, black 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 24,
            right: 24,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,180,171,0.55), transparent)",
          }}
        />

        <div style={{ position: "relative", padding: "28px 28px 22px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 14,
              background:
                "linear-gradient(180deg, rgba(255,180,171,0.16), rgba(255,180,171,0.06))",
              border: "1px solid rgba(255,180,171,0.32)",
              color: PALETTE.warm,
              marginBottom: 18,
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 20px -8px rgba(255,180,171,0.4)",
            }}
          >
            <DialogTrashIcon />
          </div>
          <h2
            id="delete-canvas-title"
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
              color: PALETTE.text,
            }}
          >
            Delete this canvas?
          </h2>
          <p
            id="delete-canvas-desc"
            style={{
              fontSize: 14,
              color: PALETTE.textMuted,
              margin: "10px 0 0",
              lineHeight: 1.6,
            }}
          >
            You&apos;re about to delete{" "}
            <span
              style={{
                color: PALETTE.text,
                fontWeight: 600,
                background: "rgba(176,198,255,0.08)",
                padding: "1px 8px",
                borderRadius: 6,
                border: `1px solid ${PALETTE.borderSoft}`,
              }}
            >
              {canvas.name || "Untitled board"}
            </span>
            . This action is permanent and can&apos;t be undone.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            gap: 10,
            padding: "16px 20px 20px",
            justifyContent: "flex-end",
            borderTop: `1px solid ${PALETTE.borderSoft}`,
            background: "rgba(7,13,31,0.35)",
          }}
        >
          <GhostButton onClick={onClose} disabled={busy} autoFocus>
            Cancel
          </GhostButton>
          <DangerButton onClick={handleConfirm} disabled={busy}>
            {busy ? (
              <>
                <Spinner />
                Deleting…
              </>
            ) : (
              <>
                <DialogTrashIcon small />
                Delete canvas
              </>
            )}
          </DangerButton>
        </div>
      </div>
    </div>
  );
}

function GhostButton({
  onClick,
  disabled,
  autoFocus,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        fontSize: 13.5,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: PALETTE.text,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
        transition:
          "background 180ms ease, border-color 180ms ease, color 180ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.borderColor = PALETTE.borderStrong;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = PALETTE.border;
      }}
    >
      {children}
    </button>
  );
}

function DangerButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 16px",
        fontSize: 13.5,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "#3a0d05",
        background: "linear-gradient(180deg, #ffc7c0 0%, #ffb4ab 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(0,0,0,0.4), 0 8px 18px -8px rgba(255,180,171,0.55)",
        fontFamily: "inherit",
        transition:
          "transform 160ms ease, box-shadow 220ms ease, background 200ms ease",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background =
          "linear-gradient(180deg, #ffd2cc 0%, #ffbeb5 100%)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.7), 0 12px 26px -10px rgba(255,180,171,0.7), 0 0 0 1px rgba(255,180,171,0.45)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background =
          "linear-gradient(180deg, #ffc7c0 0%, #ffb4ab 100%)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 rgba(0,0,0,0.4), 0 8px 18px -8px rgba(255,180,171,0.55)";
      }}
    >
      {children}
    </button>
  );
}

function DialogTrashIcon({ small }: { small?: boolean } = {}) {
  const size = small ? 14 : 22;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={small ? 2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
    </svg>
  );
}

function Spinner() {
  return (
    <>
      <style>{`
        @keyframes dash-spin { to { transform: rotate(360deg); } }
      `}</style>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "dash-spin 0.9s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.4"
          opacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}
