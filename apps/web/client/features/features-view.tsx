"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PALETTE } from "@/client/landing-page/palette";
import { startGuestSession } from "@/lib/guest";
import { CanvusMark } from "@/client/brand/CanvusMark";

/* ────────────────────────────────────────────────────────────────────────────
   CanvUs — Features
   Same editorial-tech language as Landing & How-it-works:
   dark navy, lavender-blue glow, glass nav, dot-grid, mono labels.
   Goal here is *depth* — every capability surfaced in one place.
   ──────────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".ft-reveal, .ft-reveal-scale, .ft-reveal-line");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("ft-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const GlobalStyles = () => (
  <style>{`
    .ft-root *, .ft-root *::before, .ft-root *::after { box-sizing: border-box; }
    .ft-root { scroll-behavior: smooth; }

    @keyframes ft-fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ft-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-5px); }
    }
    @keyframes ft-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes ft-orbit {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    @keyframes ft-dash {
      to { stroke-dashoffset: -240; }
    }
    @keyframes ft-pulse-soft {
      0%, 100% { opacity: 0.4; }
      50%      { opacity: 1;   }
    }
    @keyframes ft-pulse-ring {
      0%   { transform: scale(0.85); opacity: 0.9; }
      100% { transform: scale(2.2);  opacity: 0;   }
    }
    @keyframes ft-cursor-loop {
      0%   { transform: translate(0, 0); }
      30%  { transform: translate(38px, 22px); }
      60%  { transform: translate(-12px, 44px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes ft-bar-grow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }

    .ft-fade   { animation: ft-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
    .ft-fade-1 { animation: ft-fadeUp 0.8s 0.08s cubic-bezier(0.16,1,0.3,1) both; }
    .ft-fade-2 { animation: ft-fadeUp 0.8s 0.20s cubic-bezier(0.16,1,0.3,1) both; }
    .ft-fade-3 { animation: ft-fadeUp 0.8s 0.32s cubic-bezier(0.16,1,0.3,1) both; }

    .ft-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
    }
    .ft-reveal.ft-in { opacity: 1; transform: translateY(0); }
    .ft-reveal-scale {
      opacity: 0;
      transform: scale(0.95) translateY(14px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .ft-reveal-scale.ft-in { opacity: 1; transform: scale(1) translateY(0); }
    .ft-reveal-line {
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1);
    }
    .ft-reveal-line.ft-in { transform: scaleX(1); }
    .ft-d1 { transition-delay: 0.08s !important; }
    .ft-d2 { transition-delay: 0.18s !important; }
    .ft-d3 { transition-delay: 0.30s !important; }
    .ft-d4 { transition-delay: 0.42s !important; }
    .ft-d5 { transition-delay: 0.54s !important; }
    .ft-d6 { transition-delay: 0.66s !important; }

    .ft-mono {
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-feature-settings: "ss01", "cv11";
    }

    .ft-btn-primary {
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
        0 1px 0 rgba(0,0,0,0.4);
      transition: box-shadow 220ms ease, transform 180ms ease, background 200ms ease;
    }
    .ft-btn-primary:hover {
      transform: translateY(-1px);
      background: #c4d4ff;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.6),
        0 6px 24px rgba(86,141,255,0.35),
        0 0 0 1px rgba(176,198,255,0.5);
    }
    .ft-btn-primary:active { transform: translateY(0); }

    .ft-btn-ghost {
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
    .ft-btn-ghost:hover {
      color: ${PALETTE.text};
      border-color: ${PALETTE.borderStrong};
      background: rgba(255,255,255,0.04);
    }

    .ft-card {
      background: linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%);
      border: 1px solid ${PALETTE.borderSoft};
      border-radius: 18px;
      transition: border-color 240ms ease, transform 240ms ease, box-shadow 240ms ease;
      position: relative;
    }
    .ft-card:hover {
      transform: translateY(-3px);
      border-color: ${PALETTE.border};
      box-shadow: 0 20px 60px -12px rgba(0,0,0,0.5);
    }

    .ft-link {
      color: ${PALETTE.textMuted};
      font-size: 13.5px; font-weight: 500;
      cursor: pointer;
      transition: color 160ms ease;
      letter-spacing: -0.005em;
      text-decoration: none;
    }
    .ft-link:hover { color: ${PALETTE.text}; }

    .ft-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${PALETTE.textDim};
    }
    .ft-eyebrow::before {
      content: ""; display: inline-block;
      width: 18px; height: 1px;
      background: ${PALETTE.borderStrong};
    }

    .ft-grad {
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
      animation: ft-shimmer 9s linear infinite;
    }

    .ft-dots {
      background-image: radial-gradient(circle, rgba(220,225,251,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
      background-position: 14px 14px;
    }

    .ft-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 11px 5px 9px;
      background: rgba(176,198,255,0.07);
      border: 1px solid rgba(176,198,255,0.18);
      border-radius: 100px;
      font-size: 11.5px; font-weight: 600;
      color: ${PALETTE.primary};
      letter-spacing: 0.04em;
    }

    .ft-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${PALETTE.border}, transparent);
    }

    .ft-kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 22px; height: 22px; padding: 0 6px;
      background: rgba(7,13,31,0.7);
      border: 1px solid ${PALETTE.border};
      border-bottom-width: 2px;
      border-radius: 5px;
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-size: 10.5px; font-weight: 600;
      color: ${PALETTE.text};
    }

    .ft-tab {
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 13px; font-weight: 600;
      letter-spacing: -0.005em;
      color: ${PALETTE.textDim};
      cursor: pointer;
      border: 1px solid transparent;
      background: transparent;
      transition: color 160ms ease, background 200ms ease, border-color 200ms ease;
      white-space: nowrap;
    }
    .ft-tab:hover { color: ${PALETTE.text}; }
    .ft-tab[data-active="true"] {
      color: ${PALETTE.text};
      background: rgba(176,198,255,0.08);
      border-color: rgba(176,198,255,0.22);
    }
  `}</style>
);

/* ──────────────────────────────────────────────────────────────────────── */
/* Mock visuals                                                            */
/* ──────────────────────────────────────────────────────────────────────── */

