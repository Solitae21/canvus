"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/toast/toast-provider";
import {
  useGetBoardsQuery,
  useCreateBoardMutation,
  type BoardListItem,
} from "@/redux/api/boardsApi";
import { AmbientBackground } from "@/client/landing-page/ambient-background";
import { PALETTE } from "@/client/landing-page/palette";
import { CanvusMark } from "@/client/brand/CanvusMark";
import { useIsMobile } from "@/lib/use-media-query";

export default function DashboardPage() {
  const router = useRouter();
  const { error: toastError } = useToast();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const isMobile = useIsMobile();

  const { data: boards, isFetching, error } = useGetBoardsQuery(undefined, {
    skip: !userId,
  });
  const [createBoard, { isLoading: creating }] = useCreateBoardMutation();

  const handleCreate = async () => {
    if (creating) return;
    try {
      const board = await createBoard({ name: "Untitled board" }).unwrap();
      router.push(`/board/${board.id}`);
    } catch {
      // RTK Query keeps the error; intentionally swallow here so the UI
      // doesn't blow up — the button re-enables once isLoading flips back.
    }
  };

  const authLoading = status === "loading";
  const signedOut = !authLoading && !userId;
  const listLoading = !!userId && isFetching && !boards;
  const isEmpty = !!boards && boards.length === 0;
  const loadError = error
    ? "error" in error
      ? String(error.error)
      : "data" in error && error.data && typeof error.data === "object" && "error" in error.data
        ? String((error.data as { error: unknown }).error)
        : "Failed to load boards"
    : null;

  useEffect(() => {
    if (loadError) {
      toastError(`Couldn't load your boards — ${loadError}.`, {
        title: "Something went wrong",
      });
    }
  }, [loadError, toastError]);

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

      <DashboardHeader
        onCreate={handleCreate}
        creating={creating}
        canCreate={!!userId}
        isMobile={isMobile}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: isMobile ? "24px 18px 64px" : "32px 28px 80px",
        }}
      >
        <div style={{ marginBottom: 36, position: "relative" }}>
          {/* Eyebrow — mono-caps with copper indicator */}
          <div
            style={{
              fontFamily:
                "var(--font-jetbrains-mono), ui-monospace, monospace",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(194, 198, 216, 0.7)",
              marginBottom: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 22,
                height: 1,
                background: "#e4a572",
                boxShadow: "0 0 6px rgba(228,165,114,0.55)",
              }}
            />
            <span>Workspace · Draft Atelier</span>
          </div>

          {/* Hero — editorial serif italic accent on "boards" */}
          <h1
            style={{
              fontSize: "clamp(38px, 4.6vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              margin: 0,
              lineHeight: 0.98,
              color: PALETTE.text,
              fontFamily:
                "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui",
            }}
          >
            Your{" "}
            <span
              style={{
                fontFamily:
                  "var(--font-fraunces), ui-serif, Georgia, serif",
                fontStyle: "italic",
                fontWeight: 500,
                letterSpacing: "-0.04em",
                background:
                  "linear-gradient(92deg, #dce1fb 0%, #b0c6ff 45%, #e4a572 95%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              boards
            </span>
          </h1>

          {/* Subhead row — copy + drafting count chip */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontSize: 15,
                color: PALETTE.textMuted,
                margin: 0,
                lineHeight: 1.5,
                maxWidth: 480,
              }}
            >
              {authLoading || listLoading
                ? "Loading boards…"
                : signedOut
                  ? "Sign in to see your boards."
                  : isEmpty
                    ? "Nothing here yet — let's start your first board."
                    : `${boards?.length} board${boards?.length === 1 ? "" : "s"} in your workspace.`}
            </p>
            {boards && boards.length > 0 && (
              <span
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#e4a572",
                  padding: "4px 9px",
                  background: "rgba(228, 165, 114, 0.10)",
                  border: "1px solid rgba(228, 165, 114, 0.28)",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                }}
              >
                {String(boards.length).padStart(2, "0")} · active
              </span>
            )}
          </div>
        </div>

        {loadError && <ErrorState message={loadError} />}

        {!loadError && signedOut && <SignInPrompt />}

        {!loadError && (authLoading || listLoading) && <SkeletonGrid />}

        {!loadError && !signedOut && isEmpty && (
          <EmptyState onCreate={handleCreate} creating={creating} />
        )}

        {!loadError && boards && boards.length > 0 && (
          <BoardGrid boards={boards} />
        )}
      </main>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function DashboardHeader({
  onCreate,
  creating,
  canCreate,
  isMobile,
}: {
  onCreate: () => void;
  creating: boolean;
  canCreate: boolean;
  isMobile: boolean;
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
          padding: isMobile ? "12px 16px" : "14px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 10 : 16,
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
              fontSize: isMobile ? 15 : 16,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            CanvUs
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 10 }}>
          {!isMobile && (
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
          )}
          {canCreate && (
            <PrimaryButton compact onClick={onCreate} disabled={creating}>
              <PlusIcon />
              {creating ? "Creating…" : isMobile ? "New" : "New board"}
            </PrimaryButton>
          )}
        </div>
      </div>
    </header>
  );
}

