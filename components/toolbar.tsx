"use client";

import { Button } from "@/components/ui/button";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={path} />
  </svg>
);
const icons = {
  cursor: "M5 3l14 9-7 1-4 7z",
  rect: "M3 3h18v18H3z",
  diamond: "M12 2l10 10-10 10L2 12z",
  circle: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0",
  arrow: "M5 12h14M12 5l7 7-7 7",
  pen: "M15.232 5.232l3.536 3.536M9 13l-4 4V13h4zm6-6l-6 6",
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  sticky: "M5 3h14a2 2 0 0 1 2 2v14l-5 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  present: "M1 6l11 6 11-6M1 6v12l11 6 11-12V6",
  zoomIn:
    "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M11 8v6M8 11h6",
  zoomOut: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35M8 11h6",
  undo: "M3 7v6h6M3.51 15a9 9 0 1 0 .49-3.96",
  redo: "M21 7v6h-6M20.49 15a9 9 0 1 1-.49-3.96",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  export: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  close: "M18 6L6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
};

type ToolbarItems = {
  id: string;
  label: string;
  icon: keyof typeof icons;
};

const TOOLS: ToolbarItems[] = [
  { id: "cursor", label: "Select", icon: "cursor" },
  { id: "rect", label: "Process", icon: "rect" },
  { id: "diamond", label: "Decision", icon: "diamond" },
  { id: "oval", label: "Terminal", icon: "circle" },
  { id: "sticky", label: "Note", icon: "sticky" },
  { id: "pen", label: "Draw", icon: "pen" },
  { id: "text", label: "Text", icon: "text" },
  { id: "arrow", label: "Connect", icon: "arrow" },
];

const Toolbar = () => {
  return (
    <>
      <div className="flex flex-col gap-4 border border-gray-400 p-2 w-20 rounded-2xl">
        {TOOLS.map((tool) => (
          <div className="flex flex-col items-center cursor-pointer transition-all hover:bg-gray-200 ">
           <Icon path={icons[tool.icon]} />
           {tool.label}
          </div>
        ))}
      </div>
    </>
  );
};

export default Toolbar;
