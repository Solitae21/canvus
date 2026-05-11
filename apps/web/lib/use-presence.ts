"use client";

import { useEffect, useState } from "react";

type Phase = "closed" | "open" | "closing";

/**
 * Coordinates mount + exit animations for conditionally-rendered overlays.
 *
 * Returns:
 *   - `shouldRender`: true while the element should remain in the DOM
 *     (covers both the open state and the trailing exit animation).
 *   - `isExiting`: true while the exit animation is playing — apply the
 *     exit-animation class on this branch.
 *
 * `durationMs` must match the CSS exit animation duration so the element
 * unmounts exactly as the animation finishes.
 */
export function usePresence(
  isOpen: boolean,
  durationMs = 180,
): { shouldRender: boolean; isExiting: boolean } {
  const [phase, setPhase] = useState<Phase>(isOpen ? "open" : "closed");

  // Drive phase transitions from props during render — React reschedules
  // the render immediately, so we never end up reading a stale phase.
  if (isOpen && phase !== "open") {
    setPhase("open");
  } else if (!isOpen && phase === "open") {
    setPhase("closing");
  }

  useEffect(() => {
    if (phase !== "closing") return;
    const id = window.setTimeout(() => setPhase("closed"), durationMs);
    return () => window.clearTimeout(id);
  }, [phase, durationMs]);

  return {
    shouldRender: phase !== "closed",
    isExiting: phase === "closing",
  };
}
