"use client";

import { useState } from "react";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Stitch-style floating toolbar – horizontal pill, bottom-center
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const Icon = ({
  d,
  size = 20,
  filled,
}: {
  d: string | string[];
  size?: number;
  filled?: boolean;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((path, i) => <path key={i} d={path} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

/* ── Tool definitions ─────────────────────────────────────────────────────── */
type Tool = {
  id: string;
  label: string;
  icon: string | string[];
  shortcut?: string;
};

const TOOLS: Tool[] = [
  {
    id: "select",
    label: "Select",
    icon: "M5 3l14 9-7 1-4 7z",
    shortcut: "V",
  },
  {
    id: "hand",
    label: "Hand",
    icon: [
      "M18 11V6a2 2 0 0 0-4 0",
      "M14 10V4a2 2 0 0 0-4 0v7",
      "M10 10.5V6a2 2 0 0 0-4 0v8",
      "M18 11a2 2 0 0 1 4 0v5a8 8 0 0 1-8 8h-2c-2.5 0-4-1-5.5-3l-3-4.5a2 2 0 0 1 3-2.5L8 15",
    ],
    shortcut: "H",
  },
];

const SHAPES: Tool[] = [
  { id: "rect", label: "Rectangle", icon: "M3 3h18v18H3z", shortcut: "R" },
  {
    id: "diamond",
    label: "Diamond",
    icon: "M12 2l10 10-10 10L2 12z",
    shortcut: "D",
  },
  {
    id: "oval",
    label: "Ellipse",
    icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
    shortcut: "O",
  },
];

const DRAW_TOOLS: Tool[] = [
  {
    id: "pen",
    label: "Pen",
    icon: "M15.232 5.232l3.536 3.536M9 13l-4 4V13h4zm6-6l-6 6",
    shortcut: "P",
  },
  {
    id: "arrow",
    label: "Arrow",
    icon: ["M5 12h14", "M12 5l7 7-7 7"],
    shortcut: "A",
  },
  { id: "text", label: "Text", icon: "M4 7V4h16v3M9 20h6M12 4v16", shortcut: "T" },
];

const EXTRAS: Tool[] = [
  {
    id: "sticky",
    label: "Sticky note",
    icon: "M5 3h14a2 2 0 0 1 2 2v14l-5 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    shortcut: "S",
  },
  {
    id: "image",
    label: "Image",
    icon: [
      "M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",
      "M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
      "M21 15l-5-5L5 21",
    ],
  },
];

/* ── Separator ── */
const Sep = () => (
  <div className="w-px h-6 bg-white/[0.08] mx-0.5 shrink-0" />
);

/* ── Single tool button ── */
const ToolButton = ({
  tool,
  active,
  onClick,
}: {
  tool: Tool;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ""}`}
    className={`
      group relative flex items-center justify-center
      w-10 h-10 rounded-xl
      transition-all duration-150 ease-out
      ${
        active
          ? "bg-primary/[0.14] text-primary shadow-[inset_0_0_0_1.5px_rgba(176,198,255,0.25)]"
          : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]"
      }
    `}
  >
    <Icon d={tool.icon} />
    {/* Tooltip */}
    <span
      className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2
                  px-2.5 py-1 text-[11px] font-medium tracking-wide
                  bg-surface-container-highest text-on-surface
                  rounded-md shadow-lg
                  opacity-0 scale-95 translate-y-1
                  group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
                  transition-all duration-150 whitespace-nowrap"
    >
      {tool.label}
      {tool.shortcut && (
        <span className="ml-1.5 text-on-surface-variant/60">{tool.shortcut}</span>
      )}
    </span>
  </button>
);

/* ── Main toolbar ─────────────────────────────────────────────────────────── */
const Toolbar = () => {
  const [activeTool, setActiveTool] = useState("select");

  const renderGroup = (tools: Tool[]) =>
    tools.map((tool) => (
      <ToolButton
        key={tool.id}
        tool={tool}
        active={activeTool === tool.id}
        onClick={() => setActiveTool(tool.id)}
      />
    ));

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="flex items-center gap-0.5 px-2 py-1.5
                    bg-surface-container/80 backdrop-blur-[24px]
                    border border-white/[0.07]
                    rounded-2xl
                    shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)]
                    pointer-events-auto animate-toolbar-enter"
      >
        {renderGroup(TOOLS)}
        <Sep />
        {renderGroup(SHAPES)}
        <Sep />
        {renderGroup(DRAW_TOOLS)}
        <Sep />
        {renderGroup(EXTRAS)}
      </div>
    </div>
  );
};

export default Toolbar;
