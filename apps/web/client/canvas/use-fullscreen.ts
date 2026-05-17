"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setFullscreen } from "@/redux/slice/ui/ui-slice";

export function useFullscreen(active: boolean): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleChange = () => {
      dispatch(setFullscreen(Boolean(document.fullscreenElement)));
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [dispatch]);

  useEffect(() => {
    if (active) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {
          // Browser refused (no user-gesture context, security policy, etc.).
          // Present mode still functions in-window — fail silently.
        });
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [active]);
}
