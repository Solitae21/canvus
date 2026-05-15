"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PALETTE } from "@/client/landing-page/palette";
import { startGuestSession } from "@/lib/guest";
import { CanvusMark } from "@/client/brand/CanvusMark";

/* ────────────────────────────────────────────────────────────────────────────
   CanvUs — How it works
   Detailed product tour. Same editorial-tech language as the landing page:
   dark navy, lavender-blue glow, glass nav, dot-grid, mono labels.
   ──────────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".hw-reveal, .hw-reveal-scale, .hw-reveal-line");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("hw-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const GlobalStyles = () => (
  <style>{`
    .hw-root *, .hw-root *::before, .hw-root *::after { box-sizing: border-box; }
    .hw-root { scroll-behavior: smooth; }

    @keyframes hw-fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes hw-float {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes hw-pulse {
      0%   { transform: scale(0.85); opacity: 0.9; }
      100% { transform: scale(2.2);  opacity: 0;   }
    }
    @keyframes hw-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes hw-orbit {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }
    @keyframes hw-dash {
      to { stroke-dashoffset: -240; }
    }
    @keyframes hw-blink {
      0%, 49%   { opacity: 1; }
      50%, 100% { opacity: 0; }
    }

    .hw-fade   { animation: hw-fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
    .hw-fade-1 { animation: hw-fadeUp 0.8s 0.08s cubic-bezier(0.16,1,0.3,1) both; }
    .hw-fade-2 { animation: hw-fadeUp 0.8s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
    .hw-fade-3 { animation: hw-fadeUp 0.8s 0.30s cubic-bezier(0.16,1,0.3,1) both; }

    .hw-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
    }
    .hw-reveal.hw-in { opacity: 1; transform: translateY(0); }
    .hw-reveal-scale {
      opacity: 0;
      transform: scale(0.95) translateY(14px);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .hw-reveal-scale.hw-in { opacity: 1; transform: scale(1) translateY(0); }
    .hw-reveal-line {
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1);
    }
    .hw-reveal-line.hw-in { transform: scaleX(1); }
    .hw-d1 { transition-delay: 0.08s !important; }
    .hw-d2 { transition-delay: 0.18s !important; }
    .hw-d3 { transition-delay: 0.30s !important; }
    .hw-d4 { transition-delay: 0.42s !important; }

    .hw-mono {
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-feature-settings: "ss01", "cv11";
    }

    .hw-btn-primary {
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
    .hw-btn-primary:hover {
      transform: translateY(-1px);
      background: #c4d4ff;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.6),
        0 6px 24px rgba(86,141,255,0.35),
        0 0 0 1px rgba(176,198,255,0.5);
    }
    .hw-btn-primary:active { transform: translateY(0); }

    .hw-btn-ghost {
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
    .hw-btn-ghost:hover {
      color: ${PALETTE.text};
      border-color: ${PALETTE.borderStrong};
      background: rgba(255,255,255,0.04);
    }

    .hw-card {
      background: linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%);
      border: 1px solid ${PALETTE.borderSoft};
      border-radius: 18px;
      transition: border-color 240ms ease, transform 240ms ease, box-shadow 240ms ease;
      position: relative;
    }
    .hw-card:hover {
      transform: translateY(-3px);
      border-color: ${PALETTE.border};
      box-shadow: 0 20px 60px -12px rgba(0,0,0,0.5);
    }

    .hw-link {
      color: ${PALETTE.textMuted};
      font-size: 13.5px; font-weight: 500;
      cursor: pointer;
      transition: color 160ms ease;
      letter-spacing: -0.005em;
      text-decoration: none;
    }
    .hw-link:hover { color: ${PALETTE.text}; }

    .hw-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: ${PALETTE.textDim};
    }
    .hw-eyebrow::before {
      content: ""; display: inline-block;
      width: 18px; height: 1px;
      background: ${PALETTE.borderStrong};
    }

    .hw-grad {
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
      animation: hw-shimmer 9s linear infinite;
    }

    .hw-dots {
      background-image: radial-gradient(circle, rgba(220,225,251,0.06) 1px, transparent 1px);
      background-size: 28px 28px;
      background-position: 14px 14px;
    }

    .hw-chip {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 5px 11px 5px 9px;
      background: rgba(176,198,255,0.07);
      border: 1px solid rgba(176,198,255,0.18);
      border-radius: 100px;
      font-size: 11.5px; font-weight: 600;
      color: ${PALETTE.primary};
      letter-spacing: 0.04em;
    }

    .hw-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${PALETTE.border}, transparent);
    }

    .hw-kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 24px; height: 24px; padding: 0 7px;
      background: rgba(7,13,31,0.7);
      border: 1px solid ${PALETTE.border};
      border-bottom-width: 2px;
      border-radius: 6px;
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-size: 11px; font-weight: 600;
      color: ${PALETTE.text};
      letter-spacing: 0;
    }

    .hw-step-num {
      position: absolute;
      top: -14px; left: 24px;
      width: 36px; height: 36px;
      border-radius: 50%;
      background: ${PALETTE.bg};
      border: 1.5px solid currentColor;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.05em;
      box-shadow: 0 0 0 4px ${PALETTE.bgDeep};
    }

    .hw-faq-summary {
      list-style: none;
      cursor: pointer;
      padding: 22px 24px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px;
      font-size: 15.5px; font-weight: 600;
      color: ${PALETTE.text};
      letter-spacing: -0.01em;
    }
    .hw-faq-summary::-webkit-details-marker { display: none; }
    .hw-faq-summary::after {
      content: "+";
      font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
      font-size: 18px; font-weight: 400;
      color: ${PALETTE.textDim};
      transition: transform 200ms ease, color 200ms ease;
    }
    details[open] > .hw-faq-summary::after {
      transform: rotate(45deg);
      color: ${PALETTE.primary};
    }
    .hw-faq-body {
      padding: 0 24px 22px;
      font-size: 14px;
      color: ${PALETTE.textMuted};
      line-height: 1.7;
      max-width: 720px;
    }
  `}</style>
);

/* ── Mock visuals for the four flow steps ────────────────────────────── */

