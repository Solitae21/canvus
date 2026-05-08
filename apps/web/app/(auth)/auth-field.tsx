"use client";

import { useId, useState } from "react";
import { PALETTE } from "@/client/landing-page/palette";

type Props = {
  id?: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
};

export function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  value,
  error,
  onChange,
}: Props) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const renderType = isPassword && showPw ? "text" : type;
  const hasError = Boolean(error);

  const ringColor = hasError
    ? "rgba(255,180,171,0.45)"
    : focused
      ? "rgba(176,198,255,0.55)"
      : "rgba(255,255,255,0)";

  const borderColor = hasError
    ? PALETTE.warm
    : focused
      ? PALETTE.primary
      : PALETTE.border;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily:
            "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: hasError ? PALETTE.warm : PALETTE.textDim,
          transition: "color 160ms ease",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          type={renderType}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            height: 44,
            padding: isPassword ? "0 44px 0 14px" : "0 14px",
            fontSize: 14.5,
            color: PALETTE.text,
            background: PALETTE.surfaceHigher,
            border: `1px solid ${borderColor}`,
            borderRadius: 10,
            outline: "none",
            boxShadow: `0 0 0 3px ${ringColor}`,
            transition:
              "border-color 160ms ease, box-shadow 220ms ease, background 160ms ease",
            fontFamily: "inherit",
            letterSpacing: "-0.005em",
          }}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw((v) => !v)}
            style={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              color: PALETTE.textDim,
              borderRadius: 8,
              cursor: "pointer",
              transition: "color 160ms ease, background 160ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = PALETTE.text;
              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = PALETTE.textDim;
              e.currentTarget.style.background = "transparent";
            }}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>

      {hasError && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: 12.5,
            color: PALETTE.warm,
            letterSpacing: "-0.005em",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 4.22-5.22M9.9 4.24A9.6 9.6 0 0 1 12 4c6.5 0 10 7 10 7a18.4 18.4 0 0 1-2.16 3.19M14.12 14.12A3 3 0 1 1 9.88 9.88M1 1l22 22" />
    </svg>
  );
}
