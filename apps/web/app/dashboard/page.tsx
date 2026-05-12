"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CanvasSummary } from "@canvus/shared";
import { createCanvas, listCanvases, deleteCanvas } from "@/lib/api";
import { AmbientBackground } from "@/client/landing-page/ambient-background";
import { PALETTE } from "@/client/landing-page/palette";
import { GuestBanner } from "@/client/guest/guest-banner";
import {
  addGuestCanvas,
  getGuestCanvasIds,
  removeGuestCanvas,
} from "@/lib/guest";

export default function DashboardPage() {
  const router = useRouter();
  const [canvases, setCanvases] = useState<CanvasSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CanvasSummary | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    listCanvases(getGuestCanvasIds())
      .then((cs) => {
        setCanvases(
          [...cs].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime(),
          ),
        );
      })
      .catch((err: Error) =>
        setLoadError(err.message ?? "Failed to load canvases"),
      );
  }, []);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const canvas = await createCanvas("Untitled board");
      addGuestCanvas(canvas.id);
      router.push(`/canvas/${canvas.id}`);
    } catch {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await deleteCanvas(id);
      removeGuestCanvas(id);
      setCanvases((prev) => (prev ?? []).filter((c) => c.id !== id));
      setDialogOpen(false);
    } catch {
      // swallow — keep card visible
    } finally {
      setBusyId(null);
    }
  };

  const isLoading = canvases === null && !loadError;
  const isEmpty = canvases !== null && canvases.length === 0;

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

      <GuestBanner />

      <DashboardHeader onCreate={handleCreate} creating={creating} />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "32px 28px 80px",
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), ui-monospace, monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: PALETTE.primary,
              marginBottom: 10,
            }}
          >
            Your workspace
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Your canvases
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: PALETTE.textMuted,
              margin: "8px 0 0",
            }}
          >
            {isLoading
              ? "Loading boards…"
              : isEmpty
                ? "Nothing here yet — let’s start your first board."
                : `${canvases?.length} board${canvases?.length === 1 ? "" : "s"} in your workspace.`}
          </p>
        </div>

        {loadError && <ErrorState message={loadError} />}

        {!loadError && isLoading && <SkeletonGrid />}

        {!loadError && isEmpty && <EmptyState onCreate={handleCreate} creating={creating} />}

        {!loadError && canvases && canvases.length > 0 && (
          <CanvasGrid
            canvases={canvases}
            busyId={busyId}
            onRequestDelete={(c) => {
              setPendingDelete(c);
              setDialogOpen(true);
            }}
          />
        )}
      </main>

      {pendingDelete && (
        <DeleteCanvasDialog
          open={dialogOpen}
          canvas={pendingDelete}
          busy={busyId === pendingDelete.id}
          onCancel={() => {
            if (busyId === pendingDelete.id) return;
            setDialogOpen(false);
          }}
          onConfirm={() => handleDelete(pendingDelete.id)}
          onExited={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function DashboardHeader({
  onCreate,
  creating,
}: {
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backdropFilter: "blur(18px)",
        background: "rgba(12,19,36,0.65)",
        borderBottom: `1px solid ${PALETTE.borderSoft}`,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
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

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: PALETTE.textDim,
              textDecoration: "none",
              padding: "6px 12px",
            }}
          >
            Home
          </Link>
          <PrimaryButton compact onClick={onCreate} disabled={creating}>
            <PlusIcon />
            {creating ? "Creating…" : "New canvas"}
          </PrimaryButton>
        </div>
      </div>
    </header>
  );
}

function CanvasGrid({
  canvases,
  busyId,
  onRequestDelete,
}: {
  canvases: CanvasSummary[];
  busyId: string | null;
  onRequestDelete: (canvas: CanvasSummary) => void;
}) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 18,
      }}
    >
      {canvases.map((c, i) => (
        <CanvasCard
          key={c.id}
          canvas={c}
          index={i}
          isBusy={busyId === c.id}
          onRequestDelete={() => onRequestDelete(c)}
        />
      ))}
    </ul>
  );
}

