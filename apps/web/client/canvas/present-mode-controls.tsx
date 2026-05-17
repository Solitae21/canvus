"use client";

import { useEffect, useMemo } from "react";
import {
  MonitorOff,
  Play,
  Pause,
  RotateCcw,
  Highlighter,
  UserMinus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectPresentMode,
  stopPresenting,
  toggleLaserPointer,
  toggleTimer,
  resetTimer,
  tickTimer,
} from "@/redux/slice/ui/ui-slice";
import { selectRemoteCursors } from "@/redux/slice/presence/presence-slice";

const formatTime = (totalSeconds: number): string => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export default function PresentModeControls() {
  const dispatch = useAppDispatch();
  const presentMode = useAppSelector(selectPresentMode);
  const cursors = useAppSelector(selectRemoteCursors);

  const followingName = useMemo(() => {
    if (!presentMode.followingUserId) return null;
    return cursors[presentMode.followingUserId]?.name ?? "Presenter";
  }, [cursors, presentMode.followingUserId]);

  useEffect(() => {
    if (!presentMode.timerRunning) return;
    const id = window.setInterval(() => dispatch(tickTimer()), 1000);
    return () => window.clearInterval(id);
  }, [presentMode.timerRunning, dispatch]);

  if (!presentMode.active) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
                 px-3 py-2 rounded-2xl
                 bg-surface-container/80 backdrop-blur-[24px]
                 border border-white/[0.08]
                 shadow-[0_8px_32px_rgba(0,0,0,0.45)]
                 text-on-surface"
    >
      <div className="pointer-events-auto flex items-center gap-1">
        <button
          onClick={() => dispatch(stopPresenting())}
          title="Stop present mode (Esc)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                     bg-red-500/15 text-red-300 text-[12px] font-semibold tracking-wide
                     hover:bg-red-500/25 hover:text-red-200 transition-colors duration-150"
        >
          <MonitorOff size={14} />
          Stop
        </button>

        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04]
                     text-[12px] font-mono tabular-nums text-on-surface-variant"
        >
          {formatTime(presentMode.timerSeconds)}
        </div>
        <button
          onClick={() => dispatch(toggleTimer())}
          title={presentMode.timerRunning ? "Pause timer" : "Start timer"}
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                     transition-colors duration-150"
        >
          {presentMode.timerRunning ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          onClick={() => dispatch(resetTimer())}
          title="Reset timer"
          className="flex items-center justify-center w-8 h-8 rounded-lg
                     text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                     transition-colors duration-150"
        >
          <RotateCcw size={14} />
        </button>

        {presentMode.isPresenter && (
          <>
            <div className="w-px h-5 bg-white/[0.08] mx-1" />
            <button
              onClick={() => dispatch(toggleLaserPointer())}
              title={presentMode.laserPointer ? "Disable laser pointer" : "Enable laser pointer"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium
                         transition-colors duration-150
                         ${
                           presentMode.laserPointer
                             ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                             : "text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]"
                         }`}
            >
              <Highlighter size={14} />
              Laser
            </button>
          </>
        )}

        {followingName && (
          <>
            <div className="w-px h-5 bg-white/[0.08] mx-1" />
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/15 text-primary-container text-[12px] font-medium">
              Following {followingName}
            </div>
            <button
              onClick={() => dispatch(stopPresenting())}
              title="Stop following"
              className="flex items-center justify-center w-8 h-8 rounded-lg
                         text-on-surface-variant hover:text-on-surface hover:bg-white/[0.06]
                         transition-colors duration-150"
            >
              <UserMinus size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
