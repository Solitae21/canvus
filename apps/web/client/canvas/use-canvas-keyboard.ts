"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  deleteShape,
  selectShape,
  setPendingFromId,
} from "@/redux/slice/canvas/canvas-slice";

export function useCanvasKeyboard() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.canvas.selectedId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const inEditable =
        !!ae &&
        (ae.tagName === "INPUT" ||
          ae.tagName === "TEXTAREA" ||
          ae.isContentEditable);

      if (inEditable) return;

      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        e.preventDefault();
        dispatch(deleteShape(selectedId));
        return;
      }

      if (e.key === "Escape") {
        dispatch(selectShape(null));
        dispatch(setPendingFromId(null));
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, selectedId]);
}