const MockCreate = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/dashboard" />
    <div style={{ padding: 28 }}>
      <div className="hw-mono" style={{ fontSize: 10, color: PALETTE.textFaint, letterSpacing: "0.1em", marginBottom: 12 }}>
        NEW BOARD
      </div>
      <label style={{
        display: "block", fontSize: 11.5, fontWeight: 600,
        color: PALETTE.textDim, marginBottom: 8, letterSpacing: "0.02em",
      }}>
        Board name
      </label>
      <div style={{
        padding: "11px 14px",
        background: "rgba(7,13,31,0.7)",
        border: `1px solid ${PALETTE.primary}55`,
        borderRadius: 10,
        boxShadow: `0 0 0 3px ${PALETTE.primary}18`,
        marginBottom: 18,
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <span style={{ fontSize: 13.5, color: PALETTE.text, fontWeight: 500 }}>
          Q2 launch plan
        </span>
        <span style={{
          width: 1, height: 14,
          background: PALETTE.primary,
          animation: "hw-blink 1s steps(2) infinite",
        }} />
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: "rgba(176,198,255,0.04)",
        border: `1px dashed ${PALETTE.borderSoft}`,
        borderRadius: 8,
        marginBottom: 22,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          border: `1px solid ${PALETTE.primary}55`,
          background: `${PALETTE.primary}1a`,
          color: PALETTE.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700,
        }}>▢</div>
        <span className="hw-mono" style={{ fontSize: 10.5, color: PALETTE.textDim, letterSpacing: "0.04em" }}>
          starts as a blank canvas — pan, zoom, drop shapes
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <div style={mockGhostBtnStyle}>Cancel</div>
        <div style={mockPrimaryBtnStyle}>Create board →</div>
      </div>
    </div>
  </div>
);