function MockChrome({ url }: { url: string }) {
  return (
    <div style={{
      background: PALETTE.surfaceHi,
      padding: "9px 12px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", gap: 9,
    }}>
      <div style={{ display: "flex", gap: 5 }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: c, opacity: 0.8,
          }} />
        ))}
      </div>
      <div className="ft-mono" style={{
        flex: 1,
        background: "rgba(7,13,31,0.7)",
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 10.5,
        color: PALETTE.textDim,
        fontWeight: 500,
      }}>
        {url}
      </div>
    </div>
  );
}

const mockShellStyle: React.CSSProperties = {
  position: "relative",
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  background: PALETTE.surface,
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(176,198,255,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
};

/* Spotlight: live co-editing in a board */
const SpotlightCollab = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/b/sprint-planning · 4 LIVE" />
    <div style={{
      position: "relative", height: 340,
      background: "radial-gradient(ellipse at 30% 20%, #1a2244 0%, #0c1324 55%, #070d1f 100%)",
      overflow: "hidden",
    }}>
      {/* Dot grid */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
        <defs>
          <pattern id="ft-spot-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="rgba(220,225,251,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ft-spot-dots)" />
      </svg>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {/* boxes */}
        <rect x="40" y="56" width="130" height="46" rx="8"
              fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.2" />
        <text x="105" y="84" textAnchor="middle" fill={PALETTE.primary}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Discovery
        </text>

        <polygon
          points="250,56 312,79 250,102 188,79"
          fill="rgba(188,199,222,0.08)" stroke={PALETTE.tertiary} strokeWidth="1.2"
        />
        <text x="250" y="83" textAnchor="middle" fill={PALETTE.tertiary}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Ship Q2?
        </text>

        <rect x="340" y="56" width="130" height="46" rx="8"
              fill="rgba(125,211,164,0.08)" stroke={PALETTE.mint} strokeWidth="1.2" />
        <text x="405" y="84" textAnchor="middle" fill={PALETTE.mint}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Beta launch
        </text>

        {/* connectors */}
        <line x1="170" y1="79" x2="188" y2="79"
              stroke={PALETTE.primary} strokeWidth="1.4" opacity="0.7" />
        <line x1="312" y1="79" x2="340" y2="79"
              stroke={PALETTE.primaryStrong} strokeWidth="1.5"
              strokeDasharray="4,3"
              style={{ animation: "ft-dash 1.4s linear infinite" }} />

        {/* sticky 1 */}
        <rect x="60" y="180" width="138" height="80" rx="4"
              fill="rgba(255,180,84,0.10)" stroke={PALETTE.amber} strokeWidth="1" />
        <text x="74" y="202" fill={PALETTE.amber}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          @mia · 2m
        </text>
        <text x="74" y="222" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.9">
          Confirm scope with
        </text>
        <text x="74" y="238" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.9">
          design before Friday.
        </text>

        {/* sticky 2 */}
        <rect x="232" y="200" width="132" height="64" rx="4"
              fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1" />
        <text x="246" y="222" fill={PALETTE.primary}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          decision
        </text>
        <text x="246" y="240" fill={PALETTE.primary}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.85">
          Cut scope to MVP,
        </text>
        <text x="246" y="254" fill={PALETTE.primary}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.85">
          add polish later.
        </text>

        {/* comment anchor pin */}
        <g transform="translate(390, 100)">
          <circle r="9" fill={PALETTE.warm} opacity="0.95" />
          <text x="0" y="3" textAnchor="middle"
                fontSize="9" fontWeight="800" fill="#3a0d09"
                fontFamily="var(--font-jetbrains-mono)">3</text>
        </g>
      </svg>

      {/* live cursors */}
      <div style={{
        position: "absolute", top: 92, left: 198,
        animation: "ft-cursor-loop 7s ease-in-out infinite",
        pointerEvents: "none",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.primaryStrong}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="ft-mono" style={{
          background: PALETTE.primaryStrong, color: "#fff",
          fontSize: 10, fontWeight: 700, padding: "2px 7px",
          borderRadius: 5, marginTop: 2, whiteSpace: "nowrap",
        }}>marcus</div>
      </div>
      <div style={{
        position: "absolute", top: 178, left: 290,
        animation: "ft-cursor-loop 9s 0.4s ease-in-out infinite reverse",
        pointerEvents: "none",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.warm}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="ft-mono" style={{
          background: PALETTE.warm, color: "#3a0d09",
          fontSize: 10, fontWeight: 800, padding: "2px 7px",
          borderRadius: 5, marginTop: 2, whiteSpace: "nowrap",
        }}>jake</div>
      </div>

      {/* presence pill */}
      <div style={{
        position: "absolute", top: 12, right: 12,
        display: "flex", alignItems: "center", gap: 6,
        background: "rgba(21,27,45,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "5px 10px",
        backdropFilter: "blur(12px)",
      }}>
        {[
          ["MK", PALETTE.primary],
          ["MC", PALETTE.primaryStrong],
          ["JL", PALETTE.warm],
          ["AN", PALETTE.mint],
        ].map(([av, col]) => (
          <div key={av as string} style={{
            width: 22, height: 22, borderRadius: "50%",
            background: col as string,
            fontSize: 9, fontWeight: 800, color: "#0c1324",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${PALETTE.bg}`,
          }}>{av}</div>
        ))}
        <span className="ft-mono" style={{
          fontSize: 10, color: PALETTE.textDim, fontWeight: 600,
          marginLeft: 4, letterSpacing: "0.06em",
        }}>4 LIVE</span>
      </div>

      {/* latency badge */}
      <div style={{
        position: "absolute", bottom: 12, right: 12,
        display: "flex", alignItems: "center", gap: 7,
        background: "rgba(21,27,45,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "5px 10px",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: PALETTE.mint,
          boxShadow: `0 0 8px ${PALETTE.mint}`,
        }} />
        <span className="ft-mono" style={{
          fontSize: 10.5, fontWeight: 700, color: PALETTE.text,
          letterSpacing: "0.04em",
        }}>
          38<span style={{ color: PALETTE.textDim }}>ms sync</span>
        </span>
      </div>
    </div>
  </div>
);

/* Spotlight: 17-shape toolkit */
const SpotlightShapes = () => {
  const shapes: Array<{ name: string; render: React.ReactNode }> = [
    { name: "rect", render: <rect x="6" y="14" width="56" height="36" rx="2" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "rounded", render: <rect x="6" y="14" width="56" height="36" rx="9" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "diamond", render: <polygon points="34,10 60,32 34,54 8,32" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "oval", render: <ellipse cx="34" cy="32" rx="26" ry="18" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "parallelogram", render: <polygon points="14,14 62,14 54,50 6,50" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "trapezoid", render: <polygon points="14,14 54,14 62,50 6,50" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "hexagon", render: <polygon points="20,14 48,14 62,32 48,50 20,50 6,32" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "cylinder", render: (
        <>
          <path d="M6 18 a28 6 0 0 1 56 0 v28 a28 6 0 0 1 -56 0z" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" />
          <ellipse cx="34" cy="18" rx="28" ry="6" fill="none" stroke={PALETTE.primary} strokeWidth="1.3" />
        </>
      ) },
    { name: "document", render: <path d="M6 14 H62 V46 Q48 56 34 46 Q20 36 6 46 Z" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "process", render: (
        <>
          <rect x="6" y="14" width="56" height="36" rx="2" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" />
          <line x1="14" y1="14" x2="14" y2="50" stroke={PALETTE.primary} strokeWidth="1.3" />
          <line x1="54" y1="14" x2="54" y2="50" stroke={PALETTE.primary} strokeWidth="1.3" />
        </>
      ) },
    { name: "manual-input", render: <polygon points="6,22 62,14 62,50 6,50" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "stored-data", render: <path d="M6 32 q6 -22 28 -18 q22 4 28 18 q-6 22 -28 18 q-22 -4 -28 -18z" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "internal-storage", render: (
        <>
          <rect x="6" y="14" width="56" height="36" rx="2" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" />
          <line x1="6" y1="22" x2="62" y2="22" stroke={PALETTE.primary} strokeWidth="1.3" />
          <line x1="14" y1="14" x2="14" y2="50" stroke={PALETTE.primary} strokeWidth="1.3" />
        </>
      ) },
    { name: "circle", render: <circle cx="34" cy="32" r="20" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "off-page", render: <path d="M6 14 H62 V42 L34 54 L6 42 Z" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "delay", render: <path d="M6 14 H50 a18 18 0 0 1 0 36 H6 Z" fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.3" /> },
    { name: "sticky", render: <rect x="8" y="12" width="52" height="40" rx="2" fill="rgba(255,180,84,0.12)" stroke={PALETTE.amber} strokeWidth="1.3" /> },
  ];

  return (
    <div style={mockShellStyle}>
      <MockChrome url="canv.us · toolkit" />
      <div style={{
        padding: 16,
        background: "radial-gradient(ellipse at 50% 20%, #1a2244 0%, #0c1324 60%, #070d1f 100%)",
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 8,
      }}>
        {shapes.map((s, i) => (
          <div key={s.name} style={{
            aspectRatio: "1.18 / 1",
            background: "rgba(7,13,31,0.5)",
            border: `1px solid ${PALETTE.borderSoft}`,
            borderRadius: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "space-between",
            padding: "6px 4px",
            position: "relative",
          }}>
            <svg width="68" height="64" viewBox="0 0 68 64">
              {s.render}
            </svg>
            <div className="ft-mono" style={{
              fontSize: 8.5, color: PALETTE.textFaint,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}>
              {s.name}
            </div>
            <span className="ft-mono" style={{
              position: "absolute", top: 4, left: 6,
              fontSize: 7.5, color: PALETTE.textFaint,
              letterSpacing: "0.06em",
            }}>{String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Spotlight: present mode */
const SpotlightPresent = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/b/roadmap · PRESENT" />
    <div style={{
      position: "relative", height: 320,
      background: "radial-gradient(ellipse at 50% 50%, #1a2244 0%, #0a1020 100%)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        inset: "10% 16%",
        borderRadius: 14,
        border: `1.5px dashed ${PALETTE.primary}55`,
        boxShadow: `0 0 0 9999px rgba(7,13,31,0.55), 0 0 30px ${PALETTE.primaryStrong}30`,
      }} />

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px 32px",
        borderRadius: 14,
        background: "rgba(176,198,255,0.12)",
        border: `1.5px solid ${PALETTE.primary}`,
        color: PALETTE.text,
        fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em",
        boxShadow: `0 0 60px ${PALETTE.primaryStrong}40`,
        textAlign: "center",
      }}>
        Q2 roadmap · 3 themes
        <div className="ft-mono" style={{
          fontSize: 10, marginTop: 6, color: PALETTE.primary,
          letterSpacing: "0.1em", fontWeight: 600,
        }}>
          SLIDE 2 OF 7
        </div>
      </div>

      {/* presenter banner */}
      <div style={{
        position: "absolute", top: 14, left: 14,
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(21,27,45,0.85)",
        border: `1px solid ${PALETTE.primary}55`,
        borderRadius: 10, padding: "6px 11px",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: PALETTE.primaryStrong,
          boxShadow: `0 0 8px ${PALETTE.primaryStrong}`,
        }} />
        <span className="ft-mono" style={{
          fontSize: 10, fontWeight: 700, color: PALETTE.primary,
          letterSpacing: "0.1em",
        }}>
          ANA IS PRESENTING
        </span>
      </div>

      {/* timer */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: "rgba(21,27,45,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "6px 11px",
      }}>
        <span className="ft-mono" style={{
          fontSize: 12, fontWeight: 700, color: PALETTE.text,
          letterSpacing: "0.04em",
        }}>
          08:42<span style={{ color: PALETTE.textDim }}>:18</span>
        </span>
      </div>

      {/* laser */}
      <div style={{
        position: "absolute", top: "60%", left: "62%",
        width: 14, height: 14, borderRadius: "50%",
        background: PALETTE.warm,
        boxShadow: `0 0 22px ${PALETTE.warm}, 0 0 45px ${PALETTE.warm}`,
      }} />

      {/* follower pill */}
      <div style={{
        position: "absolute", bottom: 14, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 7,
        background: "rgba(21,27,45,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 100, padding: "6px 14px",
        backdropFilter: "blur(12px)",
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: PALETTE.mint,
          boxShadow: `0 0 6px ${PALETTE.mint}`,
        }} />
        <span style={{
          fontSize: 11.5, fontWeight: 600, color: PALETTE.text,
        }}>
          6 viewers following your screen
        </span>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────────────── */

export default function FeaturesView() {
  const router = useRouter();
  const [spotlight, setSpotlight] = useState<"collab" | "shapes" | "present">("collab");
  useReveal();

  const handleGuestEntry = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  /* Six pillars — the high-level capability story */
  const pillars = [
    {
      icon: <PathIcon d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
      label: "Real-time",
      title: "Zero-lag co-editing",
      desc: "Conflict-free CRDT replication keeps every shape, label, and stroke in sync below the perception threshold — even across continents.",
      bullets: [
        "Sub-50ms median sync latency",
        "Offline edits merge cleanly on reconnect",
        "Per-user undo/redo (50-step history)",
      ],
      color: PALETTE.primary,
    },
    {
      icon: <PathIcon d="M3 5h18v14H3z M3 10h18 M9 5v14" />,
      label: "Canvas",
      title: "The 17-shape toolkit",
      desc: "All the flowchart vocabulary you need: process, decision, swimlane, sticky note, freehand ink — snapped, aligned, and ready to connect.",
      bullets: [
        "17 shape types + sticky notes + ink",
        "Snap-to-grid and smart guides",
        "Orthogonal connectors with port routing",
      ],
      color: PALETTE.primaryStrong,
    },
    {
      icon: <PathIcon d="M3 5h18v11H3z M8 21h8 M12 16v5" />,
      label: "Present",
      title: "Present mode",
      desc: "One key drops the call into focus. Viewers follow your viewport, see your laser pointer, and watch a shared timer — no screen-sharing required.",
      bullets: [
        "Press P to enter, Esc to leave",
        "Laser pointer + shared timer",
        "Viewers can peek then re-sync instantly",
      ],
      color: PALETTE.tertiary,
    },
    {
      icon: <PathIcon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
      label: "Comments",
      title: "Threads on canvas",
      desc: "Anchored discussions land on the shape they're about — not buried in a side panel. Resolve, reopen, and @mention without losing your place.",
      bullets: [
        "Pin a thread to any shape or region",
        "@mentions, emoji, and unread badges",
        "Resolved threads collapse to a pin",
      ],
      color: PALETTE.warm,
    },
    {
      icon: <PathIcon d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />,
      label: "Export",
      title: "Out in any format",
      desc: "PNG, SVG, PDF, or a live read-only link — pick the surface, ship the picture. SVG keeps shapes editable downstream.",
      bullets: [
        "PNG · SVG · PDF · live link",
        "Selection-only or whole-board export",
        "Read-only links never expire",
      ],
      color: PALETTE.amber,
    },
    {
      icon: <PathIcon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
      label: "Workspaces",
      title: "Org-grade controls",
      desc: "Bring CanvUs into your company without bringing in chaos. SSO, roles, audit logs, and per-board access live in one panel.",
      bullets: [
        "Google · GitHub · SAML SSO on Team",
        "Roles: owner, editor, commenter, viewer",
        "Audit logs and retention controls",
      ],
      color: PALETTE.mint,
    },
  ];

  /* Spotlight tab content */
  const spotlightContent: Record<
    "collab" | "shapes" | "present",
    {
      eyebrow: string;
      title: string;
      copy: string;
      bullets: string[];
      color: string;
      mock: React.ReactNode;
    }
  > = {
    collab: {
      eyebrow: "Real-time spotlight",
      title: "Everyone edits at once. Nothing collides.",
      copy:
        "CanvUs runs on a conflict-free replicated data type. Drag a shape while a teammate types a label inside it — both intents merge in under fifty milliseconds, no last-writer-wins, no lost edits.",
      bullets: [
        "Live cursors with name + colour per editor",
        "Presence pill shows who's actually looking",
        "Per-user undo: roll back your edits, not theirs",
        "Lose Wi-Fi? Keep working. We reconcile when you reconnect.",
      ],
      color: PALETTE.primary,
      mock: <SpotlightCollab />,
    },
    shapes: {
      eyebrow: "Canvas spotlight",
      title: "Built for systems thinkers.",
      copy:
        "Seventeen flowchart shapes covering the whole BPMN-ish vocabulary, plus sticky notes and freehand ink. Connectors route around obstacles and snap to cardinal ports — no more fiddling with elbow joints.",
      bullets: [
        "17 shapes + sticky notes + freehand ink",
        "Orthogonal connectors auto-route to ports",
        "Snap-to-grid, smart guides, multi-select transform",
        "Templates: flowchart, retro, swim-lane, roadmap",
      ],
      color: PALETTE.primaryStrong,
      mock: <SpotlightShapes />,
    },
    present: {
      eyebrow: "Present spotlight",
      title: "Run a meeting. Not a screen-share.",
      copy:
        "Hit P. Your viewport becomes the spotlight; everyone else's canvas follows yours. Use the laser pointer to direct attention, the shared timer to keep pace, and let stragglers re-sync with one click.",
      bullets: [
        "Press P to present, Esc to leave",
        "Laser pointer with motion trail",
        "Shared session timer everyone sees",
        "Viewers can peek away — one click to re-sync",
      ],
      color: PALETTE.tertiary,
      mock: <SpotlightPresent />,
    },
  };

  const detail = spotlightContent[spotlight];

  /* Granular capability grid */
  const details = [
    {
      group: "Editing",
      items: [
        { t: "Multi-select & group transform", d: "Marquee, shift-click, or ⌘A — drag, scale, align, distribute in one move." },
        { t: "Smart guides & snapping", d: "Centerlines, edge-snap, and equal-distance markers appear as you drag." },
        { t: "50-step undo / redo", d: "Per-user history. Undo what you did, not what the room did." },
        { t: "Keyboard-first toolkit", d: "Every shape and tool has a single-key shortcut. Built for momentum." },
      ],
      color: PALETTE.primary,
    },
    {
      group: "Collaboration",
      items: [
        { t: "Live cursors & names", d: "Every editor gets a colour and a label. See where attention actually is." },
        { t: "Anchored comment threads", d: "Pin a thread to a shape. Mentions, emoji, unread badges, resolve / reopen." },
        { t: "Roles & permissions", d: "Owner, editor, commenter, viewer. Set per board or per workspace." },
        { t: "Guest access", d: "Anyone with the link joins as a guest — no account needed, no install." },
      ],
      color: PALETTE.primaryStrong,
    },
    {
      group: "Presenting",
      items: [
        { t: "Present mode (P)", d: "Drop into focus. Viewer screens follow your viewport in real time." },
        { t: "Laser pointer", d: "Glowing dot with a short motion trail. Direct attention without dragging shapes." },
        { t: "Shared timer", d: "A single session timer everyone sees. Keep standups, retros, demos honest." },
        { t: "Follower / freelook", d: "Viewers can peek away to read context, then re-sync with one click." },
      ],
      color: PALETTE.tertiary,
    },
    {
      group: "Output",
      items: [
        { t: "PNG · SVG · PDF export", d: "Whole board or selection only. SVG keeps shapes editable downstream." },
        { t: "Read-only share links", d: "Stakeholders peek without an account. Permission to view only." },
        { t: "Snapshot history", d: "Roll back to any save point. (Coming on Team plan, Q3.)" },
        { t: "Embed anywhere", d: "Drop a live board into Notion, Linear, or any iframe-friendly surface." },
      ],
      color: PALETTE.amber,
    },
  ];

  /* Comparison table */
  const compareRows: Array<{ feature: string; us: string | true; them: string | true | false }> = [
    { feature: "Sub-50ms sync (CRDT)",                us: true,           them: "~150–300ms" },
    { feature: "Local-first / offline editing",       us: true,           them: false },
    { feature: "Anchored comments on shapes",         us: true,           them: "Page-level" },
    { feature: "Present mode (viewport follow)",      us: true,           them: "Screen-share only" },
    { feature: "Free guest access (no account)",      us: true,           them: "Account required" },
    { feature: "Free tier",                           us: "3 boards · unlimited guests", them: "Limited / paywalled" },
    { feature: "Export to SVG (editable)",            us: true,           them: "Pro plan" },
    { feature: "Open source core",                    us: true,           them: false },
  ];

  /* Performance specs */
  const specs = [
    { metric: "Sync latency", value: "< 50ms", note: "median over WebSocket, p99 < 110ms" },
    { metric: "Undo depth",    value: "50 steps", note: "per-user, persisted locally" },
    { metric: "Shape budget",  value: "10k+",    note: "per board, with virtualised rendering" },
    { metric: "Zoom range",    value: "10–400%", note: "smooth scroll-zoom with cursor anchor" },
    { metric: "Connector ports", value: "4",     note: "cardinal — N · E · S · W with auto-route" },
    { metric: "Browsers",      value: "Evergreen", note: "Chrome · Edge · Safari · Firefox" },
  ];

  return (
    <div
      className="ft-root"
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

      {/* Ambient background */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: -180, right: -120,
          width: 720, height: 720, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(86,141,255,0.18) 0%, rgba(86,141,255,0.04) 38%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "32%", left: "-15%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(176,198,255,0.10) 0%, transparent 65%)",
          filter: "blur(50px)",
        }} />
        <div style={{
          position: "absolute", bottom: -220, left: "50%",
          transform: "translateX(-50%)",
          width: 1200, height: 600, borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(86,141,255,0.08) 0%, transparent 60%)",
          filter: "blur(60px)",
        }} />
      </div>

      {/* NAV */}
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
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <CanvusMark size={28} />
            <span style={{ fontSize: 16, fontWeight: 800, color: PALETTE.text, letterSpacing: "-0.02em" }}>
              CanvUs
            </span>
            <span className="ft-mono" style={{
              fontSize: 9.5, fontWeight: 600, color: PALETTE.primary,
              padding: "2px 6px",
              border: "1px solid rgba(176,198,255,0.25)",
              borderRadius: 5, letterSpacing: "0.08em", marginLeft: 2,
            }}>
              BETA
            </span>
          </Link>

          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/features" className="ft-link" style={{ color: PALETTE.text }}>Features</Link>
            <Link href="/how-it-works" className="ft-link">How it works</Link>
            <span className="ft-link">Changelog</span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/sign-in" className="ft-link" style={{ padding: "6px 12px" }}>Sign in</Link>
            <button
              type="button"
              onClick={handleGuestEntry}
              className="ft-link"
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
            <Link href="/sign-up" className="ft-btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
              Open canvas
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 148, paddingBottom: 64 }}>
        <div className="ft-dots" style={{
          position: "absolute", inset: 0,
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          opacity: 0.7, pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 880, margin: "0 auto", padding: "0 24px",
          position: "relative", textAlign: "center",
        }}>
          <div className="ft-fade ft-chip" style={{ marginBottom: 22 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: PALETTE.primaryStrong,
              boxShadow: `0 0 8px ${PALETTE.primaryStrong}`,
            }} />
            <span className="ft-mono" style={{ letterSpacing: "0.12em" }}>
              EVERYTHING INSIDE CANVUS · IN ONE PLACE
            </span>
          </div>

          <h1 className="ft-fade-1" style={{
            fontSize: "clamp(40px, 5.6vw, 68px)",
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            fontWeight: 800,
            color: PALETTE.text,
            margin: "0 0 22px",
          }}>
            The full toolkit for{" "}
            <span className="ft-grad" style={{ fontStyle: "italic" }}>
              thinking together
            </span>.
          </h1>

          <p className="ft-fade-2" style={{
            fontSize: 17, lineHeight: 1.65,
            color: PALETTE.textMuted,
            maxWidth: 620, margin: "0 auto 32px",
            fontWeight: 400,
          }}>
            Real-time co-editing, a flowchart toolkit, present mode, anchored comments,
            export, and workspaces. Built for teams that meet, decide, and ship — fast.
          </p>

          <div className="ft-fade-3" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="ft-btn-primary" style={{ textDecoration: "none" }}>
              Open a free board
              <ArrowIcon />
            </Link>
            <Link href="/how-it-works" className="ft-btn-ghost" style={{ textDecoration: "none" }}>
              Take the tour
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS — 6 capability cards */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "60px 24px 40px",
        maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          gap: 60, marginBottom: 56, alignItems: "end",
        }}>
          <div>
            <div className="ft-eyebrow ft-reveal">The six pillars</div>
            <h2 className="ft-reveal ft-d1" style={{
              fontSize: "clamp(30px, 3.6vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: PALETTE.text,
              marginTop: 16,
            }}>
              Six capabilities.
              <br />
              One quiet canvas.
            </h2>
          </div>
          <p className="ft-reveal ft-d2" style={{
            fontSize: 16,
            color: PALETTE.textMuted,
            lineHeight: 1.65,
            maxWidth: 540,
            justifySelf: "end",
          }}>
            CanvUs isn&apos;t a kitchen-sink whiteboard. Every feature exists because
            it removes a specific friction from how teams actually meet, present, and decide.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))",
          gap: 14,
        }}>
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`ft-card ft-reveal-scale ft-d${(i % 3) + 1}`}
              style={{ padding: 26 }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: `${p.color}1a`,
                border: `1px solid ${p.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: p.color, marginBottom: 18,
              }}>
                {p.icon}
              </div>
              <div className="ft-mono" style={{
                fontSize: 10, fontWeight: 700,
                color: p.color,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}>
                {p.label}
              </div>
              <h3 style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.015em",
                color: PALETTE.text,
                marginBottom: 10,
              }}>
                {p.title}
              </h3>
              <p style={{
                fontSize: 13.5,
                color: PALETTE.textMuted,
                lineHeight: 1.65,
                marginBottom: 16,
              }}>
                {p.desc}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <span style={{
                      flexShrink: 0,
                      marginTop: 5,
                      width: 12, height: 12, borderRadius: 3,
                      background: `${p.color}22`,
                      border: `1px solid ${p.color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckSmall color={p.color} size={8} />
                    </span>
                    <span style={{ fontSize: 13, color: PALETTE.textMuted, lineHeight: 1.55 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPOTLIGHT — tabbed deep-dive */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px",
        background: `linear-gradient(180deg, transparent 0%, ${PALETTE.bgDeep} 50%, transparent 100%)`,
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div className="ft-eyebrow ft-reveal">Spotlight</div>
            <h2 className="ft-reveal ft-d1" style={{
              fontSize: "clamp(28px, 3.4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: PALETTE.text,
              marginTop: 14,
              lineHeight: 1.1,
              maxWidth: 700,
            }}>
              The three features that
              <br />most teams switch over.
            </h2>
          </div>

          {/* Tabs */}
          <div className="ft-reveal" style={{
            display: "flex", gap: 6, marginBottom: 28,
            flexWrap: "wrap",
            background: "rgba(7,13,31,0.4)",
            border: `1px solid ${PALETTE.borderSoft}`,
            borderRadius: 14,
            padding: 6,
            width: "fit-content",
          }}>
            {[
              { id: "collab",  label: "Real-time co-editing" },
              { id: "shapes",  label: "Shape toolkit" },
              { id: "present", label: "Present mode" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="ft-tab"
                data-active={spotlight === tab.id}
                onClick={() => setSpotlight(tab.id as typeof spotlight)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="ft-reveal ft-d1"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.05fr",
              gap: 56,
              alignItems: "center",
            }}
          >
            <div>
              <div className="ft-mono" style={{
                fontSize: 11, fontWeight: 700,
                color: detail.color,
                letterSpacing: "0.18em",
                marginBottom: 10,
              }}>
                {detail.eyebrow.toUpperCase()}
              </div>
              <h3 style={{
                fontSize: "clamp(24px, 2.6vw, 32px)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                color: PALETTE.text,
                lineHeight: 1.15,
                margin: "0 0 16px",
              }}>
                {detail.title}
              </h3>
              <p style={{
                fontSize: 15.5,
                color: PALETTE.textMuted,
                lineHeight: 1.7,
                marginBottom: 22,
              }}>
                {detail.copy}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {detail.bullets.map((b) => (
                  <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      flexShrink: 0,
                      marginTop: 5,
                      width: 14, height: 14, borderRadius: 4,
                      background: `${detail.color}22`,
                      border: `1px solid ${detail.color}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckSmall color={detail.color} size={9} />
                    </span>
                    <span style={{ fontSize: 14, color: PALETTE.text, lineHeight: 1.5 }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", inset: -30,
                background: `radial-gradient(ellipse at 50% 50%, ${detail.color}22 0%, transparent 65%)`,
                filter: "blur(30px)", pointerEvents: "none",
              }} />
              <div style={{ position: "relative" }}>
                {detail.mock}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAIL GRID — granular capability index */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px 60px",
        maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{ marginBottom: 48 }}>
          <div className="ft-eyebrow ft-reveal">Capability index</div>
          <h2 className="ft-reveal ft-d1" style={{
            fontSize: "clamp(28px, 3.4vw, 40px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: PALETTE.text,
            marginTop: 14,
            lineHeight: 1.1,
            maxWidth: 720,
          }}>
            Every knob, dial, and shortcut.
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
          gap: 14,
        }}>
          {details.map((col, ci) => (
            <div
              key={col.group}
              className={`ft-card ft-reveal-scale ft-d${(ci % 4) + 1}`}
              style={{ padding: 24 }}
            >
              <div className="ft-mono" style={{
                fontSize: 10, fontWeight: 700,
                color: col.color,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 18,
              }}>
                {col.group}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {col.items.map((it) => (
                  <div key={it.t}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      color: PALETTE.text,
                      margin: "0 0 4px",
                    }}>
                      {it.t}
                    </h4>
                    <p style={{
                      fontSize: 13,
                      color: PALETTE.textMuted,
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {it.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECS — performance metrics */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "60px 24px 80px",
        maxWidth: 1180, margin: "0 auto",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.4fr",
          gap: 60, marginBottom: 40, alignItems: "end",
        }}>
          <div>
            <div className="ft-eyebrow ft-reveal">By the numbers</div>
            <h2 className="ft-reveal ft-d1" style={{
              fontSize: "clamp(26px, 3.2vw, 38px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: PALETTE.text,
              marginTop: 14,
            }}>
              Built to feel instant.
            </h2>
          </div>
          <p className="ft-reveal ft-d2" style={{
            fontSize: 15.5,
            color: PALETTE.textMuted,
            lineHeight: 1.7,
            maxWidth: 540,
            justifySelf: "end",
          }}>
            We measure CanvUs the way you experience it: median latency, undo depth,
            shape count, zoom range. Numbers that show up in real meetings.
          </p>
        </div>

        <div className="ft-card ft-reveal" style={{ padding: 8 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}>
            {specs.map((s, i) => (
              <div key={s.metric} style={{
                padding: 22,
                borderRight: (i + 1) % 3 !== 0 ? `1px solid ${PALETTE.borderSoft}` : undefined,
                borderBottom: i < specs.length - 3 ? `1px solid ${PALETTE.borderSoft}` : undefined,
              }}>
                <div className="ft-mono" style={{
                  fontSize: 10, fontWeight: 700,
                  color: PALETTE.textFaint,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  {s.metric}
                </div>
                <div style={{
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: PALETTE.text,
                  marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: 12.5,
                  color: PALETTE.textDim,
                  lineHeight: 1.55,
                }}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "60px 24px 80px",
        maxWidth: 1080, margin: "0 auto",
      }}>
        <div style={{ marginBottom: 36, textAlign: "center" }}>
          <div className="ft-eyebrow ft-reveal" style={{ justifyContent: "center" }}>Side by side</div>
          <h2 className="ft-reveal ft-d1" style={{
            fontSize: "clamp(26px, 3.2vw, 38px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: PALETTE.text,
            marginTop: 14,
            lineHeight: 1.1,
          }}>
            How CanvUs stacks up.
          </h2>
        </div>

        <div className="ft-card ft-reveal" style={{ overflow: "hidden" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            padding: "16px 22px",
            background: PALETTE.surfaceHi,
            borderBottom: `1px solid ${PALETTE.borderSoft}`,
            alignItems: "center",
          }}>
            <div className="ft-mono" style={{
              fontSize: 11, fontWeight: 700,
              color: PALETTE.textFaint,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}>
              Feature
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: PALETTE.primary,
              letterSpacing: "-0.01em",
            }}>
              CanvUs
            </div>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: PALETTE.textDim,
              letterSpacing: "-0.01em",
            }}>
              Typical whiteboard
            </div>
          </div>

          {compareRows.map((row, i) => (
            <div key={row.feature} style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr",
              padding: "16px 22px",
              borderBottom: i < compareRows.length - 1 ? `1px solid ${PALETTE.borderSoft}` : undefined,
              alignItems: "center",
            }}>
              <div style={{
                fontSize: 14, color: PALETTE.text, fontWeight: 500,
                letterSpacing: "-0.005em",
              }}>
                {row.feature}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {row.us === true ? (
                  <>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: `${PALETTE.primary}22`,
                      border: `1px solid ${PALETTE.primary}66`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckSmall color={PALETTE.primary} size={11} />
                    </span>
                    <span style={{ fontSize: 13, color: PALETTE.text, fontWeight: 600 }}>
                      Included
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 13.5, color: PALETTE.text, fontWeight: 600 }}>
                    {row.us}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {row.them === true ? (
                  <span style={{ fontSize: 13, color: PALETTE.textDim, fontWeight: 500 }}>
                    Yes
                  </span>
                ) : row.them === false ? (
                  <>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(255,180,171,0.10)",
                      border: `1px solid ${PALETTE.warm}55`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: PALETTE.warm,
                      fontWeight: 700, fontSize: 12, lineHeight: 1,
                    }}>×</span>
                    <span style={{ fontSize: 13, color: PALETTE.textDim }}>
                      No
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 13, color: PALETTE.textDim }}>
                    {row.them}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <p style={{
          marginTop: 14,
          fontSize: 11.5,
          color: PALETTE.textFaint,
          textAlign: "center",
          fontStyle: "italic",
        }}>
          Comparison reflects publicly documented behaviour of common whiteboard tools as of 2026.
        </p>
      </section>

      {/* CTA */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px 120px",
        textAlign: "center", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(86,141,255,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          border: `1px dashed ${PALETTE.borderSoft}`,
          animation: "ft-orbit 60s linear infinite",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
          <div className="ft-chip ft-reveal" style={{ marginBottom: 22 }}>
            <span className="ft-mono" style={{ letterSpacing: "0.12em" }}>
              FREE FOREVER · NO CARD REQUIRED
            </span>
          </div>
          <h2 className="ft-reveal ft-d1" style={{
            fontSize: "clamp(36px, 5.4vw, 60px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: PALETTE.text,
            lineHeight: 1.02,
            marginBottom: 18,
          }}>
            Stop reading.{" "}
            <span className="ft-grad" style={{ fontStyle: "italic" }}>Start drawing.</span>
          </h2>
          <p className="ft-reveal ft-d2" style={{
            fontSize: 17,
            color: PALETTE.textMuted,
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}>
            Open a board in a single click. Invite the team. Ship the picture before
            your standup ends.
          </p>
          <div className="ft-reveal ft-d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="ft-btn-primary" style={{ fontSize: 15, padding: "14px 28px", textDecoration: "none" }}>
              Open the canvas
              <ArrowIcon />
            </Link>
            <button type="button" onClick={handleGuestEntry} className="ft-btn-ghost" style={{ fontSize: 14 }}>
              Continue as guest
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: `1px solid ${PALETTE.borderSoft}`,
        padding: "44px 24px 30px",
      }}>
        <div style={{
          maxWidth: 1180, margin: "0 auto",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <CanvusMark size={24} />
            <span style={{ fontSize: 14, fontWeight: 800, color: PALETTE.text, letterSpacing: "-0.02em" }}>
              CanvUs
            </span>
          </Link>
          <span className="ft-mono" style={{
            fontSize: 11, color: PALETTE.textFaint, letterSpacing: "0.06em",
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
              <span key={l} className="ft-link" style={{ fontSize: 12 }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Icon primitives ──────────────────────────────────────────────────── */
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

function CheckSmall({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke={color} strokeWidth="3"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
