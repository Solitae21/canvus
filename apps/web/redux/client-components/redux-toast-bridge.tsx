"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectToasts, removeToast } from "@/redux/slice/ui/ui-slice";
import { useToast } from "@/components/toast/toast-provider";

/**
 * Bridges Redux ui.toasts into the context-based ToastProvider viewport.
 * Mount once inside both <StoreProvider> and <ToastProvider>.
 *
 * Canvas/board code dispatches addToast() but no Konva component can render
 * the context toast stack directly. This component acts as a relay so those
 * errors, warnings, and confirmations actually appear to the user.
 */
export function ReduxToastBridge() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  const { error, success, info } = useToast();
  // Track forwarded ids so React StrictMode's double-effect can't duplicate a toast.
  const forwardedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const toast of toasts) {
      if (forwardedRef.current.has(toast.id)) continue;
      forwardedRef.current.add(toast.id);

      const duration = toast.duration;
      switch (toast.type) {
        case "error":
          error(toast.message, { duration });
          break;
        case "success":
          success(toast.message, { duration });
          break;
        case "info":
        case "warning":
          info(toast.message, { duration });
          break;
      }

      // Remove from Redux immediately — the context viewport owns the lifecycle.
      dispatch(removeToast(toast.id));
    }
  }, [toasts, dispatch, error, success, info]);

  return null;
}