const MockInvite = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/board/team-q2-planning" />
    <div style={{ padding: 22 }}>
      <div className="hw-mono" style={{ fontSize: 10, color: PALETTE.textFaint, letterSpacing: "0.1em", marginBottom: 10 }}>
        SHARE BOARD
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: "rgba(7,13,31,0.7)",
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 10,
        marginBottom: 18,
      }}>
        <span className="hw-mono" style={{
          flex: 1, fontSize: 12, color: PALETTE.text,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          https://canv.us/b/team-q2-planning?invite=A4hZ
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700, color: PALETTE.primaryDeep,
          background: PALETTE.primary,
          padding: "5px 10px", borderRadius: 6,
        }}>
          Copy
        </span>
      </div>
      <div className="hw-mono" style={{ fontSize: 10, color: PALETTE.textFaint, letterSpacing: "0.1em", marginBottom: 8 }}>
        IN THE ROOM
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { name: "Mia Kato",      col: PALETTE.primary },
          { name: "Marcus Chen",   col: PALETTE.primaryStrong },
          { name: "Jake Liu",      col: PALETTE.warm },
          { name: "Quiet Otter",   col: PALETTE.mint },
        ].map((p) => (
          <div key={p.name} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 10px",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${PALETTE.borderSoft}`,
            borderRadius: 8,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: p.col,
              fontSize: 10, fontWeight: 800, color: "#0c1324",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div style={{ flex: 1, fontSize: 12, fontWeight: 600, color: PALETTE.text }}>
              {p.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: PALETTE.mint,
                boxShadow: `0 0 6px ${PALETTE.mint}`,
              }} />
              <span className="hw-mono" style={{ fontSize: 10, color: PALETTE.textDim, letterSpacing: "0.04em" }}>
                live cursor
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MockBuild = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/b/team-q2-planning" />
    <div style={{
      position: "relative",
      height: 280,
      background:
        "radial-gradient(ellipse at 30% 20%, #1a2244 0%, #0c1324 55%, #070d1f 100%)",
      overflow: "hidden",
    }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}>
        <defs>
          <pattern id="hw-build-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="rgba(220,225,251,0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hw-build-dots)" />
      </svg>

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
        {/* shape A */}
        <rect x="36" y="60" width="120" height="42" rx="8"
              fill="rgba(176,198,255,0.10)" stroke={PALETTE.primary} strokeWidth="1.2" />
        <text x="96" y="86" textAnchor="middle" fill={PALETTE.primary}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Research
        </text>

        {/* shape B */}
        <polygon
          points="240,60 296,80 240,100 184,80"
          fill="rgba(188,199,222,0.08)" stroke={PALETTE.tertiary} strokeWidth="1.2"
        />
        <text x="240" y="84" textAnchor="middle" fill={PALETTE.tertiary}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Scope?
        </text>

        {/* shape C */}
        <rect x="320" y="60" width="120" height="42" rx="8"
              fill="rgba(125,211,164,0.08)" stroke={PALETTE.mint} strokeWidth="1.2" />
        <text x="380" y="86" textAnchor="middle" fill={PALETTE.mint}
              fontSize="11" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Build
        </text>

        {/* animated link A→B (being drawn) */}
        <line
          x1="156" y1="81" x2="184" y2="80"
          stroke={PALETTE.primaryStrong} strokeWidth="1.5"
          strokeDasharray="4,3"
          style={{ animation: "hw-dash 1.4s linear infinite" }}
        />
        {/* link B→C (solid) */}
        <line x1="296" y1="80" x2="320" y2="80"
              stroke={PALETTE.tertiary} strokeWidth="1.2" opacity="0.7" />

        {/* sticky note */}
        <rect x="56" y="178" width="124" height="74" rx="4"
              fill="rgba(255,180,84,0.10)" stroke={PALETTE.amber} strokeWidth="1" />
        <text x="68" y="200" fill={PALETTE.amber}
              fontSize="10" fontFamily="var(--font-plus-jakarta-sans)" fontWeight="700">
          Sticky
        </text>
        <text x="68" y="218" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.9">
          Confirm API timing
        </text>
        <text x="68" y="234" fill={PALETTE.amber}
              fontSize="9.5" fontFamily="var(--font-plus-jakarta-sans)" opacity="0.9">
          before scoping build
        </text>

        {/* live cursor — marcus */}
        <g transform="translate(178, 78)">
          <path d="M0 0l11 7-5.5 0.8L2.5 14z" fill={PALETTE.primaryStrong} />
        </g>
        <g transform="translate(190, 96)">
          <rect width="48" height="14" rx="3" fill={PALETTE.primaryStrong} />
          <text x="24" y="10" textAnchor="middle" fill="#fff"
                fontSize="9" fontFamily="var(--font-jetbrains-mono)" fontWeight="700">
            marcus
          </text>
        </g>
      </svg>

      {/* tool rail */}
      <div style={{
        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
        background: "rgba(21,27,45,0.7)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, backdropFilter: "blur(12px)",
        padding: "5px 4px", display: "flex", flexDirection: "column", gap: 3,
      }}>
        {["▢", "◇", "○", "✎", "→"].map((ic, i) => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 6,
            background: i === 4 ? "rgba(176,198,255,0.14)" : "transparent",
            border: i === 4 ? "1px solid rgba(176,198,255,0.4)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: i === 4 ? PALETTE.primary : PALETTE.textFaint,
          }}>{ic}</div>
        ))}
      </div>
    </div>
  </div>
);

