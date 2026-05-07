"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createCanvas } from "@/lib/api";

/* ────────────────────────────────────────────────────────────────────────────
   CanvUs — Landing
   Aesthetic: refined editorial-tech. Stitch-inspired, dark-first OLED navy
   with lavender-blue glow accents. Plus Jakarta Sans for prose, JetBrains
   Mono for systemic labels. Glassmorphism, dot-grid, restrained motion.
   ──────────────────────────────────────────────────────────────────────── */

const PALETTE = {
  bg: "#0c1324",
  bgDeep: "#070d1f",
  surface: "#151b2d",
  surfaceHi: "#191f31",
  surfaceHigher: "#23293c",
  borderSoft: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#dce1fb",
  textMuted: "#c2c6d8",
  textDim: "#8c90a1",
  textFaint: "#5a6079",
  primary: "#b0c6ff",
  primaryStrong: "#568dff",
  primaryDeep: "#002d6f",
  tertiary: "#bcc7de",
  warm: "#ffb4ab",
  amber: "#ffb454",
  mint: "#7dd3a4",
} as const;

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

/* ── Animated canvas preview (themed) ─────────────────────────────────── */
const CanvasPreview = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 30% 20%, #1a2244 0%, #0c1324 55%, #070d1f 100%)",
      }}
    >
      {/* Dot grid */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.6,
        }}
      >
        <defs>
          <pattern
            id="lp-canvas-dots"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="11" cy="11" r="0.9" fill="rgba(220,225,251,0.10)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lp-canvas-dots)" />
      </svg>

      {/* Flowchart */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        {/* connectors */}
        <line x1="50%" y1="92"  x2="50%" y2="152" stroke={PALETTE.primary} strokeWidth="1.2" strokeDasharray="3,3" opacity="0.55" />
        <line x1="50%" y1="222" x2="50%" y2="270" stroke={PALETTE.primary} strokeWidth="1.2" strokeDasharray="3,3" opacity="0.55" />
        <line
          x1="50%" y1="340" x2="50%" y2="385"
          stroke={PALETTE.primaryStrong}
          strokeWidth="1.4"
          strokeDasharray="4,3"
          style={{ animation: "lp-draw 2s ease infinite", strokeDashoffset: 240 }}
        />

        {/* start */}
        <rect x="calc(50% - 70)" y="52" width="140" height="40" rx="20"
              fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.2" />
        <text x="50%" y="77" textAnchor="middle" fill={PALETTE.primary}
              fontSize="11.5" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Start meeting
        </text>

        {/* process */}
        <rect x="calc(50% - 95)" y="152" width="190" height="70" rx="10"
              fill="rgba(86,141,255,0.10)" stroke={PALETTE.primaryStrong} strokeWidth="1.2" />
        <text x="50%" y="183" textAnchor="middle" fill={PALETTE.text}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Present flowchart
        </text>
        <text x="50%" y="201" textAnchor="middle" fill={PALETTE.textMuted}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.85">
          Edit together in real time
        </text>

        {/* decision */}
        <polygon
          points="calc(50%),270 calc(50% + 88),305 calc(50%),340 calc(50% - 88),305"
          fill="rgba(188,199,222,0.08)" stroke={PALETTE.tertiary} strokeWidth="1.2"
        />
        <text x="50%" y="309" textAnchor="middle" fill={PALETTE.tertiary}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Approved?
        </text>

        {/* end */}
        <rect x="calc(50% - 62)" y="385" width="124" height="38" rx="19"
              fill="rgba(125,211,164,0.08)" stroke={PALETTE.mint} strokeWidth="1.2" />
        <text x="50%" y="409" textAnchor="middle" fill={PALETTE.mint}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Ship it
        </text>

        {/* sticky */}
        <rect x="72%" y="155" width="132" height="84" rx="6"
              fill="rgba(255,180,84,0.08)" stroke={PALETTE.amber} strokeWidth="1" opacity="0.95" />
        <text x="72%" dx="14" y="178" fill={PALETTE.amber}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Notes
        </text>
        <text x="72%" dx="14" y="198" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.85">
          Review before
        </text>
        <text x="72%" dx="14" y="214" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.85">
          client sign-off
        </text>
        <line x1="72%" y1="240" x2="50%" y2="310"
              stroke={PALETTE.amber} strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
      </svg>

      {/* Cursor A */}
      <div style={{ position: "absolute", animation: "lp-cursor-a 8s ease-in-out infinite", pointerEvents: "none", zIndex: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.primaryStrong}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="lp-mono" style={{
          background: PALETTE.primaryStrong, color: "#fff",
          fontSize: 10, fontWeight: 600, padding: "2px 7px",
          borderRadius: 6, marginTop: 2, whiteSpace: "nowrap", letterSpacing: "0.02em",
        }}>
          mia
        </div>
      </div>

      {/* Cursor B */}
      <div style={{ position: "absolute", animation: "lp-cursor-b 11s ease-in-out infinite", pointerEvents: "none", zIndex: 10 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill={PALETTE.warm}
             style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div className="lp-mono" style={{
          background: PALETTE.warm, color: "#3a0d09",
          fontSize: 10, fontWeight: 700, padding: "2px 7px",
          borderRadius: 6, marginTop: 2, whiteSpace: "nowrap", letterSpacing: "0.02em",
        }}>
          jake
        </div>
      </div>

      {/* Floating tool rail */}
      <div style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        background: "rgba(21,27,45,0.7)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, backdropFilter: "blur(12px)",
        padding: "6px 5px", display: "flex", flexDirection: "column", gap: 4,
      }}>
        {["▢", "◇", "○", "✎", "→"].map((ic, i) => (
          <div key={i} style={{
            width: 26, height: 26, borderRadius: 7,
            background: i === 0 ? "rgba(176,198,255,0.14)" : "transparent",
            border: i === 0 ? "1px solid rgba(176,198,255,0.4)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: i === 0 ? PALETTE.primary : PALETTE.textFaint,
          }}>{ic}</div>
        ))}
      </div>

      {/* Presence */}
      <div style={{
        position: "absolute", top: 12, right: 12,
        display: "flex", alignItems: "center", gap: 4,
        background: "rgba(21,27,45,0.7)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, backdropFilter: "blur(12px)", padding: "5px 10px",
      }}>
        {[
          ["MK", PALETTE.primary],
          ["MC", PALETTE.primaryStrong],
          ["JL", PALETTE.warm],
        ].map(([av, col]) => (
          <div key={av as string} style={{
            width: 22, height: 22, borderRadius: "50%",
            background: col as string,
            fontSize: 9, fontWeight: 700, color: "#0c1324",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${PALETTE.bg}`,
          }}>{av}</div>
        ))}
        <div style={{
          width: 7, height: 7, borderRadius: "50%",
          background: PALETTE.mint,
          boxShadow: `0 0 6px ${PALETTE.mint}`, marginLeft: 4,
        }} />
        <span className="lp-mono" style={{ fontSize: 10, color: PALETTE.textDim, fontWeight: 600 }}>
          3 LIVE
        </span>
      </div>

      {/* Soft glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 110%, rgba(86,141,255,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────────────── */

export default function LandingPageView() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [creating, setCreating] = useState(false);
  useReveal();

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const canvas = await createCanvas("Untitled board");
      router.push(`/canvas/${canvas.id}`);
    } catch {
      setCreating(false);
    }
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
            {["Features", "How it works", "Changelog"].map((l) => (
              <span key={l} className="lp-link">{l}</span>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="lp-link" style={{ padding: "6px 12px" }}>Sign in</span>
            <button className="lp-btn-primary" style={{ padding: "8px 16px", fontSize: 13 }} onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Open canvas"}
              <ArrowIcon />
            </button>
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
              display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 30,
            }}>
              <button className="lp-btn-primary" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Start a free board"}
                <ArrowIcon />
              </button>
              <button className="lp-btn-ghost">
                <PlayIcon />
                Watch 90-sec demo
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

            {/* Floating: live users */}
            <div style={{
              position: "absolute", bottom: -22, left: 22,
              background: PALETTE.surfaceHi,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
              animation: "lp-float 4s ease-in-out infinite",
            }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: PALETTE.mint }} />
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: PALETTE.mint,
                  animation: "lp-pulse 1.5s ease-out infinite",
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: PALETTE.text }}>
                3 people editing
              </span>
            </div>

            {/* Floating: latency */}
            <div style={{
              position: "absolute", top: 70, right: -20,
              background: PALETTE.surfaceHi,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "8px 13px",
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
          {features.map((f, i) => (
            <div
              key={i}
              className={`lp-card lp-reveal-scale lp-d${(i % 3) + 1}`}
              onMouseEnter={() => setActiveFeature(i)}
              style={{ padding: 26 }}
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
          ))}
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
            <button className="lp-btn-primary" style={{ fontSize: 15, padding: "14px 28px" }} onClick={handleCreate} disabled={creating}>
              {creating ? "Creating…" : "Open the canvas"}
              <ArrowIcon />
            </button>
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
  return (
    <div style={{ position: "relative", width: 28, height: 28 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 8,
        background: PALETTE.primaryStrong,
        transform: "rotate(8deg) scale(0.92)",
        opacity: 0.6,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 8,
        background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.primaryStrong})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke={PALETTE.primaryDeep} strokeWidth="2.6"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h7v7H4zM13 13h7v7h-7zM4 13h7v7H4zM13 4h7v7h-7z" opacity="0.4" />
          <path d="M4 4h7v7H4zM13 13h7v7h-7z" />
        </svg>
      </div>
    </div>
  );
}
