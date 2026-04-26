"use client";

import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { zoomIn, zoomOut } from "@/redux/slice/ui/ui-slice";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Canvas-mode header — minimal overlay that sits on top of the canvas.
   Inspired by Stitch's clean, floating top bar.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const IconBtn = ({
  children,
  label,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`group relative flex items-center justify-center
                w-9 h-9 rounded-xl
                text-on-surface-variant hover:text-on-surface
                hover:bg-white/[0.06] transition-all duration-150
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

/* ── Main canvas header ── */
const CanvasHeader = () => (
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
        <IconBtn label="Undo (Ctrl+Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.96" />
          </svg>
        </IconBtn>
        <IconBtn label="Redo (Ctrl+Shift+Z)">
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
);

export default CanvasHeader;
