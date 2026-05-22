"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PALETTE } from "@/client/landing-page/palette";

type ToastVariant = "error" | "success" | "info";

type ToastOptions = {
  /** Bold heading shown above the message. */
  title?: string;
  /** Auto-dismiss delay in ms. Defaults to 8s for errors, 5s otherwise. */
  duration?: number;
};

type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
  title?: string;
};

type ToastContextValue = {
  error: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string, options?: ToastOptions) => {
      const id = newId();
      const duration =
        options?.duration ?? (variant === "error" ? 8000 : 5000);
      setToasts((current) => [
        ...current,
        { id, variant, message, title: options?.title },
      ]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  // Clear any pending timers if the provider unmounts.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      error: (message, options) => push("error", message, options),
      success: (message, options) => push("success", message, options),
      info: (message, options) => push("info", message, options),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────── */

const VARIANT_STYLES: Record<
  ToastVariant,
  { accent: string; glow: string; role: "alert" | "status" }
> = {
  error: {
    accent: PALETTE.warm,
    glow: "rgba(255,180,171,0.16)",
    role: "alert",
  },
  success: {
    accent: PALETTE.mint,
    glow: "rgba(125,211,164,0.16)",
    role: "status",
  },
  info: {
    accent: PALETTE.primary,
    glow: "rgba(176,198,255,0.16)",
    role: "status",
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        top: 18,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
        padding: "0 16px",
      }}
    >
      <style>{`
        @keyframes canvus-toast-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const v = VARIANT_STYLES[toast.variant];
  return (
    <div
      role={v.role}
      style={{
        pointerEvents: "auto",
        width: "100%",
        maxWidth: 440,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 14px",
        borderRadius: 12,
        background: `linear-gradient(180deg, ${PALETTE.surfaceHi} 0%, ${PALETTE.surface} 100%)`,
        border: `1px solid ${v.accent}`,
        borderLeft: `3px solid ${v.accent}`,
        boxShadow: `0 16px 40px -12px rgba(0,0,0,0.55), 0 0 0 1px ${v.glow}`,
        color: PALETTE.text,
        fontFamily:
          "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif",
        animation: "canvus-toast-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          marginTop: 1,
          color: v.accent,
          display: "inline-flex",
        }}
      >
        <ToastIcon variant={toast.variant} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title ? (
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              marginBottom: 2,
            }}
          >
            {toast.title}
          </div>
        ) : null}
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.45,
            color: toast.title ? PALETTE.textMuted : PALETTE.text,
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        style={{
          flexShrink: 0,
          width: 24,
          height: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          borderRadius: 6,
          color: PALETTE.textDim,
          cursor: "pointer",
          padding: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.color = PALETTE.text;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = PALETTE.textDim;
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (variant === "success") {
    return (
      <svg {...common}>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (variant === "info") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8h.01M11 12h1v4h1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}
