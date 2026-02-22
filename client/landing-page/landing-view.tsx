"use client";

import { useState, useEffect, useRef } from "react";

/* ── Fonts & global styles injected via style tag ── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: #06070d; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: #1e2d40; border-radius: 4px; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes cursor-move {
      0%   { top: 38%; left: 30%; }
      25%  { top: 55%; left: 58%; }
      50%  { top: 30%; left: 65%; }
      75%  { top: 62%; left: 22%; }
      100% { top: 38%; left: 30%; }
    }
    @keyframes cursor2-move {
      0%   { top: 60%; left: 55%; }
      25%  { top: 28%; left: 42%; }
      50%  { top: 65%; left: 30%; }
      75%  { top: 40%; left: 70%; }
      100% { top: 60%; left: 55%; }
    }
    @keyframes draw-line {
      from { stroke-dashoffset: 300; }
      to { stroke-dashoffset: 0; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes grid-shift {
      0% { transform: translateY(0); }
      100% { transform: translateY(40px); }
    }
    .fade-up { animation: fadeUp 0.7s ease both; }
    .fade-up-1 { animation: fadeUp 0.7s 0.1s ease both; }
    .fade-up-2 { animation: fadeUp 0.7s 0.2s ease both; }
    .fade-up-3 { animation: fadeUp 0.7s 0.35s ease both; }
    .fade-up-4 { animation: fadeUp 0.7s 0.5s ease both; }

    .hero-btn-primary {
      background: #00d4aa;
      color: #06070d;
      border: none;
      padding: 14px 32px;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      cursor: pointer;
      font-family: 'Manrope', sans-serif;
      letter-spacing: 0.01em;
      transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
      position: relative;
      overflow: hidden;
    }
    .hero-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px #00d4aa55;
      background: #00e8bc;
    }
    .hero-btn-secondary {
      background: transparent;
      color: #94a3b8;
      border: 1px solid #1e2d40;
      padding: 14px 28px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      font-family: 'Manrope', sans-serif;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    .hero-btn-secondary:hover {
      border-color: #00d4aa;
      color: #00d4aa;
      background: #00d4aa08;
    }
    .feature-card {
      background: #0d1117;
      border: 1px solid #1a2332;
      border-radius: 20px;
      padding: 28px;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      cursor: default;
    }
    .feature-card:hover {
      border-color: #00d4aa44;
      transform: translateY(-4px);
      box-shadow: 0 16px 48px #00d4aa10;
    }
    .nav-link {
      color: #64748b;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.15s;
      cursor: pointer;
    }
    .nav-link:hover { color: #e2e8f0; }
    .stat-card {
      background: #0d1117;
      border: 1px solid #1a2332;
      border-radius: 16px;
      padding: 24px 28px;
      text-align: center;
    }
    .plan-card {
      background: #0d1117;
      border: 1px solid #1a2332;
      border-radius: 24px;
      padding: 32px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .plan-card.featured {
      border-color: #00d4aa60;
      box-shadow: 0 0 60px #00d4aa14;
    }
    .plan-card:not(.featured):hover {
      border-color: #1e2d40;
    }
    .testimonial-card {
      background: #0d1117;
      border: 1px solid #1a2332;
      border-radius: 20px;
      padding: 24px 28px;
    }
  `}</style>
);

/* ── Animated canvas preview ── */
const CanvasPreview = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(135deg, #0d1117 0%, #0a1628 100%)",
      }}
    >
      {/* Grid lines */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.35,
        }}
      >
        <defs>
          <pattern
            id="grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="#1e2d40"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Flowchart shapes */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        {/* Connections */}
        <line
          x1="50%"
          y1="92"
          x2="50%"
          y2="152"
          stroke="#00d4aa"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity="0.6"
        />
        <line
          x1="50%"
          y1="222"
          x2="50%"
          y2="270"
          stroke="#00d4aa"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity="0.6"
        />
        <line
          x1="50%"
          y1="340"
          x2="50%"
          y2="385"
          stroke="#00d4aa"
          strokeWidth="1.5"
          strokeDasharray="4,3"
          opacity="0.6"
          style={{
            animation: "draw-line 2s ease infinite",
            strokeDashoffset: 300,
          }}
        />

        {/* Start node */}
        <rect
          x="calc(50% - 70)"
          y="52"
          width="140"
          height="40"
          rx="20"
          fill="#0d3d30"
          stroke="#00d4aa"
          strokeWidth="1.5"
        />
        <text
          x="50%"
          y="77"
          textAnchor="middle"
          fill="#00d4aa"
          fontSize="12"
          fontFamily="Manrope"
          fontWeight="700"
        >
          Start Meeting
        </text>

        {/* Process box */}
        <rect
          x="calc(50% - 90)"
          y="152"
          width="180"
          height="70"
          rx="10"
          fill="#0d1f3d"
          stroke="#3b82f6"
          strokeWidth="1.5"
        />
        <text
          x="50%"
          y="183"
          textAnchor="middle"
          fill="#93c5fd"
          fontSize="11"
          fontFamily="Manrope"
          fontWeight="700"
        >
          Present Flowchart
        </text>
        <text
          x="50%"
          y="200"
          textAnchor="middle"
          fill="#3b82f6"
          fontSize="10"
          fontFamily="Manrope"
          opacity="0.8"
        >
          Edit together in real-time
        </text>

        {/* Decision diamond */}
        <polygon
          points={`calc(50%),270 calc(50% + 85),305 calc(50%),340 calc(50% - 85),305`}
          fill="#1f1030"
          stroke="#a855f7"
          strokeWidth="1.5"
        />
        <text
          x="50%"
          y="309"
          textAnchor="middle"
          fill="#d8b4fe"
          fontSize="10"
          fontFamily="Manrope"
          fontWeight="700"
        >
          Approved?
        </text>

        {/* End node */}
        <rect
          x="calc(50% - 60)"
          y="385"
          width="120"
          height="38"
          rx="19"
          fill="#1f0d1d"
          stroke="#ec4899"
          strokeWidth="1.5"
        />
        <text
          x="50%"
          y="410"
          textAnchor="middle"
          fill="#f9a8d4"
          fontSize="11"
          fontFamily="Manrope"
          fontWeight="700"
        >
          Ship it 🚀
        </text>

        {/* Sticky note */}
        <rect
          x="72%"
          y="155"
          width="130"
          height="80"
          rx="4"
          fill="#1f1800"
          stroke="#eab308"
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="72%"
          dx="14"
          y="178"
          fill="#fde68a"
          fontSize="10"
          fontFamily="Manrope"
          fontWeight="600"
        >
          📝 Notes
        </text>
        <text
          x="72%"
          dx="14"
          y="198"
          fill="#ca8a04"
          fontSize="9"
          fontFamily="Manrope"
        >
          Review before
        </text>
        <text
          x="72%"
          dx="14"
          y="212"
          fill="#ca8a04"
          fontSize="9"
          fontFamily="Manrope"
        >
          client sign-off
        </text>
        <line
          x1="72%"
          y1="235"
          x2="50%"
          y2="310"
          stroke="#eab308"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.3"
        />
      </svg>

      {/* Live cursor 1 */}
      <div
        style={{
          position: "absolute",
          animation: "cursor-move 8s ease-in-out infinite",
          transition: "top 2s ease, left 2s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#3b82f6"
          style={{ filter: "drop-shadow(0 2px 4px #0008)" }}
        >
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div
          style={{
            background: "#3b82f6",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
            marginTop: 2,
            fontFamily: "Manrope",
            whiteSpace: "nowrap",
          }}
        >
          Mia Chen
        </div>
      </div>

      {/* Live cursor 2 */}
      <div
        style={{
          position: "absolute",
          animation: "cursor2-move 11s ease-in-out infinite",
          transition: "top 3s ease, left 3s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#ec4899"
          style={{ filter: "drop-shadow(0 2px 4px #0008)" }}
        >
          <path d="M5 3l14 9-7 1-4 7z" />
        </svg>
        <div
          style={{
            background: "#ec4899",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 8,
            marginTop: 2,
            fontFamily: "Manrope",
            whiteSpace: "nowrap",
          }}
        >
          Jake L.
        </div>
      </div>

      {/* Toolbar overlay */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "#0d1117cc",
          border: "1px solid #1a2332",
          borderRadius: 12,
          backdropFilter: "blur(8px)",
          padding: "8px 6px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {["▢", "◇", "○", "✎", "→"].map((ic, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: i === 0 ? "#00d4aa18" : "transparent",
              border: i === 0 ? "1px solid #00d4aa60" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color: i === 0 ? "#00d4aa" : "#475569",
              cursor: "default",
            }}
          >
            {ic}
          </div>
        ))}
      </div>

      {/* Presence avatars */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "#0d1117cc",
          border: "1px solid #1a2332",
          borderRadius: 10,
          backdropFilter: "blur(8px)",
          padding: "6px 10px",
        }}
      >
        {[
          ["MK", "#00d4aa"],
          ["MC", "#3b82f6"],
          ["JL", "#ec4899"],
        ].map(([av, col]) => (
          <div
            key={av}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: col,
              fontSize: 9,
              fontWeight: 800,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #06070d",
              fontFamily: "Manrope",
            }}
          >
            {av}
          </div>
        ))}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 6px #22c55e",
            marginLeft: 4,
          }}
        />
        <span
          style={{
            fontSize: 10,
            color: "#64748b",
            fontFamily: "Manrope",
            fontWeight: 600,
          }}
        >
          3 live
        </span>
      </div>

      {/* Glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 120%, #00d4aa12 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

/* ── Main landing page ── */
export default function LandingPageView() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [billingAnnual, setBillingAnnual] = useState(true);

  const features = [
    {
      icon: "⚡",
      title: "Zero-lag collaboration",
      desc: "Powered by Yjs CRDT — edits from multiple people merge instantly with no conflicts, even on slow connections.",
      color: "#00d4aa",
    },
    {
      icon: "🖥️",
      title: "Present Mode",
      desc: "One click to enter distraction-free presentation. Audience follows your viewport in real time — no screen sharing needed.",
      color: "#3b82f6",
    },
    {
      icon: "🎨",
      title: "Rich flowchart toolkit",
      desc: "Process boxes, decision diamonds, swimlanes, sticky notes, connectors, freehand drawing, and smart snap-to-grid.",
      color: "#a855f7",
    },
    {
      icon: "💬",
      title: "In-canvas chat",
      desc: "Comment threads anchored to shapes. No need to switch to Slack mid-meeting — everything lives on the board.",
      color: "#ec4899",
    },
    {
      icon: "📤",
      title: "Export anywhere",
      desc: "Download as high-res PNG, PDF, or SVG. Or share a live read-only link for stakeholders who just need to view.",
      color: "#f59e0b",
    },
    {
      icon: "🔒",
      title: "Secure rooms",
      desc: "OAuth via Google or GitHub. Role-based access: owner, editor, viewer. Enterprise SSO on Team plan.",
      color: "#22c55e",
    },
  ];

  const testimonials = [
    {
      name: "Sarah K.",
      role: "Product Lead @ Notion",
      text: "We replaced Miro for our sprint planning. CanvUs is snappier and the present mode actually works during standups.",
      avatar: "SK",
      color: "#00d4aa",
    },
    {
      name: "David R.",
      role: "Engineering Manager",
      text: "Our architecture reviews went from 2 hours of confusion to 45 minutes of clarity. Everyone can edit and see changes live.",
      avatar: "DR",
      color: "#3b82f6",
    },
    {
      name: "Ana M.",
      role: "UX Designer",
      text: "The sticky note anchoring feature alone is worth switching. No more 'where was that comment?' chaos.",
      avatar: "AM",
      color: "#a855f7",
    },
  ];

  return (
    <div
      style={{
        background: "#06070d",
        color: "#e2e8f0",
        fontFamily: "'Manrope', sans-serif",
        overflowX: "hidden",
      }}
    >
      <GlobalStyles />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "#06070dcc",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #1a2332",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            CanvUs
          </span>
        </div>

        {/* Nav links — desktop */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "How it works", "Pricing", "Templates"].map((l) => (
            <span key={l} className="nav-link">
              {l}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="hero-btn-secondary"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            Log in
          </button>
          <button
            className="hero-btn-primary"
            style={{ padding: "8px 18px", fontSize: 13 }}
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          minHeight: "100vh",
          paddingTop: 64,
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background effects */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 700,
              height: 700,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #00d4aa0a 0%, transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "10%",
              right: "-10%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #3b82f608 0%, transparent 70%)",
            }}
          />
          {/* Decorative lines */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0.15,
            }}
          >
            <defs>
              <pattern
                id="dots"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1" fill="#1e2d40" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1.1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left copy */}
          <div>
            <div
              className="fade-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
                background: "#00d4aa12",
                border: "1px solid #00d4aa30",
                borderRadius: 100,
                padding: "6px 14px",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#00d4aa",
                  boxShadow: "0 0 10px #00d4aa",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#00d4aa",
                  letterSpacing: "0.05em",
                }}
              >
                NOW IN OPEN BETA · FREE TO START
              </span>
            </div>

            <h1
              className="fade-up-1"
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(38px, 5.5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                marginBottom: 20,
                color: "white",
              }}
            >
              Your team's
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #00d4aa, #0ea5e9, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% auto",
                  animation: "shimmer 4s linear infinite",
                }}
              >
                thinking space.
              </span>
            </h1>

            <p
              className="fade-up-2"
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "#64748b",
                marginBottom: 36,
                maxWidth: 440,
              }}
            >
              Real-time collaborative flowcharts and whiteboards built for
              meetings. Everyone edits together — no lag, no conflict, no
              switching tabs.
            </p>

            <div
              className="fade-up-3"
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <button
                className="hero-btn-primary"
                style={{ fontSize: 15, padding: "14px 28px" }}
              >
                Start a free board →
              </button>
              <button className="hero-btn-secondary">Watch 90-sec demo</button>
            </div>

            <div
              className="fade-up-4"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              {[
                { label: "No credit card required", icon: "✓" },
                { label: "Up to 3 boards free", icon: "✓" },
                { label: "Invite unlimited guests", icon: "✓" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <span
                    style={{ color: "#00d4aa", fontWeight: 800, fontSize: 13 }}
                  >
                    {item.icon}
                  </span>
                  <span
                    style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated canvas preview */}
          <div className="fade-up-2" style={{ position: "relative" }}>
            {/* Glow behind preview */}
            <div
              style={{
                position: "absolute",
                inset: -30,
                borderRadius: 32,
                background:
                  "radial-gradient(ellipse at 50% 50%, #00d4aa18 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid #1e2d40",
                boxShadow: "0 32px 80px #000a, 0 0 0 1px #00d4aa18",
                height: 460,
              }}
            >
              {/* Fake browser chrome */}
              <div
                style={{
                  background: "#0d1117",
                  padding: "10px 16px",
                  borderBottom: "1px solid #1a2332",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {["#f43f5e", "#f59e0b", "#22c55e"].map((c) => (
                    <div
                      key={c}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: c,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: "#161d28",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: 11,
                    color: "#475569",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  CanvUs.app/board/team-q2-planning
                </div>
              </div>
              <div style={{ height: "calc(100% - 37px)" }}>
                <CanvasPreview />
              </div>
            </div>

            {/* Floating badge: live users */}
            <div
              style={{
                position: "absolute",
                bottom: -18,
                left: 24,
                background: "#0d1117",
                border: "1px solid #1a2332",
                borderRadius: 14,
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 8px 32px #0006",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "#22c55e",
                    animation: "pulse-ring 1.5s ease-out infinite",
                  }}
                />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                3 people editing
              </span>
            </div>

            {/* Floating badge: autosave */}
            <div
              style={{
                position: "absolute",
                top: 60,
                right: -18,
                background: "#0d1117",
                border: "1px solid #1a2332",
                borderRadius: 12,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: "#00d4aa",
                boxShadow: "0 8px 32px #0006",
                animation: "float 5s 1.5s ease-in-out infinite",
              }}
            >
              ✓ Auto-saved
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div
        style={{
          borderTop: "1px solid #1a2332",
          borderBottom: "1px solid #1a2332",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 48,
          flexWrap: "wrap",
          background: "#0d1117",
        }}
      >
        {[
          { val: "12,000+", label: "boards created" },
          { val: "98%", label: "uptime SLA" },
          { val: "<50ms", label: "sync latency" },
          { val: "4.9 ★", label: "avg. user rating" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: "white",
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#475569",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#00d4aa",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            EVERYTHING YOU NEED
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: 16,
            }}
          >
            Built for how teams actually work
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#475569",
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            Not just a whiteboard — a focused tool for idea-driven meetings.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              onMouseEnter={() => setActiveFeature(i)}
              style={{
                borderColor: activeFeature === i ? `${f.color}40` : "#1a2332",
                boxShadow:
                  activeFeature === i ? `0 16px 48px ${f.color}12` : "none",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: 17,
                  color: "white",
                  marginBottom: 8,
                }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          padding: "80px 24px",
          background: "#0d1117",
          borderTop: "1px solid #1a2332",
          borderBottom: "1px solid #1a2332",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#3b82f6",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              HOW IT WORKS
            </div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(26px, 4vw, 40px)",
                letterSpacing: "-0.03em",
                color: "white",
              }}
            >
              From invite to insight in 60 seconds
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              position: "relative",
            }}
          >
            {/* Connector line */}
            <div
              style={{
                position: "absolute",
                top: 28,
                left: "16.5%",
                right: "16.5%",
                height: 1,
                background: "linear-gradient(90deg, #00d4aa, #3b82f6, #a855f7)",
                opacity: 0.4,
              }}
            />

            {[
              {
                step: "01",
                title: "Create a board",
                desc: "Sign in with Google or GitHub. Name your board and set it up in seconds.",
                color: "#00d4aa",
              },
              {
                step: "02",
                title: "Invite your team",
                desc: "Share a link. Everyone joins with their name and color. No installs needed.",
                color: "#3b82f6",
              },
              {
                step: "03",
                title: "Build & present",
                desc: "Drag shapes, draw connections, add notes. Hit Present to go full-screen.",
                color: "#a855f7",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "0 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `${s.color}15`,
                    border: `2px solid ${s.color}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: s.color,
                    marginBottom: 20,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "white",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#a855f7",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            TESTIMONIALS
          </div>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(26px, 4vw, 40px)",
              letterSpacing: "-0.03em",
              color: "white",
            }}
          >
            Teams love CanvUs
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: "#f59e0b", fontSize: 14 }}>
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: t.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    style={{ fontSize: 13, fontWeight: 700, color: "white" }}
                  >
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        style={{
          padding: "80px 24px 100px",
          background: "#0d1117",
          borderTop: "1px solid #1a2332",
          borderBottom: "1px solid #1a2332",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#f59e0b",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              PRICING
            </div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(26px, 4vw, 40px)",
                letterSpacing: "-0.03em",
                color: "white",
                marginBottom: 20,
              }}
            >
              Simple, honest pricing
            </h2>

            {/* Toggle */}
            <div
              style={{
                display: "inline-flex",
                background: "#161d28",
                borderRadius: 12,
                padding: 4,
                gap: 4,
              }}
            >
              {["Monthly", "Annual (save 30%)"].map((label, i) => (
                <button
                  key={label}
                  onClick={() => setBillingAnnual(i === 1)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 9,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Manrope', sans-serif",
                    background:
                      billingAnnual === (i === 1) ? "#00d4aa" : "transparent",
                    color: billingAnnual === (i === 1) ? "#06070d" : "#64748b",
                    transition: "all 0.2s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[
              {
                name: "Free",
                price: 0,
                desc: "For individuals and small experiments",
                features: [
                  "3 boards",
                  "Up to 5 collaborators/board",
                  "PNG export",
                  "30-day board history",
                ],
                cta: "Get started free",
                featured: false,
              },
              {
                name: "Pro",
                price: billingAnnual ? 12 : 17,
                desc: "For teams who meet regularly",
                features: [
                  "Unlimited boards",
                  "Unlimited collaborators",
                  "Present Mode + Follow",
                  "PDF & SVG export",
                  "Board snapshots & history",
                  "Priority support",
                ],
                cta: "Start free trial",
                featured: true,
              },
              {
                name: "Team",
                price: billingAnnual ? 29 : 39,
                desc: "For organisations with multiple teams",
                features: [
                  "Everything in Pro",
                  "SSO / SAML auth",
                  "Admin dashboard",
                  "Usage analytics",
                  "Custom templates",
                  "SLA + dedicated support",
                ],
                cta: "Contact sales",
                featured: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`plan-card${plan.featured ? " featured" : ""}`}
              >
                {plan.featured && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#00d4aa",
                      letterSpacing: "0.1em",
                      marginBottom: 12,
                    }}
                  >
                    ★ MOST POPULAR
                  </div>
                )}
                <h3
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  {plan.name}
                </h3>
                <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
                  {plan.desc}
                </p>
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: 40,
                      color: "white",
                    }}
                  >
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span style={{ color: "#475569", fontSize: 13 }}>
                      /user/mo
                    </span>
                  )}
                </div>
                <button
                  style={{
                    width: "100%",
                    padding: "11px",
                    borderRadius: 11,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    background: plan.featured ? "#00d4aa" : "#161d28",
                    color: plan.featured ? "#06070d" : "#94a3b8",
                    marginBottom: 24,
                    transition: "all 0.15s",
                  }}
                >
                  {plan.cta}
                </button>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#00d4aa",
                          fontWeight: 800,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "100px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 50% 50%, #00d4aa0a 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 56px)",
              letterSpacing: "-0.03em",
              color: "white",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Your next great idea
            <br />
            starts with a blank board.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "#475569",
              maxWidth: 460,
              margin: "0 auto 36px",
            }}
          >
            Join thousands of teams who replaced slide decks with CanvUs.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="hero-btn-primary"
              style={{ fontSize: 16, padding: "15px 36px" }}
            >
              Create your first board — it's free
            </button>
            <button className="hero-btn-secondary" style={{ fontSize: 15 }}>
              Schedule a demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid #1a2332",
          padding: "40px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            ◈
          </div>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: "white",
            }}
          >
            CanvUs
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Status", "GitHub"].map((l) => (
            <span key={l} className="nav-link" style={{ fontSize: 13 }}>
              {l}
            </span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "#334155" }}>
          © 2026 CanvUs · Built with ♥
        </span>
      </footer>
    </div>
  );
}
