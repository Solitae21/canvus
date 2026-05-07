"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectRemoteCursors } from "@/redux/slice/presence/presence-slice";

interface RemoteCursorsProps {
  viewportX: number;
  viewportY: number;
  viewportScale: number;
}

export default function RemoteCursors({ viewportX, viewportY, viewportScale }: RemoteCursorsProps) {
  const cursors = useAppSelector(selectRemoteCursors);

  return (
    <>
      {Object.entries(cursors).map(([uid, pos]) => {
        const screenX = pos.x * viewportScale + viewportX;
        const screenY = pos.y * viewportScale + viewportY;
        return (
          <div
            key={uid}
            className="absolute pointer-events-none select-none"
            style={{ left: screenX, top: screenY, zIndex: 50, transform: "translate(0, 0)" }}
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill={pos.color} style={{ display: "block" }}>
              <path d="M0 0 L0 13 L3.5 9.5 L6 16.5 L8 15.5 L5.5 8.5 L10 8.5 Z" />
            </svg>
            <span
              className="text-xs px-1 rounded whitespace-nowrap"
              style={{ background: pos.color, color: "#000", fontSize: 11 }}
            >
              {pos.name}
            </span>
          </div>
        );
      })}
    </>
  );
}
