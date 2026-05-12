"use client";

import { useCallback, useMemo } from "react";
import { useAppDispatch } from "@/redux/hooks";
import {
  markModalClosing,
  pushModal,
} from "@/redux/slice/ui/ui-slice";
import type { ModalKey, ModalPropsMap } from "./registry";
import { registerCallbacks, splitProps } from "./callbacks";

function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `modal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface ModalApi {
  /** Open a modal. Returns the entry id so callers can close it later. */
  open<K extends ModalKey>(key: K, props: ModalPropsMap[K]): string;
  /** Programmatically close a modal that's still open. */
  close(id: string): void;
}

export function useModal(): ModalApi {
  const dispatch = useAppDispatch();

  const open = useCallback(
    <K extends ModalKey>(key: K, props: ModalPropsMap[K]): string => {
      const id = generateId();
      const { serializable, callbacks } = splitProps(
        props as Record<string, unknown>,
      );
      registerCallbacks(id, callbacks);
      dispatch(pushModal({ id, key, props: serializable }));
      return id;
    },
    [dispatch],
  );

  const close = useCallback(
    (id: string) => {
      dispatch(markModalClosing(id));
    },
    [dispatch],
  );

  return useMemo(() => ({ open, close }), [open, close]);
}
