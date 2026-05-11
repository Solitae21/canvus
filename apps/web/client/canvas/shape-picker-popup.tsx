"use client";

import { useEffect, useRef, useState } from "react";
import type { ShapeType } from "@canvus/shared";
import { usePresence } from "@/lib/use-presence";

const SHAPE_OPTIONS: Array<{ type: ShapeType; label: string }> = [
  { type: "rect", label: "Rectangle" },
  { type: "rounded-rect", label: "Rounded" },
  { type: "diamond", label: "Diamond" },
  { type: "oval", label: "Oval" },
  { type: "circle", label: "Circle" },
  { type: "hexagon", label: "Hexagon" },
  { type: "parallelogram", label: "Parallelogram" },
  { type: "cylinder", label: "Cylinder" },
  { type: "sticky", label: "Sticky" },
];

function ShapeIcon({ type }: { type: ShapeType }) {
  const stroke = type === "sticky" ? "#92400e" : "currentColor";
  const fill = type === "sticky" ? "#fef3c7" : "none";

  switch (type) {
    case "rect":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <rect x="2" y="3" width="28" height="18" rx="0" />
        </svg>
      );
    case "rounded-rect":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <rect x="2" y="3" width="28" height="18" rx="5" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <polygon points="16,1 31,12 16,23 1,12" />
        </svg>
      );
    case "oval":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <ellipse cx="16" cy="12" rx="14" ry="10" />
        </svg>
      );
    case "circle":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <circle cx="16" cy="12" r="10" />
        </svg>
      );
    case "hexagon":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <polygon points="16,1 29,6.5 29,17.5 16,23 3,17.5 3,6.5" />
        </svg>
      );
    case "parallelogram":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <polygon points="7,3 30,3 25,21 2,21" />
        </svg>
      );
    case "cylinder":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <rect x="4" y="6" width="24" height="14" />
          <ellipse cx="16" cy="6" rx="12" ry="3.5" />
          <ellipse cx="16" cy="20" rx="12" ry="3.5" fill="none" />
        </svg>
      );
    case "sticky":
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <polygon points="2,2 24,2 30,8 30,22 2,22" />
          <polyline points="24,2 24,8 30,8" fill="none" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 24" fill={fill} stroke={stroke} strokeWidth="1.5">
          <rect x="2" y="3" width="28" height="18" />
        </svg>
      );
  }
}

interface ShapePickerPopupProps {
  open: boolean;
  relX: number;
  relY: number;
  onSelect: (type: ShapeType) => void;
  onDismiss: () => void;
}

export default function ShapePickerPopup({
  open,
  relX,
  relY,
  onSelect,
  onDismiss,
}: ShapePickerPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const { shouldRender, isExiting } = usePresence(open, 140);
  // Hold last position so the exit animation renders in place after the
  // parent clears its picker state. Updated during render while `open`.
  const [stickyPos, setStickyPos] = useState({ relX, relY });
  if (open && (stickyPos.relX !== relX || stickyPos.relY !== relY)) {
    setStickyPos({ relX, relY });
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    // Use capture so we catch clicks before Konva
    window.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open, onDismiss]);

  if (!shouldRender) return null;

  // Offset so popup appears slightly below/right of release point
  const left = stickyPos.relX + 12;
  const top = stickyPos.relY + 12;

  return (
    <div
      ref={popupRef}
      className="absolute z-50 select-none"
      style={{ left, top, transformOrigin: "top left" }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className={`rounded-xl border border-white/10 bg-[#1a1625]/95 p-2 shadow-2xl backdrop-blur-sm ${
          isExiting ? "animate-popover-out" : "animate-popover-in"
        }`}
        style={{ minWidth: 224 }}
      >
        <p className="mb-2 px-1 text-xs font-medium text-white/40 uppercase tracking-widest">
          Add shape
        </p>
        <div className="grid grid-cols-3 gap-1">
          {SHAPE_OPTIONS.map(({ type, label }) => (
            <button
              key={type}
              className="group flex flex-col items-center gap-1 rounded-lg p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelect(type);
              }}
            >
              <span className="flex h-9 w-full items-center justify-center rounded-md bg-white/5 text-white/70 group-hover:text-white transition-colors">
                <span className="block h-6 w-8">
                  <ShapeIcon type={type} />
                </span>
              </span>
              <span className="text-[10px] text-white/50 group-hover:text-white/80 leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