function CanvasCard({
  canvas,
  index,
  isBusy,
  onRequestDelete,
}: {
  canvas: CanvasSummary;
  index: number;
  isBusy: boolean;
  onRequestDelete: () => void;
}) {
  const [hover, setHover] = useState(false);
  const updated = useRelativeTime(canvas.updatedAt);

  return (
    <li
      style={{
        animation: `dash-fade-up 0.55s ${Math.min(index, 6) * 0.05}s cubic-bezier(0.16,1,0.3,1) both`,
      }}
    >
      <style>{`
        @keyframes dash-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
          border: `1px solid ${hover ? PALETTE.border : PALETTE.borderSoft}`,
          transform: hover ? "translateY(-3px)" : "translateY(0)",
          boxShadow: hover
            ? "0 20px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(176,198,255,0.18)"
            : "0 8px 24px rgba(0,0,0,0.3)",
          transition:
            "transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease",
          opacity: isBusy ? 0.5 : 1,
        }}
      >
        <Link
          href={`/canvas/${canvas.id}`}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <CardThumb />
          <div style={{ padding: "16px 18px 18px" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: PALETTE.text,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {canvas.name || "Untitled board"}
            </div>
            <div
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono), ui-monospace, monospace",
                fontSize: 11,
                color: PALETTE.textDim,
                letterSpacing: "0.04em",
                marginTop: 6,
              }}
            >
              Updated {updated}
            </div>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Delete canvas"
          disabled={isBusy}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestDelete();
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            display: hover || isBusy ? "inline-flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(12,19,36,0.7)",
            border: `1px solid ${PALETTE.border}`,
            color: PALETTE.textDim,
            borderRadius: 8,
            cursor: isBusy ? "not-allowed" : "pointer",
            backdropFilter: "blur(8px)",
            transition: "color 160ms ease, border-color 160ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = PALETTE.warm;
            e.currentTarget.style.borderColor = "rgba(255,180,171,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = PALETTE.textDim;
            e.currentTarget.style.borderColor = PALETTE.border;
          }}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function CardThumb() {
  return (
    <div
      style={{
        position: "relative",
        height: 132,
        background:
          "radial-gradient(ellipse at 30% 20%, #1a2244 0%, #0c1324 65%, #070d1f 100%)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(220,225,251,0.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundPosition: "9px 9px",
          opacity: 0.7,
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 280 132"
        style={{ position: "absolute", inset: 0 }}
      >
        <rect
          x="40"
          y="22"
          width="80"
          height="26"
          rx="6"
          fill="rgba(176,198,255,0.10)"
          stroke={PALETTE.primary}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.85"
        />
        <rect
          x="160"
          y="58"
          width="80"
          height="30"
          rx="6"
          fill="rgba(86,141,255,0.12)"
          stroke={PALETTE.primaryStrong}
          strokeWidth="1"
        />
        <polygon
          points="80,98 110,84 140,98 110,112"
          fill="rgba(125,211,164,0.08)"
          stroke={PALETTE.mint}
          strokeWidth="1"
        />
        <line
          x1="120"
          y1="35"
          x2="160"
          y2="73"
          stroke={PALETTE.primary}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
        <line
          x1="160"
          y1="84"
          x2="140"
          y2="98"
          stroke={PALETTE.primaryStrong}
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
      </svg>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, transparent 60%, rgba(12,19,36,0.6) 100%)",
        }}
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 18,
      }}
    >
      <style>{`
        @keyframes dash-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 200,
            borderRadius: 16,
            border: `1px solid ${PALETTE.borderSoft}`,
            background: `linear-gradient(90deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surfaceHigher} 50%, ${PALETTE.surfaceHi} 100%)`,
            backgroundSize: "200% 100%",
            animation: "dash-shimmer 1.6s linear infinite",
          }}
        />
      ))}
    </div>
  );
}

function EmptyState({
  onCreate,
  creating,
}: {
  onCreate: () => void;
  creating: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        padding: "72px 32px",
        textAlign: "center",
        borderRadius: 20,
        border: `1px solid ${PALETTE.borderSoft}`,
        background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(220,225,251,0.06) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          backgroundPosition: "13px 13px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 30%, transparent 75%)",
          opacity: 0.7,
        }}
      />
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(176,198,255,0.10)",
            border: "1px solid rgba(176,198,255,0.25)",
            color: PALETTE.primary,
            marginBottom: 18,
          }}
        >
          <SparkleIcon />
        </div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          No canvases yet
        </h2>
        <p
          style={{
            fontSize: 14.5,
            color: PALETTE.textMuted,
            margin: "10px auto 24px",
            maxWidth: 380,
            lineHeight: 1.55,
          }}
        >
          Spin up your first board and invite your team. Sub-50ms sync,
          conflict-free, ready in seconds.
        </p>
        <PrimaryButton onClick={onCreate} disabled={creating}>
          <PlusIcon />
          {creating ? "Creating…" : "Create your first canvas"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "20px 22px",
        borderRadius: 14,
        border: "1px solid rgba(255,180,171,0.35)",
        background: "rgba(255,180,171,0.06)",
        color: PALETTE.warm,
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      Couldn’t load your canvases — {message}. Make sure the API is running
      at{" "}
      <code
        style={{
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: 12.5,
        }}
      >
        {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}
      </code>
      .
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function DeleteCanvasDialog({
  open,
  canvas,
  busy,
  onCancel,
  onConfirm,
  onExited,
}: {
  open: boolean;
  canvas: CanvasSummary;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onExited: () => void;
}) {
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
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

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
        onClick={busy || !open ? undefined : onCancel}
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
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "dash-dialog-pop-out") {
            onExited();
          }
        }}
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
          <GhostButton onClick={onCancel} disabled={busy} autoFocus>
            Cancel
          </GhostButton>
          <DangerButton onClick={onConfirm} disabled={busy}>
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

/* ────────────────────────────────────────────────────────────────────────── */

function PrimaryButton({
  onClick,
  disabled,
  children,
  compact,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  compact?: boolean;
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
        padding: compact ? "8px 16px" : "12px 22px",
        fontSize: compact ? 13 : 14,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: PALETTE.primaryDeep,
        background: PALETTE.primary,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.7 : 1,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)",
        transition:
          "box-shadow 220ms ease, transform 180ms ease, background 200ms ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = "#c4d4ff";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(86,141,255,0.35), 0 0 0 1px rgba(176,198,255,0.5)";
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = PALETTE.primary;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)";
      }}
    >
      {children}
    </button>
  );
}

function useRelativeTime(iso: string) {
  return useMemo(() => formatRelative(iso), [iso]);
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "recently";
  const diff = Date.now() - then;
  const sec = Math.max(0, Math.round(diff / 1000));
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
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
