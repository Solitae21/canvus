"use client";

import { useRef, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setTool, ToolType } from "@/redux/slice/canvas/canvas-slice";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Stitch-style floating toolbar – horizontal pill, bottom-center
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const Icon = ({
  d,
  size = 20,
}: {
  d: string | string[];
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
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

/* ── Flowchart shapes ─────────────────────────────────────────────────────── */
type FlowShape = {
  id: string;
  label: string;
  icon: string | string[];
};

const FLOWCHART_SHAPES: FlowShape[] = [
  {
    id: "rect",
    label: "Process",
    icon: "M3 5h18v14H3z",
  },
  {
    id: "rounded-rect",
    label: "Alternate Process",
    icon: "M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z",
  },
  {
    id: "diamond",
    label: "Decision",
    icon: "M12 2l10 10-10 10L2 12z",
  },
  {
    id: "oval",
    label: "Terminal",
    icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  },
  {
    id: "parallelogram",
    label: "Input / Output",
    icon: "M6 4h16l-4 16H2z",
  },
  {
    id: "trapezoid",
    label: "Manual Operation",
    icon: "M4 4h16l-3 16H7z",
  },
  {
    id: "hexagon",
    label: "Preparation",
    icon: "M8 2h8l4 10-4 10H8L4 12z",
  },
  {
    id: "cylinder",
    label: "Database",
    icon: [
      "M4 6c0-1.66 3.58-3 8-3s8 1.34 8 3",
      "M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6",
      "M4 6c0 1.66 3.58 3 8 3s8-1.34 8-3",
    ],
  },
  {
    id: "document",
    label: "Document",
    icon: "M4 3h16v15c-2-2-4-3-8-1s-6 0-8-2z",
  },
  {
    id: "predefined-process",
    label: "Predefined Process",
    icon: ["M3 4h18v16H3z", "M6 4v16", "M18 4v16"],
  },
  {
    id: "manual-input",
    label: "Manual Input",
    icon: "M3 8l18-4v16H3z",
  },
  {
    id: "stored-data",
    label: "Stored Data",
    icon: "M6 3h15v18H6a4 4 0 0 1 0-18z",
  },
  {
    id: "internal-storage",
    label: "Internal Storage",
    icon: ["M3 3h18v18H3z", "M3 7h18", "M7 3v18"],
  },
  {
    id: "circle",
    label: "Connector",
    icon: "M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
  },
  {
    id: "off-page",
    label: "Off-page Connector",
    icon: "M5 3h14v12l-7 6-7-6z",
  },
  {
    id: "delay",
    label: "Delay",
    icon: "M3 4h12a7 7 0 0 1 0 16H3z",
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
  {
    id: "text",
    label: "Text",
    icon: "M4 7V4h16v3M9 20h6M12 4v16",
    shortcut: "T",
  },
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

/* ── Shape selector popover ───────────────────────────────────────────────── */
const ShapeSelector = ({
  activeTool,
  onSelect,
}: {
  activeTool: string;
  onSelect: (id: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<FlowShape>(FLOWCHART_SHAPES[0]);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const quickShapeIds = new Set(["rect", "diamond", "oval", "parallelogram"]);
  const isShapeActive =
    FLOWCHART_SHAPES.some((s) => s.id === activeTool) &&
    !quickShapeIds.has(activeTool);

  return (
    <div ref={ref} className="relative">
      {/* Trigger: shows the last-selected shape + a chevron */}
      <button
        onClick={() => setOpen(!open)}
        title={`Shapes — ${selectedShape.label}`}
        className={`
          group relative flex items-center justify-center gap-0.5
          h-10 pl-2.5 pr-1.5 rounded-xl
          transition-all duration-150 ease-out
          ${
            isShapeActive
              ? "bg-primary/[0.14] text-primary shadow-[inset_0_0_0_1.5px_rgba(176,198,255,0.25)]"
              : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]"
          }
        `}
      >
        <Icon d={selectedShape.icon} size={20} />
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`opacity-50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 15l6-6 6 6" />
        </svg>

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
          Shapes
        </span>
      </button>

      {/* Popover grid */}
      {open && (
        <div
          className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2
                      w-[340px] p-3
                      bg-surface-container/90 backdrop-blur-[24px]
                      border border-white/[0.07]
                      rounded-2xl
                      shadow-[0_12px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]
                      animate-shape-popover"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[12px] font-semibold tracking-wide text-on-surface-variant uppercase">
              Flowchart Shapes
            </span>
            <span className="text-[11px] text-on-surface-variant/50">
              {FLOWCHART_SHAPES.length} shapes
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-1">
            {FLOWCHART_SHAPES.map((shape) => {
              const isActive = activeTool === shape.id;
              return (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedShape(shape);
                    onSelect(shape.id);
                    setOpen(false);
                  }}
                  className={`
                    group/shape flex flex-col items-center gap-1.5
                    px-1.5 py-2.5 rounded-xl
                    transition-all duration-150
                    ${
                      isActive
                        ? "bg-primary/[0.12] text-primary"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-lg
                      transition-all duration-150
                      ${
                        isActive
                          ? "bg-primary/[0.1]"
                          : "bg-white/[0.03] group-hover/shape:bg-white/[0.06]"
                      }
                    `}
                  >
                    <Icon d={shape.icon} size={22} />
                  </div>
                  <span className="text-[10px] font-medium leading-tight text-center line-clamp-2">
                    {shape.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Quick-access shapes (most common flowchart shapes) ───────────────────── */
const QUICK_SHAPES: Tool[] = [
  { id: "rect", label: "Process", icon: "M3 5h18v14H3z", shortcut: "R" },
  { id: "diamond", label: "Decision", icon: "M12 2l10 10-10 10L2 12z", shortcut: "D" },
  { id: "oval", label: "Terminal", icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0", shortcut: "O" },
  { id: "parallelogram", label: "Input / Output", icon: "M6 4h16l-4 16H2z" },
];

/* ── Main toolbar ─────────────────────────────────────────────────────────── */
const Toolbar = () => {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector((s) => s.canvas.tool);

  const renderGroup = (tools: Tool[]) =>
    tools.map((tool) => (
      <ToolButton
        key={tool.id}
        tool={tool}
        active={activeTool === tool.id}
        onClick={() => dispatch(setTool(tool.id as ToolType))}
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
        {renderGroup(QUICK_SHAPES)}
        <ShapeSelector
          activeTool={activeTool}
          onSelect={(id) => dispatch(setTool(id as ToolType))}
        />
        <Sep />
        {renderGroup(DRAW_TOOLS)}
        <Sep />
        {renderGroup(EXTRAS)}
      </div>
    </div>
  );
};

export default Toolbar;
