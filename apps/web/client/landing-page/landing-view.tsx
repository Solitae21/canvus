"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PALETTE } from "./palette";
import { startGuestSession } from "@/lib/guest";
import { CanvusMark } from "@/client/brand/CanvusMark";

/* ────────────────────────────────────────────────────────────────────────────
   CanvUs — Landing
   Aesthetic: refined editorial-tech. Stitch-inspired, dark-first OLED navy
   with lavender-blue glow accents. Plus Jakarta Sans for prose, JetBrains
   Mono for systemic labels. Glassmorphism, dot-grid, restrained motion.
   ──────────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".lp-reveal, .lp-reveal-scale, .lp-reveal-line");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("lp-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ── Global injected styles (animations + utility classes) ─────────────── */
const GlobalStyles = () => (
  <style>{`
    .lp-root *, .lp-root *::before, .lp-root *::after {
      box-sizing: border-box;
    }
    .lp-root { scroll-behavior: smooth; }

    @keyframes lp-fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes lp-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes lp-pulse {
      0%   { transform: scale(0.85); opacity: 0.9; }
      100% { transform: scale(2.2);  opacity: 0;   }
    }
    @keyframes lp-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes lp-cursor-a {
      0%   { top: 38%; left: 30%; }
      25%  { top: 55%; left: 58%; }
      50%  { top: 30%; left: 65%; }
      75%  { top: 62%; left: 22%; }
      100% { top: 38%; left: 30%; }
    }
    @keyframes lp-cursor-b {
      0%   { top: 60%; left: 55%; }
      25%  { top: 28%; left: 42%; }
      50%  { top: 65%; left: 30%; }
      75%  { top: 40%; left: 70%; }
      100% { top: 60%; left: 55%; }
    }
    @keyframes lp-draw {
      from { stroke-dashoffset: 240; }
      to   { stroke-dashoffset: 0;   }
    }
    @keyframes lp-orbit {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }

    .lp-fade   { animation: lp-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
    .lp-fade-1 { animation: lp-fadeUp 0.8s 0.08s cubic-bezier(0.16,1,0.3,1) both; }
    .lp-fade-2 { animation: lp-fadeUp 0.8s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
    .lp-fade-3 { animation: lp-fadeUp 0.8s 0.30s cubic-bezier(0.16,1,0.3,1) both; }
    .lp-fade-4 { animation: lp-fadeUp 0.8s 0.44s cubic-bezier(0.16,1,0.3,1) both; }

    @keyframes lp-word-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes lp-line-in {
      from { transform: scaleX(0); transform-origin: left center; }
      to   { transform: scaleX(1); transform-origin: left center; }
    }

    /* Scroll-reveal */
    .lp-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
    }
    .lp-reveal.lp-in { opacity: 1; transform: translateY(0); }

    .lp-reveal-scale {
      opacity: 0;
      transform: scale(0.95) translateY(14px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .lp-reveal-scale.lp-in { opacity: 1; transform: scale(1) translateY(0); }

    .lp-reveal-line {
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1);
    }
    .lp-reveal-line.lp-in { transform: scaleX(1); }
    .lp-d2 { transition-delay: 0.15s !important; }
    .lp-d3 { transition-delay: 0.24s !important; }
    .lp-d4 { transition-delay: 0.34s !important; }
    .lp-d5 { transition-delay: 0.45s !important; }
    .lp-d6 { transition-delay: 0.56s !important; }

    .lp-mono {
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-feature-settings: "ss01", "cv11";
    }

    .lp-btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 22px;
      background: ${PALETTE.primary};
      color: ${PALETTE.primaryDeep};
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      font-size: 14px; font-weight: 700; letter-spacing: -0.01em;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.5),
        0 1px 0 rgba(0,0,0,0.4),
        0 0 0 0 rgba(86,141,255,0.0);
      transition: box-shadow 220ms ease, transform 180ms ease, background 200ms ease;
    }
    .lp-btn-primary:hover {
      transform: translateY(-1px);
      background: #c4d4ff;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.6),
        0 6px 24px rgba(86,141,255,0.35),
        0 0 0 1px rgba(176,198,255,0.5);
    }
    .lp-btn-primary:active { transform: translateY(0); }

    .lp-btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.02);
      color: ${PALETTE.textMuted};
      border: 1px solid ${PALETTE.border};
      border-radius: 12px;
      font-size: 14px; font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
    }
    .lp-btn-ghost:hover {
      color: ${PALETTE.text};
      border-color: ${PALETTE.borderStrong};
      background: rgba(255,255,255,0.04);
    }

    .lp-card {
      background: linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%);
      border: 1px solid ${PALETTE.borderSoft};
      border-radius: 18px;
      transition: border-color 240ms ease, transform 240ms ease, box-shadow 240ms ease;
      position: relative;
    }
    .lp-card::before {
      content: "";
      position: absolute; inset: 0;
      border-radius: 18px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(176,198,255,0.0), rgba(176,198,255,0.0));
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      transition: background 280ms ease;
      pointer-events: none;
    }
    .lp-card:hover {
      transform: translateY(-3px);
      border-color: ${PALETTE.border};
      box-shadow: 0 20px 60px -12px rgba(0,0,0,0.5);
    }
    .lp-card:hover::before {
      background: linear-gradient(135deg, rgba(176,198,255,0.35), rgba(86,141,255,0.0));
    }

    .lp-link {
      color: ${PALETTE.textMuted};
      font-size: 13.5px; font-weight: 500;
      cursor: pointer;
      transition: color 160ms ease;
      letter-spacing: -0.005em;
    }
    .lp-link:hover { color: ${PALETTE.text}; }

    .lp-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${PALETTE.textDim};
    }
    .lp-eyebrow::before {
      content: ""; display: inline-block;
      width: 18px; height: 1px;
      background: ${PALETTE.borderStrong};
    }

    /* Hero gradient text */
    .lp-grad {
      background: linear-gradient(
        92deg,
        ${PALETTE.text} 0%,
        ${PALETTE.primary} 38%,
        ${PALETTE.primaryStrong} 62%,
        ${PALETTE.text} 100%
      );
      background-size: 220% auto;
      -webkit-background-clip: text;
              background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: lp-shimmer 9s linear infinite;
    }

    /* Dot grid (echoes the canvas surface inside the app) */
    .lp-dots {
      background-image: radial-gradient(circle, rgba(220,225,251,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
      background-position: 14px 14px;
    }

    /* Chip */
    .lp-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 11px 5px 9px;
      background: rgba(176,198,255,0.07);
      border: 1px solid rgba(176,198,255,0.18);
      border-radius: 100px;
      font-size: 11.5px; font-weight: 600;
      color: ${PALETTE.primary};
      letter-spacing: 0.04em;
    }

    .lp-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${PALETTE.border}, transparent);
    }
  `}</style>
);