function BoardGrid({ boards }: { boards: BoardListItem[] }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
        gap: 14,
      }}
    >
      {boards.map((b, i) => (
        <BoardCard key={b.id} board={b} index={i} />
      ))}
    </ul>
  );
}

function BoardCard({ board, index }: { board: BoardListItem; index: number }) {
  const [hover, setHover] = useState(false);
  const updated = useRelativeTime(board.updatedAt);

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
        }}
      >
        <Link
          href={`/board/${board.id}`}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <CardThumb />

          {/* Drafting corner ticks on the card itself */}
          {hover && (
            <>
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 7,
                  left: 7,
                  width: 8,
                  height: 8,
                  borderTop: "1px solid rgba(228,165,114,0.7)",
                  borderLeft: "1px solid rgba(228,165,114,0.7)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 8,
                  height: 8,
                  borderTop: "1px solid rgba(228,165,114,0.7)",
                  borderRight: "1px solid rgba(228,165,114,0.7)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            </>
          )}

          <div style={{ padding: "14px 18px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: PALETTE.mint,
                  boxShadow: `0 0 6px ${PALETTE.mint}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: PALETTE.text,
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1,
                }}
              >
                {board.name || "Untitled board"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(194,198,216,0.55)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Mod · {updated}
              </span>
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontFamily:
                    "var(--font-jetbrains-mono), ui-monospace, monospace",
                  fontSize: 10,
                  color: hover
                    ? "rgba(228,165,114,0.9)"
                    : "rgba(176,198,255,0.55)",
                  letterSpacing: "0.1em",
                  transform: hover ? "translateX(2px)" : "translateX(0)",
                  transition: "transform 220ms ease, color 220ms ease",
                }}
              >
                {hover ? "OPEN" : "—"}{" "}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ marginLeft: 4 }}
                >
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
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
        gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
        gap: 14,
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
        padding: "clamp(40px, 8vw, 72px) clamp(20px, 5vw, 32px)",
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
            fontSize: 28,
            fontWeight: 600,
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          No boards{" "}
          <span
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#e4a572",
              letterSpacing: "-0.035em",
            }}
          >
            yet.
          </span>
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
          {creating ? "Creating…" : "Create your first board"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div
      style={{
        position: "relative",
        padding: "clamp(40px, 8vw, 72px) clamp(20px, 5vw, 32px)",
        textAlign: "center",
        borderRadius: 20,
        border: `1px solid ${PALETTE.borderSoft}`,
        background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
        overflow: "hidden",
      }}
    >
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
            fontSize: 28,
            fontWeight: 600,
            margin: 0,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Sign in to see{" "}
          <span
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              color: PALETTE.primary,
              letterSpacing: "-0.035em",
            }}
          >
            your boards.
          </span>
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
          Your workspace is saved to your account. Sign in to open, share, and
          continue collaborating on your boards.
        </p>
        <Link
          href="/sign-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: PALETTE.primaryDeep,
            background: PALETTE.primary,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            textDecoration: "none",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)",
          }}
        >
          Sign in
        </Link>
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
      Couldn’t load your boards — {message}.
    </div>
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
  return <CanvusMark size={28} />;
}
