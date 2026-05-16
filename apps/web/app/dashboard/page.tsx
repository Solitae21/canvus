"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useGetBoardsQuery,
  useCreateBoardMutation,
  type BoardListItem,
} from "@/redux/api/boardsApi";
import { AmbientBackground } from "@/client/landing-page/ambient-background";
import { PALETTE } from "@/client/landing-page/palette";
import { CanvusMark } from "@/client/brand/CanvusMark";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

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
      />

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
            Your boards
          </h1>
          <p
            style={{
              fontSize: 14.5,
              color: PALETTE.textMuted,
              margin: "8px 0 0",
            }}
          >
            {authLoading || listLoading
              ? "Loading boards…"
              : signedOut
                ? "Sign in to see your boards."
                : isEmpty
                  ? "Nothing here yet — let’s start your first board."
                  : `${boards?.length} board${boards?.length === 1 ? "" : "s"} in your workspace.`}
          </p>
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
}: {
  onCreate: () => void;
  creating: boolean;
  canCreate: boolean;
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
          {canCreate && (
            <PrimaryButton compact onClick={onCreate} disabled={creating}>
              <PlusIcon />
              {creating ? "Creating…" : "New board"}
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
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 18,
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
              {board.name || "Untitled board"}
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
          No boards yet
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
        padding: "72px 32px",
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
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Sign in to see your boards
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