/* ── Canvas preview — mirrors the actual in-app canvas ─────────────────── */
const CANVAS_STROKE = "#ffffff";
const CANVAS_ARROW = "#a855f7";
const CANVAS_SURFACE = "#151b2d";
const STICKY_FILL = "#FEF3C7";
const STICKY_STROKE = "#FCD34D";
const STICKY_TEXT = "#1f2937";

const RailSep = () => (
  <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
);

const RailIcon = ({
  d,
  active = false,
  size = 13,
}: {
  d: string | string[];
  active?: boolean;
  size?: number;
}) => {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 7,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: active ? "rgba(176,198,255,0.14)" : "transparent",
      color: active ? PALETTE.primary : PALETTE.textDim,
      boxShadow: active ? "inset 0 0 0 1.5px rgba(176,198,255,0.25)" : "none",
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => <path key={i} d={p} />)}
      </svg>
    </div>
  );
};

const HeaderPillIcon = ({ d, size = 13 }: { d: string | string[]; size?: number }) => {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <div style={{
      width: 22, height: 22, borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: PALETTE.textDim,
    }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths.map((p, i) => <path key={i} d={p} />)}
      </svg>
    </div>
  );
};

const CanvasPreview = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        background: CANVAS_SURFACE,
      }}
    >
      {/* Dot grid — matches CanvasStage (24px white dots @ 6% alpha, 12px offset) */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden
      >
        <defs>
          <pattern
            id="lp-canvas-dots"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            x="12"
            y="12"
          >
            <circle cx="0" cy="0" r="0.9" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-canvas-dots)" />
      </svg>

      {/* ── Top header overlay (mirrors CanvasHeader: 3 floating pills) ── */}
      <div style={{
        position: "absolute", top: 10, left: 10, right: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 8, zIndex: 10,
      }}>
        {/* Left: back / project */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 10px 5px 6px",
          background: "rgba(25,31,49,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}>
          <HeaderPillIcon d="M19 12H5M12 19l-7-7 7-7" />
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)" }} />
          <div style={{
            width: 14, height: 14, borderRadius: 3,
            background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryStrong})`,
            marginLeft: 4,
          }} />
          <span style={{
            fontSize: 12, fontWeight: 700, color: PALETTE.text,
            letterSpacing: "-0.015em",
          }}>
            Q2 Planning
          </span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
               stroke={PALETTE.textDim} strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2 }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Center: zoom controls */}
        <div style={{
          display: "flex", alignItems: "center", gap: 0,
          padding: "3px 4px",
          background: "rgba(25,31,49,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
        }}>
          <div style={{
            width: 20, height: 20, color: PALETTE.textDim, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500,
          }}>−</div>
          <span style={{
            width: 40, fontSize: 11, color: PALETTE.textDim, fontWeight: 600,
            textAlign: "center", fontVariantNumeric: "tabular-nums",
          }}>100%</span>
          <div style={{
            width: 20, height: 20, color: PALETTE.textDim, fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500,
          }}>+</div>
        </div>

        {/* Right: undo/redo, avatars, Share, more */}
        <div style={{
          display: "flex", alignItems: "center", gap: 1,
          padding: "5px 6px",
          background: "rgba(25,31,49,0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}>
          <HeaderPillIcon d={["M3 7v6h6", "M3.51 15a9 9 0 1 0 .49-3.96"]} />
          <HeaderPillIcon d={["M21 7v6h-6", "M20.49 15a9 9 0 1 1-.49-3.96"]} />
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
          {/* Avatars */}
          <div style={{ display: "flex", marginRight: 4 }}>
            {([
              ["MK", PALETTE.primary],
              ["MC", PALETTE.primaryStrong],
              ["JL", PALETTE.warm],
            ] as const).map(([label, color], i) => (
              <div key={label} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: color,
                color: PALETTE.primaryDeep,
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${PALETTE.surfaceHi}`,
                marginLeft: i === 0 ? 0 : -5,
                position: "relative", zIndex: 3 - i,
              }}>{label}</div>
            ))}
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", margin: "0 3px" }} />
          {/* Share button (matches bg-primary-container) */}
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px",
            background: PALETTE.primary,
            color: PALETTE.primaryDeep,
            fontSize: 11, fontWeight: 700,
            borderRadius: 9,
            letterSpacing: "0.01em",
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            Share
          </div>
          <div style={{
            width: 22, height: 22, display: "flex",
            alignItems: "center", justifyContent: "center", color: PALETTE.textDim,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Flowchart (white-stroked shapes + solid purple arrows) ── */}
      <svg
        viewBox="0 0 600 440"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
        }}
      >
        <defs>
          <marker
            id="lp-flow-arrow"
            viewBox="0 0 10 10"
            refX="9" refY="5"
            markerWidth="5" markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={CANVAS_ARROW} />
          </marker>
        </defs>

        {/* Connectors — solid purple, orthogonal */}
        <path d="M 300 124 L 300 168" stroke={CANVAS_ARROW}
              strokeWidth="1.6" fill="none" markerEnd="url(#lp-flow-arrow)" />
        <path d="M 300 248 L 300 282" stroke={CANVAS_ARROW}
              strokeWidth="1.6" fill="none" markerEnd="url(#lp-flow-arrow)" />
        <path
          d="M 300 358 L 300 388"
          stroke={CANVAS_ARROW}
          strokeWidth="1.6"
          fill="none"
          markerEnd="url(#lp-flow-arrow)"
          strokeDasharray="240"
          style={{ animation: "lp-draw 3.2s ease-in-out infinite" }}
        />
        {/* Process → Sticky */}
        <path d="M 360 208 L 416 208" stroke={CANVAS_ARROW}
              strokeWidth="1.6" fill="none" markerEnd="url(#lp-flow-arrow)" />

        {/* Start: terminal (oval) */}
        <ellipse cx="300" cy="100" rx="68" ry="22"
                 fill="transparent" stroke={CANVAS_STROKE} strokeWidth="2" />
        <text x="300" y="105" textAnchor="middle" fill={CANVAS_STROKE}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="500">
          Start meeting
        </text>

        {/* Present flowchart: rectangle */}
        <rect x="240" y="168" width="120" height="80"
              fill="transparent" stroke={CANVAS_STROKE} strokeWidth="2" />
        <text x="300" y="200" textAnchor="middle" fill={CANVAS_STROKE}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="500">
          Present
        </text>
        <text x="300" y="218" textAnchor="middle" fill={CANVAS_STROKE}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="500">
          flowchart
        </text>

        {/* Decision: diamond */}
        <polygon points="300,282 364,320 300,358 236,320"
                 fill="transparent" stroke={CANVAS_STROKE} strokeWidth="2" />
        <text x="300" y="324" textAnchor="middle" fill={CANVAS_STROKE}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="500">
          Approved?
        </text>

        {/* End: terminal (oval) */}
        <ellipse cx="300" cy="408" rx="56" ry="20"
                 fill="transparent" stroke={CANVAS_STROKE} strokeWidth="2" />
        <text x="300" y="413" textAnchor="middle" fill={CANVAS_STROKE}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="500">
          Ship it
        </text>

        {/* Sticky note (yellow, dark text — matches STICKY_FILL/STROKE) */}
        <rect x="416" y="160" width="138" height="96" rx="6"
              fill={STICKY_FILL} stroke={STICKY_STROKE} strokeWidth="1.5" />
        <text x="430" y="184" fill={STICKY_TEXT}
              fontSize="13" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Notes
        </text>
        <text x="430" y="208" fill={STICKY_TEXT}
              fontSize="11.5" fontFamily="var(--font-plus-jakarta-sans)">
          Review before
        </text>
        <text x="430" y="224" fill={STICKY_TEXT}
              fontSize="11.5" fontFamily="var(--font-plus-jakarta-sans)">
          client sign-off
        </text>
      </svg>

      {/* Cursor A — mia */}
      <div style={{
        position: "absolute", top: "44%", left: "30%",
        animation: "lp-cursor-a 8s ease-in-out infinite",
        pointerEvents: "none", zIndex: 12,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.primaryStrong}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="lp-mono" style={{
          background: PALETTE.primaryStrong, color: "#fff",
          fontSize: 10, fontWeight: 600, padding: "2px 7px",
          borderRadius: 6, marginTop: 2, whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          mia
        </div>
      </div>

      {/* Cursor B — jake */}
      <div style={{
        position: "absolute", top: "60%", left: "55%",
        animation: "lp-cursor-b 11s ease-in-out infinite",
        pointerEvents: "none", zIndex: 12,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.warm}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="lp-mono" style={{
          background: PALETTE.warm, color: "#3a0d09",
          fontSize: 10, fontWeight: 700, padding: "2px 7px",
          borderRadius: 6, marginTop: 2, whiteSpace: "nowrap",
          letterSpacing: "0.02em",
        }}>
          jake
        </div>
      </div>

      {/* ── Bottom-center toolbar pill (mirrors apps/web/components/toolbar.tsx) ── */}
      <div style={{
        position: "absolute", left: "50%", bottom: 14,
        transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 0,
        padding: "5px 6px",
        background: "rgba(25,31,49,0.85)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
        zIndex: 11,
      }}>
        {/* Cursor (active) + Hand */}
        <RailIcon d="M5 3l14 9-7 1-4 7z" active />
        <RailIcon d={[
          "M18 11V6a2 2 0 0 0-4 0",
          "M14 10V4a2 2 0 0 0-4 0v7",
          "M10 10.5V6a2 2 0 0 0-4 0v8",
          "M18 11a2 2 0 0 1 4 0v5a8 8 0 0 1-8 8h-2c-2.5 0-4-1-5.5-3l-3-4.5a2 2 0 0 1 3-2.5L8 15",
        ]} />
        <RailSep />
        {/* Quick shapes: process / decision / terminal / I-O */}
        <RailIcon d="M3 5h18v14H3z" />
        <RailIcon d="M12 2l10 10-10 10L2 12z" />
        <RailIcon d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0" />
        <RailIcon d="M6 4h16l-4 16H2z" />
        {/* Shape selector chevron */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 4px", color: PALETTE.textDim,
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="3"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <RailSep />
        {/* Pen / Arrow / Text */}
        <RailIcon d="M15.232 5.232l3.536 3.536M9 13l-4 4V13h4zm6-6l-6 6" />
        <RailIcon d={["M5 12h14", "M12 5l7 7-7 7"]} />
        <RailIcon d="M4 7V4h16v3M9 20h6M12 4v16" />
        <RailSep />
        {/* Sticky / Image */}
        <RailIcon d="M5 3h14a2 2 0 0 1 2 2v14l-5 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
        <RailIcon d={[
          "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
          "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
          "M21 15l-5-5L5 21",
        ]} />
      </div>

      {/* Soft vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 110%, rgba(86,141,255,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

export default function LandingPageView() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  useReveal();

  const handleGuestEntry = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  /* keep a ticking value to subtly animate ambient elements */
  const [, setT] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setT((x) => x + 1), 800);
    return () => clearInterval(iv);
  }, []);

  const features = [
    {
      icon: <PathIcon d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
      title: "Zero-lag co-editing",
      desc: "Yjs CRDT under the hood. Strokes, shapes, and labels merge instantly across continents — no flicker, no conflict.",
      color: PALETTE.primary,
    },
    {
      icon: <PathIcon d="M3 5h18v11H3z M8 21h8 M12 16v5" />,
      title: "Present mode",
      desc: "One key drops you into focus. Audience viewports follow yours in real time — no screens to share, no awkward windows.",
      color: PALETTE.primaryStrong,
    },
    {
      icon: <PathIcon d="M3 5h18v14H3z M3 10h18 M9 5v14" />,
      title: "Flowchart toolkit",
      desc: "Process boxes, decision diamonds, swimlanes, sticky notes, freehand ink, and snap-to-grid — built for systems thinkers.",
      color: PALETTE.tertiary,
    },
    {
      icon: <PathIcon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
      title: "Comments on canvas",
      desc: "Threads anchor to shapes, not pages. Argue, agree, and resolve where the work actually lives.",
      color: PALETTE.warm,
    },
    {
      icon: <PathIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
      title: "Export anywhere",
      desc: "PNG, SVG, PDF in one click. Or share a live read-only link for stakeholders who just need to peek.",
      color: PALETTE.amber,
    },
    {
      icon: <PathIcon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
      title: "Workspaces & SSO",
      desc: "OAuth via Google or GitHub. Role-based access. SAML SSO and audit logs on the Team plan.",
      color: PALETTE.mint,
    },
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      role: "Product Lead",
      text: "We replaced Miro for sprint planning. CanvUs is snappier, and Present Mode actually works during standups.",
      avatar: "SK",
      color: PALETTE.primary,
    },
    {
      name: "David R.",
      role: "Engineering Manager",
      text: "Architecture reviews went from two hours of confusion to forty-five minutes of clarity. Everyone edits, everyone sees.",
      avatar: "DR",
      color: PALETTE.primaryStrong,
    },
    {
      name: "Ana M.",
      role: "Senior Designer",
      text: "Sticky notes that anchor to shapes. That alone is worth switching. No more 'where was that comment?'.",
      avatar: "AM",
      color: PALETTE.warm,
    },
  ];

  return (
    <div
      className="lp-root"
      style={{
        background: PALETTE.bg,
        color: PALETTE.text,
        fontFamily: "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui",
        overflowX: "hidden",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <GlobalStyles />

      {/* ── Ambient background ───────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Top-right halo */}
        <div style={{
          position: "absolute",
          top: -180, right: -120,
          width: 720, height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(86,141,255,0.18) 0%, rgba(86,141,255,0.04) 38%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        {/* Mid-left halo */}
        <div style={{
          position: "absolute",
          top: "30%", left: "-15%",
          width: 580, height: 580,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(176,198,255,0.10) 0%, transparent 65%)",
          filter: "blur(50px)",
        }} />
        {/* Vignette / floor light */}
        <div style={{
          position: "absolute",
          bottom: -200, left: "50%",
          transform: "translateX(-50%)",
          width: 1200, height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at center, rgba(86,141,255,0.08) 0%, transparent 60%)",
          filter: "blur(60px)",
        }} />
      </div>

      {/* ── NAV ──────────────────────────────────────────────────────── */}
      <nav style={{ position: "fixed", top: 14, left: 0, right: 0, zIndex: 100, padding: "0 16px" }}>
        <div
          style={{
            maxWidth: 1180, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(21,27,45,0.55)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "10px 12px 10px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Logo */}
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Logo />
            <span style={{
              fontSize: 16, fontWeight: 800, color: PALETTE.text,
              letterSpacing: "-0.02em",
            }}>
              CanvUs
            </span>
            <span className="lp-mono" style={{
              fontSize: 9.5, fontWeight: 600,
              color: PALETTE.primary,
              padding: "2px 6px",
              border: "1px solid rgba(176,198,255,0.25)",
              borderRadius: 5,
              letterSpacing: "0.08em",
              marginLeft: 2,
            }}>
              BETA
            </span>
          </a>

          {/* Links */}
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/features" className="lp-link" style={{ textDecoration: "none" }}>
              Features
            </Link>
            <Link href="/how-it-works" className="lp-link" style={{ textDecoration: "none" }}>
              How it works
            </Link>
            <span className="lp-link">Changelog</span>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/sign-in" className="lp-link" style={{ padding: "6px 12px", textDecoration: "none" }}>Sign in</Link>
            <button
              type="button"
              onClick={handleGuestEntry}
              className="lp-link"
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              Continue as guest
            </button>
            <Link href="/sign-up" className="lp-btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
              Open canvas
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        paddingTop: 132, paddingBottom: 64,
      }}>
        {/* Hero dot grid */}
        <div className="lp-dots" style={{
          position: "absolute", inset: 0,
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          opacity: 0.7, pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1180, margin: "0 auto", padding: "0 24px",
          display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 56,
          alignItems: "center", position: "relative",
        }}>
          {/* Copy */}
          <div>
            <div className="lp-fade lp-chip">
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: PALETTE.mint, boxShadow: `0 0 8px ${PALETTE.mint}`,
              }} />
              <span className="lp-mono" style={{ letterSpacing: "0.12em" }}>
                v1.0 · OPEN SOURCE · FREE FOREVER
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(40px, 5.6vw, 68px)",
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              fontWeight: 800,
              color: PALETTE.text,
              margin: "26px 0 22px",
            }}>
              <span style={{ display: "block" }}>
                {["The", "canvas"].map((w, i) => (
                  <span key={w} style={{
                    display: "inline-block",
                    animation: `lp-word-up 0.6s ${0.08 + i * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
                    marginRight: "0.25em",
                  }}>{w}</span>
                ))}
              </span>
              <span style={{ display: "block" }}>
                {["your", "team", "can"].map((w, i) => (
                  <span key={w} style={{
                    display: "inline-block",
                    animation: `lp-word-up 0.6s ${0.28 + i * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
                    marginRight: "0.25em",
                  }}>{w}</span>
                ))}
                <span className="lp-grad" style={{
                  fontStyle: "italic",
                  display: "inline-block",
                  animation: "lp-word-up 0.6s 0.58s cubic-bezier(0.16,1,0.3,1) both",
                }}>
                  actually
                </span>
              </span>
              <span style={{ display: "block" }}>
                {["think", "on."].map((w, i) => (
                  <span key={w} style={{
                    display: "inline-block",
                    animation: `lp-word-up 0.6s ${0.68 + i * 0.1}s cubic-bezier(0.16,1,0.3,1) both`,
                    marginRight: i === 0 ? "0.25em" : 0,
                  }}>{w}</span>
                ))}
              </span>
            </h1>

            <p className="lp-fade-2" style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: PALETTE.textMuted,
              maxWidth: 460,
              marginBottom: 32,
              fontWeight: 400,
            }}>
              Real-time collaborative whiteboards designed for meetings.
              Everyone edits at once — sub-50ms sync, conflict-free, no tabs to juggle.
            </p>

            <div className="lp-fade-3" style={{
              display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14,
            }}>
              <Link href="/sign-up" className="lp-btn-primary" style={{ textDecoration: "none" }}>
                Start a free board
                <ArrowIcon />
              </Link>
              <button className="lp-btn-ghost">
                <PlayIcon />
                Watch 90-sec demo
              </button>
            </div>

            <div className="lp-fade-3" style={{ marginBottom: 30 }}>
              <button
                type="button"
                onClick={handleGuestEntry}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: PALETTE.primary,
                  fontSize: 13.5,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  font: "inherit",
                }}
              >
                Continue as guest →
              </button>
            </div>

            <div className="lp-fade-4" style={{
              display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap",
            }}>
              {["No credit card", "Up to 3 boards free", "Unlimited guests"].map((t) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <CheckIcon color={PALETTE.primary} />
                  <span style={{ fontSize: 13, color: PALETTE.textDim, fontWeight: 500 }}>
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated preview */}
          <div className="lp-fade-2" style={{ position: "relative" }}>
            {/* Aura */}
            <div style={{
              position: "absolute", inset: -40,
              background:
                "radial-gradient(ellipse at 60% 50%, rgba(86,141,255,0.22) 0%, transparent 65%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }} />

            {/* Window */}
            <div style={{
              position: "relative",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(176,198,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
              height: 480,
              background: PALETTE.surface,
            }}>
              {/* Chrome */}
              <div style={{
                background: PALETTE.surfaceHi,
                padding: "10px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                    <div key={c} style={{
                      width: 11, height: 11, borderRadius: "50%",
                      background: c, opacity: 0.85,
                    }} />
                  ))}
                </div>
                <div className="lp-mono" style={{
                  flex: 1,
                  background: "rgba(7,13,31,0.7)",
                  borderRadius: 7,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: PALETTE.textDim,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}>
                  canv.us/board/team-q2-planning
                </div>
                <div className="lp-mono" style={{
                  fontSize: 10, color: PALETTE.textFaint,
                  letterSpacing: "0.1em", fontWeight: 600,
                }}>
                  ⌘K
                </div>
              </div>
              <div style={{ height: "calc(100% - 39px)" }}>
                <CanvasPreview />
              </div>
            </div>

            {/* Floating: live users — sits well below the window, clear of the bottom toolbar */}
            <div style={{
              position: "absolute", bottom: -34, left: -28,
              background: PALETTE.surfaceHi,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "9px 13px",
              display: "flex", alignItems: "center", gap: 9,
              boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
              animation: "lp-float 4s ease-in-out infinite",
            }}>
              <div style={{ position: "relative", width: 9, height: 9 }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: PALETTE.mint }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: PALETTE.mint,
                  animation: "lp-pulse 1.5s ease-out infinite",
                }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: PALETTE.text }}>
                3 people editing
              </span>
            </div>

            {/* Floating: latency — pop-out chip above the window, mirrors the editing chip below */}
            <div style={{
              position: "absolute", top: -22, right: 28,
              background: PALETTE.surfaceHi,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "7px 12px",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
              animation: "lp-float 5s 1.2s ease-in-out infinite",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: PALETTE.primaryStrong,
                boxShadow: `0 0 8px ${PALETTE.primaryStrong}`,
              }} />
              <span className="lp-mono" style={{ fontSize: 11, fontWeight: 600, color: PALETTE.text, letterSpacing: "0.04em" }}>
                42<span style={{ color: PALETTE.textDim }}>ms</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px 80px",
        maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          gap: 60, marginBottom: 56, alignItems: "end",
        }}>
          <div>
            <div className="lp-eyebrow lp-reveal">Capabilities</div>
            <h2 className="lp-reveal lp-d1" style={{
              fontSize: "clamp(30px, 3.6vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: PALETTE.text,
              marginTop: 16,
            }}>
              A focused tool
              <br />
              for idea-driven work.
            </h2>
          </div>
          <p className="lp-reveal lp-d2" style={{
            fontSize: 16,
            color: PALETTE.textMuted,
            lineHeight: 1.65,
            maxWidth: 540,
            justifySelf: "end",
          }}>
            Not another whiteboard with a shape library bolted on.
            CanvUs is built around how teams actually meet, present, and decide.
            Every feature exists to remove friction from that loop.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: 14,
        }}>
          {features.map((f, i) => {
            const isActive = activeFeature === i;
            return (
            <div
              key={i}
              className={`lp-card lp-reveal-scale lp-d${(i % 3) + 1}`}
              onMouseEnter={() => setActiveFeature(i)}
              style={{
                padding: 26,
                borderColor: isActive ? `${f.color}70` : undefined,
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${f.color}1a`,
                border: `1px solid ${f.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: f.color, marginBottom: 18,
              }}>
                {f.icon}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 8,
              }}>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: PALETTE.text,
                }}>
                  {f.title}
                </h3>
                <span className="lp-mono" style={{
                  fontSize: 9.5, color: PALETTE.textFaint,
                  letterSpacing: "0.08em", fontWeight: 600,
                  marginLeft: "auto",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p style={{
                fontSize: 13.5, color: PALETTE.textMuted,
                lineHeight: 1.65, fontWeight: 400,
              }}>
                {f.desc}
              </p>
            </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "80px 24px",
        background: `linear-gradient(180deg, transparent 0%, ${PALETTE.bgDeep} 50%, transparent 100%)`,
      }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="lp-eyebrow lp-reveal" style={{ justifyContent: "center" }}>How it works</div>
            <h2 className="lp-reveal lp-d1" style={{
              fontSize: "clamp(28px, 3.6vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: PALETTE.text,
              marginTop: 16,
            }}>
              From invite to insight
              <br />
              in under sixty seconds.
            </h2>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20, position: "relative",
          }}>
            {/* Connector line */}
            <div className="lp-reveal-line" style={{
              position: "absolute",
              top: 24, left: "16%", right: "16%",
              height: 1,
              background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.primaryStrong}, ${PALETTE.tertiary})`,
              opacity: 0.4,
            }} />

            {[
              { n: "01", t: "Create a board",   d: "Sign in with Google or GitHub. Name your board, pick a template, start in seconds.", c: PALETTE.primary },
              { n: "02", t: "Invite your team", d: "Share a link. Everyone joins with their name and color. No installs. No accounts to wrangle.", c: PALETTE.primaryStrong },
              { n: "03", t: "Build & present", d: "Drag shapes, draw connections, pin notes. Press P to project — viewers follow your cursor live.", c: PALETTE.tertiary },
            ].map((s, si) => (
              <div key={s.n} className={`lp-reveal lp-d${si + 1}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", padding: "0 18px",
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: PALETTE.bg,
                  border: `1.5px solid ${s.c}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 22, position: "relative", zIndex: 1,
                  boxShadow: `0 0 0 4px ${PALETTE.bgDeep}, 0 0 20px ${s.c}40`,
                }}>
                  <span className="lp-mono" style={{
                    fontSize: 13, fontWeight: 700,
                    color: s.c, letterSpacing: "0.05em",
                  }}>
                    {s.n}
                  </span>
                </div>
                <h3 style={{
                  fontSize: 17, fontWeight: 700,
                  color: PALETTE.text, marginBottom: 10,
                  letterSpacing: "-0.015em",
                }}>
                  {s.t}
                </h3>
                <p style={{
                  fontSize: 14, color: PALETTE.textMuted,
                  lineHeight: 1.65, maxWidth: 280,
                }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px",
        maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{ marginBottom: 48 }}>
          <div className="lp-eyebrow lp-reveal">Voices</div>
          <h2 className="lp-reveal lp-d1" style={{
            fontSize: "clamp(28px, 3.6vw, 42px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: PALETTE.text,
            marginTop: 16,
            maxWidth: 700,
          }}>
            Designers, PMs, and engineers
            <br />
            quietly switching from Miro.
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16,
        }}>
          {testimonials.map((t, i) => (
            <div key={i} className={`lp-card lp-reveal-scale lp-d${i + 1}`} style={{ padding: 28 }}>
              <svg width="22" height="18" viewBox="0 0 24 20"
                   fill={t.color} style={{ marginBottom: 14, opacity: 0.85 }}>
                <path d="M3 16c0-4 2-7 5-9l1 2c-2 1-3 3-3 5h3v6H3v-4zm10 0c0-4 2-7 5-9l1 2c-2 1-3 3-3 5h3v6h-6v-4z" />
              </svg>
              <p style={{
                fontSize: 15, color: PALETTE.text,
                lineHeight: 1.6, marginBottom: 22, fontWeight: 400,
                letterSpacing: "-0.005em",
              }}>
                {t.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: t.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11.5, fontWeight: 700, color: PALETTE.primaryDeep,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: PALETTE.text }}>
                    {t.name}
                  </div>
                  <div className="lp-mono" style={{
                    fontSize: 11, color: PALETTE.textDim,
                    letterSpacing: "0.04em", marginTop: 1,
                  }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BIG CTA ──────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "120px 24px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(86,141,255,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Orbiting ring */}
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          border: `1px dashed ${PALETTE.borderSoft}`,
          animation: "lp-orbit 60s linear infinite",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div className="lp-chip lp-reveal" style={{ marginBottom: 24 }}>
            <span className="lp-mono" style={{ letterSpacing: "0.12em" }}>
              FREE FOREVER · NO CARD REQUIRED
            </span>
          </div>
          <h2 className="lp-reveal lp-d1" style={{
            fontSize: "clamp(36px, 5.6vw, 64px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: PALETTE.text,
            lineHeight: 1.02,
            marginBottom: 18,
          }}>
            Your next idea
            <br />
            starts on a{" "}
            <span className="lp-grad" style={{ fontStyle: "italic" }}>blank board.</span>
          </h2>
          <p className="lp-reveal lp-d2" style={{
            fontSize: 17,
            color: PALETTE.textMuted,
            maxWidth: 480,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}>
            Open the canvas, invite your team, and ship a flowchart before
            your standup ends.
          </p>
          <div className="lp-reveal lp-d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="lp-btn-primary" style={{ fontSize: 15, padding: "14px 28px", textDecoration: "none" }}>
              Open the canvas
              <ArrowIcon />
            </Link>
            <button className="lp-btn-ghost" style={{ fontSize: 14 }}>
              Schedule a demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: `1px solid ${PALETTE.borderSoft}`,
        padding: "48px 24px 32px",
      }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
          gap: 40, marginBottom: 36,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Logo />
              <span style={{ fontSize: 15, fontWeight: 800, color: PALETTE.text, letterSpacing: "-0.02em" }}>
                CanvUs
              </span>
            </div>
            <p style={{
              fontSize: 13, color: PALETTE.textDim,
              lineHeight: 1.6, maxWidth: 320,
            }}>
              The canvas your team can actually think on.
              Built in Manila & Berlin, shipping from anywhere.
            </p>
          </div>
          {[
            { title: "Product", links: ["Features", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
            { title: "Resources", links: ["Docs", "API", "Status", "Community"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="lp-mono" style={{
                fontSize: 11, color: PALETTE.textFaint,
                letterSpacing: "0.16em", textTransform: "uppercase",
                fontWeight: 600, marginBottom: 16,
              }}>
                {col.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <span key={l} className="lp-link">{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lp-divider" style={{ marginBottom: 22 }} />

        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16,
        }}>
          <span className="lp-mono" style={{
            fontSize: 11, color: PALETTE.textFaint,
            letterSpacing: "0.06em",
          }}>
            © 2026 CanvUs · All systems operational
            <span style={{
              display: "inline-block", width: 7, height: 7,
              borderRadius: "50%", background: PALETTE.mint,
              boxShadow: `0 0 6px ${PALETTE.mint}`,
              marginLeft: 8, verticalAlign: "middle",
            }} />
          </span>
          <div style={{ display: "flex", gap: 18 }}>
            {["Privacy", "Terms", "Security", "GitHub"].map((l) => (
              <span key={l} className="lp-link" style={{ fontSize: 12 }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Tiny icon primitives ─────────────────────────────────────────────── */
function PathIcon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="1.6"
         strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((part, i) => (
        <path key={i} d={i === 0 ? part : "M" + part} />
      ))}
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" strokeWidth="2.2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CheckIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke={color} strokeWidth="2.6"
         strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0, marginTop: 2 }}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Logo() {
  return <CanvusMark size={28} />;
}
