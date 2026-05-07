"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { zoomIn, zoomOut } from "@/redux/slice/ui/ui-slice";
import { undo, redo } from "@/redux/slice/canvas/canvas-slice";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Canvas-mode header — minimal overlay that sits on top of the canvas.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const IconBtn = ({
  children,
  label,
  onClick,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    className={`group relative flex items-center justify-center
                w-9 h-9 rounded-xl
                text-on-surface-variant hover:text-on-surface
                hover:bg-white/[0.06] transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
                ${className}`}
  >
    {children}
    <span
      className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2
                  px-2 py-1 text-[11px] font-medium tracking-wide
                  bg-surface-container-highest text-on-surface
                  rounded-md shadow-lg whitespace-nowrap
                  opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
                  transition-all duration-150"
    >
      {label}
    </span>
  </button>
);

/* ── Zoom controls ── */
const ZoomControls = () => {
  const dispatch = useAppDispatch();
  const scale = useAppSelector((s) => s.ui.viewport.scale);

  return (
    <div
      className="flex items-center gap-0.5 px-1 py-0.5
                  bg-surface-container/70 backdrop-blur-[16px]
                  border border-white/[0.06] rounded-xl"
    >
      <button
        onClick={() => dispatch(zoomOut())}
        title="Zoom out"
        className="flex items-center justify-center w-7 h-7 rounded-lg
                   text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                   transition-all duration-150 text-sm"
      >
        −
      </button>
      <span className="w-12 text-center text-[12px] font-medium tracking-wide text-on-surface-variant tabular-nums">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => dispatch(zoomIn())}
        title="Zoom in"
        className="flex items-center justify-center w-7 h-7 rounded-lg
                   text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                   transition-all duration-150 text-sm"
      >
        +
      </button>
    </div>
  );
};

/* ── Share modal ── */
const ShareModal = ({ canvasId, onClose }: { canvasId: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Safe: ShareModal only mounts after `mounted` is true (client-only)
  const shareUrl = useMemo(
    () => `${window.location.origin}/canvas/${canvasId}`,
    [canvasId],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      inputRef.current?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(7,13,31,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{
          background: "linear-gradient(180deg,#191f31 0%,#151b2d 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(176,198,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-7 h-7 rounded-lg
                     text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                     transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
               style={{ background: "rgba(86,141,255,0.15)", border: "1px solid rgba(86,141,255,0.25)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0c6ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-on-surface tracking-tight">Share this canvas</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5">Anyone with the link can join and collaborate in real time.</p>
          </div>
        </div>

        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Link row */}
        <label className="block text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
          Shareable link
        </label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            readOnly
            value={shareUrl}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl text-[12px] font-mono text-on-surface-variant
                       outline-none select-all cursor-text"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                       transition-all duration-150 active:scale-[0.97]"
            style={
              copied
                ? { background: "rgba(125,211,164,0.18)", color: "#7dd3a4", border: "1px solid rgba(125,211,164,0.3)" }
                : { background: "rgba(176,198,255,0.12)", color: "#b0c6ff", border: "1px solid rgba(176,198,255,0.2)" }
            }
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy link
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-[11.5px] text-on-surface-variant" style={{ color: "rgba(194,198,216,0.5)" }}>
          No account required to join — guests enter with a randomly assigned name and color.
        </p>
      </div>
    </div>
  );
};

/* ── Main canvas header ── */
const CanvasHeader = ({ canvasId }: { canvasId: string }) => {
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);

  const canUndoStore = useAppSelector((s) => s.canvas.past.length > 0);
  const canRedoStore = useAppSelector((s) => s.canvas.future.length > 0);

  // Defer to client-only values to avoid SSR/localStorage hydration mismatch
  const canUndo = mounted && canUndoStore;
  const canRedo = mounted && canRedoStore;

  return (
  <>
    <div className="fixed top-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-3 mt-3 flex items-center justify-between pointer-events-auto">
        {/* ── Left cluster ── */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5
                      bg-surface-container/70 backdrop-blur-[24px]
                      border border-white/[0.07] rounded-2xl
                      shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg
                       hover:bg-white/[0.06] transition-colors duration-150"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-on-surface-variant"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>

          <div className="w-px h-5 bg-white/[0.08]" />

          {/* Project name */}
          <div className="flex items-center gap-2 px-2">
            <div className="relative w-5 h-5">
              <div className="absolute inset-0 rounded bg-primary-container/80 rotate-6 scale-90" />
              <div className="absolute inset-0 rounded bg-gradient-to-br from-primary-container to-primary" />
            </div>
            <span className="text-[13px] font-semibold text-on-surface tracking-tight">
              Untitled project
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-on-surface-variant/50"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── Center: zoom ── */}
        <ZoomControls />

        {/* ── Right cluster ── */}
        <div
          className="flex items-center gap-1 px-2 py-1.5
                      bg-surface-container/70 backdrop-blur-[24px]
                      border border-white/[0.07] rounded-2xl
                      shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
        >
          {/* Undo / Redo */}
          <IconBtn label="Undo (Ctrl+Z)" onClick={() => dispatch(undo())} disabled={!canUndo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.96" />
            </svg>
          </IconBtn>
          <IconBtn label="Redo (Ctrl+Shift+Z)" onClick={() => dispatch(redo())} disabled={!canRedo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-.49-3.96" />
            </svg>
          </IconBtn>

          <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

          {/* Collaborators indicator */}
          <div className="flex items-center -space-x-1.5 mx-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#568dff] to-[#b0c6ff] ring-2 ring-surface-container flex items-center justify-center text-[10px] font-bold text-on-primary">
              Y
            </div>
          </div>

          <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

          {/* Share button */}
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5
                       bg-primary-container text-on-primary
                       text-[12px] font-semibold tracking-wide
                       rounded-xl
                       hover:brightness-110 hover:shadow-[0_0_16px_rgba(86,141,255,0.3)]
                       active:scale-[0.97] transition-all duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            Share
          </button>

          {/* More menu */}
          <IconBtn label="More options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </IconBtn>
        </div>
      </div>
    </div>

    {mounted && shareOpen && (
      <ShareModal canvasId={canvasId} onClose={() => setShareOpen(false)} />
    )}
  </>
  );
};

export default CanvasHeader;
