"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe media query hook. Returns `false` during SSR / first render so the
 * desktop layout is server-rendered, then upgrades on mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    if (mql.addEventListener) {
      mql.addEventListener("change", sync);
      return () => mql.removeEventListener("change", sync);
    }
    mql.addListener(sync);
    return () => mql.removeListener(sync);
  }, [query]);

  return matches;
}

/** Phones — below 640px. */
export function useIsMobile() {
  return useMediaQuery("(max-width: 639px)");
}

/** Phones + small tablets — below 900px. The common "stack the layout" cutoff. */
export function useIsCompact() {
  return useMediaQuery("(max-width: 899px)");
}