const MockPresent = () => (
  <div style={mockShellStyle}>
    <MockChrome url="canv.us/b/team-q2-planning · PRESENT" />
    <div style={{
      position: "relative",
      height: 280,
      background:
        "radial-gradient(ellipse at 50% 50%, #1a2244 0%, #0a1020 100%)",
      overflow: "hidden",
    }}>
      {/* spotlight ring */}
      <div style={{
        position: "absolute",
        inset: "10% 18%",
        borderRadius: 14,
        border: `1.5px dashed ${PALETTE.primary}55`,
        boxShadow: `0 0 0 9999px rgba(7,13,31,0.55), 0 0 30px ${PALETTE.primaryStrong}30`,
      }} />

      {/* center shape */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "16px 28px",
        borderRadius: 12,
        background: "rgba(176,198,255,0.12)",
        border: `1.5px solid ${PALETTE.primary}`,
        color: PALETTE.text,
        fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em",
        boxShadow: `0 0 60px ${PALETTE.primaryStrong}40`,
      }}>
        Q2 launch plan
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
        <span className="hw-mono" style={{ fontSize: 10, fontWeight: 700, color: PALETTE.primary, letterSpacing: "0.1em" }}>
          MIA IS PRESENTING
        </span>
      </div>

      {/* timer */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: "rgba(21,27,45,0.85)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 10, padding: "6px 11px",
      }}>
        <span className="hw-mono" style={{ fontSize: 12, fontWeight: 700, color: PALETTE.text, letterSpacing: "0.04em" }}>
          12:34
          <span style={{ animation: "hw-blink 1s steps(2) infinite" }}>:</span>
          <span style={{ color: PALETTE.textDim }}>56</span>
        </span>
      </div>

      {/* laser pointer dot */}
      <div style={{
        position: "absolute", top: "55%", left: "62%",
        width: 12, height: 12, borderRadius: "50%",
        background: PALETTE.warm,
        boxShadow: `0 0 20px ${PALETTE.warm}, 0 0 40px ${PALETTE.warm}`,
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
        <CheckSmall color={PALETTE.mint} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: PALETTE.text }}>
          4 viewers following your screen
        </span>
      </div>
    </div>
  </div>
);

/* ── Layout helpers ──────────────────────────────────────────────────── */

const mockShellStyle: React.CSSProperties = {
  position: "relative",
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  background: PALETTE.surface,
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(176,198,255,0.10), inset 0 1px 0 rgba(255,255,255,0.05)",
};

const mockPrimaryBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  background: PALETTE.primary,
  color: PALETTE.primaryDeep,
  borderRadius: 8,
  fontSize: 12, fontWeight: 700,
};

const mockGhostBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  color: PALETTE.textDim,
  borderRadius: 8,
  border: `1px solid ${PALETTE.border}`,
  fontSize: 12, fontWeight: 600,
};

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
      <div className="hw-mono" style={{
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

/* ────────────────────────────────────────────────────────────────────── */

export default function HowItWorksView() {
  const router = useRouter();
  useReveal();

  const handleGuestEntry = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  const steps = [
    {
      n: "01",
      eyebrow: "Step one",
      title: "Open a board",
      copy:
        "Sign in with email or jump in as a guest. Name your board and start on a blank canvas — no project setup, no permissions to wire.",
      bullets: [
        "Guest mode: auto-generated name and cursor color, no account needed",
        "Boards persist via the API; guest boards also keep a local copy",
        "Changes sync as you draw — no save button to press",
      ],
      mock: <MockCreate />,
      color: PALETTE.primary,
    },
    {
      n: "02",
      eyebrow: "Step two",
      title: "Share the link",
      copy:
        "Hit Share, copy the board link, send it. Anyone who opens it joins instantly with their own name and cursor color — guests don't need an account.",
      bullets: [
        "One copyable link per board, no invite system to wrangle",
        "Live cursors carry each collaborator's name and color",
        "Connection state surfaces who's currently in the room",
      ],
      mock: <MockInvite />,
      color: PALETTE.primaryStrong,
    },
    {
      n: "03",
      eyebrow: "Step three",
      title: "Build it together",
      copy:
        "Drag from the eighteen-shape toolkit, draw orthogonal connections between cardinal ports, drop sticky notes, sketch freehand with the pen tool. Every change rides on Yjs — no conflicts to resolve.",
      bullets: [
        "18 shape types — flowchart classics, sticky notes, images",
        "Snap-to-grid, multi-select, copy / paste / duplicate",
        "Yjs-powered undo/redo shared across collaborators",
      ],
      mock: <MockBuild />,
      color: PALETTE.tertiary,
    },
    {
      n: "04",
      eyebrow: "Step four",
      title: "Present and export",
      copy:
        "Switch into Present mode and your viewport becomes the spotlight; followers' canvases track yours in real time. Toggle the laser pointer to direct attention, run the shared timer to keep pace, then export when you're done.",
      bullets: [
        "Presenter mode with shared timer and laser pointer",
        "Viewers follow your viewport — no screen-sharing required",
        "Export to PNG, JPEG, PDF, or JSON",
      ],
      mock: <MockPresent />,
      color: PALETTE.warm,
    },
  ];

  const technicals = [
    {
      label: "Sync layer",
      title: "Yjs CRDT under the hood",
      copy:
        "Shapes and connections live in Yjs maps. Two editors moving the same node simultaneously merge cleanly through the CRDT — no last-writer-wins reconciliation.",
      color: PALETTE.primary,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <path d="M9 6h6a3 3 0 0 1 3 3v6" />
        </svg>
      ),
    },
    {
      label: "Transport",
      title: "Socket.IO room per board",
      copy:
        "Each board opens a Socket.IO room via y-socket.io. Joining mid-session replays the full Yjs document; subsequent edits broadcast as small CRDT updates to every room member.",
      color: PALETTE.primaryStrong,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16" />
          <path d="M4 6h16" />
          <path d="M4 18h16" />
          <circle cx="8" cy="6" r="1.5" fill="currentColor" />
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="18" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      label: "State",
      title: "Local-first by design",
      copy:
        "The Yjs document lives in your browser. Edits land locally and apply instantly; on reconnect the CRDT merges your changes back into the room without conflicts.",
      color: PALETTE.tertiary,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l9-4 9 4-9 4-9-4z" />
          <path d="M3 12l9 4 9-4" />
          <path d="M3 17l9 4 9-4" />
        </svg>
      ),
    },
  ];

  const shortcuts = [
    { combo: ["V"],            label: "Select tool" },
    { combo: ["H"],            label: "Pan tool" },
    { combo: ["R"],            label: "Rectangle" },
    { combo: ["D"],            label: "Diamond" },
    { combo: ["O"],            label: "Oval" },
    { combo: ["A"],            label: "Arrow / connector" },
    { combo: ["P"],            label: "Pen" },
    { combo: ["T"],            label: "Text" },
    { combo: ["S"],            label: "Sticky note" },
    { combo: ["Space"],        label: "Hold to pan" },
    { combo: ["⌘", "Z"],       label: "Undo" },
    { combo: ["⌘", "⇧", "Z"],  label: "Redo" },
    { combo: ["⌘", "C"],       label: "Copy selection" },
    { combo: ["⌘", "V"],       label: "Paste" },
    { combo: ["⌘", "D"],       label: "Duplicate" },
    { combo: ["⌘", "0"],       label: "Reset zoom" },
    { combo: ["Del"],          label: "Delete selection" },
    { combo: ["Esc"],          label: "Clear selection" },
  ];

  const faqs = [
    {
      q: "Do guests need an account?",
      a: "No. Click \"Continue as guest\" from sign-in or open a shared board link, and you're in. CanvUs gives you an auto-generated name and a cursor color that persist in your browser.",
    },
    {
      q: "How does Present mode differ from screen-sharing?",
      a: "Screen-sharing pushes pixels; Present mode pushes viewport state. Each viewer renders the canvas locally at their own resolution, so text stays crisp regardless of bandwidth. The presenter gets a shared timer and laser pointer to keep the room aligned.",
    },
    {
      q: "What happens if I lose my connection?",
      a: "CanvUs is local-first via Yjs. Your edits keep landing on your own canvas while you're offline; once the socket reconnects, the CRDT merges your changes back into the room without conflicts or 'who wins' prompts.",
    },
    {
      q: "What can I export?",
      a: "PNG, JPEG, PDF, and JSON from the Export menu. PNG and JPEG are quick screenshots, PDF is sized to fit the canvas bounds, and JSON exports the raw shapes and connections for backup or re-import.",
    },
    {
      q: "What shapes are available?",
      a: "Eighteen — the standard flowchart set (rectangle, rounded rectangle, diamond, oval, parallelogram, trapezoid, hexagon, cylinder, document, predefined-process, manual-input, stored-data, internal-storage, circle, off-page, delay), plus sticky notes and image shapes.",
    },
    {
      q: "Where is my data stored?",
      a: "The canvas is a Yjs document in your browser, kept in sync through the API. Guest-mode boards also persist in your browser's local storage so you don't lose work between sessions.",
    },
  ];

  return (
    <div
      className="hw-root"
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
          position: "absolute", top: "40%", left: "-15%",
          width: 580, height: 580, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(176,198,255,0.10) 0%, transparent 65%)",
          filter: "blur(50px)",
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
            <span className="hw-mono" style={{
              fontSize: 9.5, fontWeight: 600, color: PALETTE.primary,
              padding: "2px 6px",
              border: "1px solid rgba(176,198,255,0.25)",
              borderRadius: 5, letterSpacing: "0.08em", marginLeft: 2,
            }}>
              BETA
            </span>
          </Link>

          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/features" className="hw-link">Features</Link>
            <Link href="/how-it-works" className="hw-link" style={{ color: PALETTE.text }}>How it works</Link>
            <span className="hw-link">Changelog</span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/sign-in" className="hw-link" style={{ padding: "6px 12px" }}>Sign in</Link>
            <button
              type="button"
              onClick={handleGuestEntry}
              className="hw-link"
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
            <Link href="/sign-up" className="hw-btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
              Open canvas
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 148, paddingBottom: 48 }}>
        <div className="hw-dots" style={{
          position: "absolute", inset: 0,
          maskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 30%, black 30%, transparent 75%)",
          opacity: 0.7, pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 880, margin: "0 auto", padding: "0 24px",
          position: "relative", textAlign: "center",
        }}>
          <div className="hw-fade hw-chip" style={{ marginBottom: 22 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: PALETTE.primaryStrong,
              boxShadow: `0 0 8px ${PALETTE.primaryStrong}`,
            }} />
            <span className="hw-mono" style={{ letterSpacing: "0.12em" }}>
              PRODUCT TOUR · 4 STEPS · ~3 MIN READ
            </span>
          </div>

          <h1 className="hw-fade-1" style={{
            fontSize: "clamp(38px, 5.4vw, 64px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            fontWeight: 800,
            color: PALETTE.text,
            margin: "0 0 22px",
          }}>
            From blank board to{" "}
            <span className="hw-grad" style={{ fontStyle: "italic" }}>shipped decision</span>
            {" "}— in four moves.
          </h1>

          <p className="hw-fade-2" style={{
            fontSize: 17, lineHeight: 1.65,
            color: PALETTE.textMuted,
            maxWidth: 600, margin: "0 auto 32px",
            fontWeight: 400,
          }}>
            CanvUs is a real-time collaborative canvas built around how teams actually
            meet, present, and decide. Here&apos;s the whole loop — from invite to export —
            in plain terms.
          </p>

          <div className="hw-fade-3" style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="hw-btn-primary" style={{ textDecoration: "none" }}>
              Open a free board
              <ArrowIcon />
            </Link>
            <button type="button" onClick={handleGuestEntry} className="hw-btn-ghost">
              Try as guest
            </button>
          </div>
        </div>
      </section>

      {/* THE FLOW — 4 steps */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="hw-eyebrow hw-reveal" style={{ justifyContent: "center" }}>The flow</div>
            <h2 className="hw-reveal hw-d1" style={{
              fontSize: "clamp(28px, 3.4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: PALETTE.text,
              marginTop: 14,
              lineHeight: 1.1,
            }}>
              The whole loop, end to end.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
            {steps.map((s, i) => {
              const reverse = i % 2 === 1;
              return (
                <div
                  key={s.n}
                  className="hw-reveal hw-d1"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.05fr",
                    gap: 56,
                    alignItems: "center",
                    direction: reverse ? "rtl" : "ltr",
                  }}
                >
                  {/* Copy */}
                  <div style={{ direction: "ltr" }}>
                    <div className="hw-mono" style={{
                      fontSize: 11, fontWeight: 700,
                      color: s.color,
                      letterSpacing: "0.18em",
                      marginBottom: 10,
                    }}>
                      {s.eyebrow.toUpperCase()} · {s.n}
                    </div>
                    <h3 style={{
                      fontSize: "clamp(24px, 2.6vw, 32px)",
                      fontWeight: 800,
                      letterSpacing: "-0.025em",
                      color: PALETTE.text,
                      lineHeight: 1.15,
                      margin: "0 0 16px",
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontSize: 15.5,
                      color: PALETTE.textMuted,
                      lineHeight: 1.7,
                      marginBottom: 22,
                    }}>
                      {s.copy}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {s.bullets.map((b) => (
                        <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <span style={{
                            flexShrink: 0,
                            marginTop: 5,
                            width: 14, height: 14, borderRadius: 4,
                            background: `${s.color}20`,
                            border: `1px solid ${s.color}50`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <CheckSmall color={s.color} size={9} />
                          </span>
                          <span style={{ fontSize: 14, color: PALETTE.text, lineHeight: 1.5 }}>
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock */}
                  <div style={{ direction: "ltr", position: "relative" }}>
                    <div style={{
                      position: "absolute", inset: -30,
                      background: `radial-gradient(ellipse at 50% 50%, ${s.color}1f 0%, transparent 65%)`,
                      filter: "blur(28px)", pointerEvents: "none",
                    }} />
                    <div style={{ position: "relative" }}>
                      {s.mock}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* UNDER THE HOOD */}
      <section style={{
        position: "relative", zIndex: 1,
        padding: "100px 24px",
        background: `linear-gradient(180deg, transparent 0%, ${PALETTE.bgDeep} 50%, transparent 100%)`,
      }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.4fr",
            gap: 60, marginBottom: 48, alignItems: "end",
          }}>
            <div>
              <div className="hw-eyebrow hw-reveal">Under the hood</div>
              <h2 className="hw-reveal hw-d1" style={{
                fontSize: "clamp(28px, 3.4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: PALETTE.text,
                marginTop: 14,
              }}>
                Built so it feels instant,
                <br />even when it isn&apos;t.
              </h2>
            </div>
            <p className="hw-reveal hw-d2" style={{
              fontSize: 16,
              color: PALETTE.textMuted,
              lineHeight: 1.7,
              maxWidth: 540,
              justifySelf: "end",
            }}>
              The technology under the canvas — Yjs, Socket.IO, local-first state —
              exists so you don&apos;t have to think about it. Here&apos;s what keeps
              edits in sync without conflicts.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
            gap: 14,
          }}>
            {technicals.map((t, i) => (
              <div key={t.title} className={`hw-card hw-reveal-scale hw-d${i + 1}`} style={{ padding: 26 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `${t.color}1a`,
                  border: `1px solid ${t.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: t.color, marginBottom: 18,
                }}>
                  {t.icon}
                </div>
                <div className="hw-mono" style={{
                  fontSize: 10, fontWeight: 700,
                  color: t.color,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}>
                  {t.label}
                </div>
                <h3 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: PALETTE.text,
                  marginBottom: 10,
                }}>
                  {t.title}
                </h3>
                <p style={{
                  fontSize: 13.5, color: PALETTE.textMuted,
                  lineHeight: 1.7, fontWeight: 400,
                }}>
                  {t.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHORTCUTS */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px 100px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ marginBottom: 40 }}>
            <div className="hw-eyebrow hw-reveal">Speed of thought</div>
            <h2 className="hw-reveal hw-d1" style={{
              fontSize: "clamp(28px, 3.4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: PALETTE.text,
              marginTop: 14,
              lineHeight: 1.1,
            }}>
              The shortcuts that
              <br />matter most.
            </h2>
          </div>

          <div className="hw-card hw-reveal" style={{ padding: 28 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 10,
            }}>
              {shortcuts.map((s) => (
                <div key={s.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${PALETTE.borderSoft}`,
                }}>
                  <span style={{ fontSize: 13.5, color: PALETTE.text, fontWeight: 500 }}>
                    {s.label}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {s.combo.map((k, ki) => (
                      <span key={ki} className="hw-kbd">{k}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ position: "relative", zIndex: 1, padding: "60px 24px 100px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div className="hw-eyebrow hw-reveal" style={{ justifyContent: "center" }}>
              Common questions
            </div>
            <h2 className="hw-reveal hw-d1" style={{
              fontSize: "clamp(26px, 3.2vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: PALETTE.text,
              marginTop: 14,
              lineHeight: 1.15,
            }}>
              The stuff people ask before signing up.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className={`hw-card hw-reveal hw-d${Math.min(i + 1, 4)}`}
                style={{ overflow: "hidden" }}
              >
                <summary className="hw-faq-summary">
                  {f.q}
                </summary>
                <div className="hw-faq-body">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
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
          animation: "hw-orbit 60s linear infinite",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <div className="hw-chip hw-reveal" style={{ marginBottom: 22 }}>
            <span className="hw-mono" style={{ letterSpacing: "0.12em" }}>
              YOU&apos;VE SEEN THE TOUR · NOW TRY IT
            </span>
          </div>
          <h2 className="hw-reveal hw-d1" style={{
            fontSize: "clamp(34px, 5.2vw, 58px)",
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: PALETTE.text,
            lineHeight: 1.02,
            marginBottom: 18,
          }}>
            Open a board in{" "}
            <span className="hw-grad" style={{ fontStyle: "italic" }}>one click</span>.
          </h2>
          <p className="hw-reveal hw-d2" style={{
            fontSize: 17,
            color: PALETTE.textMuted,
            maxWidth: 460,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}>
            Free forever. Three boards on the house. No credit card asked.
          </p>
          <div className="hw-reveal hw-d3" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/sign-up" className="hw-btn-primary" style={{ fontSize: 15, padding: "14px 28px", textDecoration: "none" }}>
              Open the canvas
              <ArrowIcon />
            </Link>
            <button type="button" onClick={handleGuestEntry} className="hw-btn-ghost" style={{ fontSize: 14 }}>
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
          <span className="hw-mono" style={{
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
              <span key={l} className="hw-link" style={{ fontSize: 12 }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Icon primitives ──────────────────────────────────────────────────── */
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
