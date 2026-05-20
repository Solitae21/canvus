"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { PALETTE } from "@/client/landing-page/palette";

type Mode = "sign-in" | "sign-up";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 14px",
  fontSize: 14,
  color: PALETTE.text,
  background: "rgba(255,255,255,0.03)",
  border: `1px solid ${PALETTE.border}`,
  borderRadius: 10,
  outline: "none",
  font: "inherit",
  transition: "border-color 160ms ease, background 160ms ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: PALETTE.textMuted,
  marginBottom: 6,
  letterSpacing: "0.01em",
};

export function CredentialsForm({
  mode,
  callbackUrl = "/dashboard",
}: {
  mode: Mode;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(data?.error ?? "Could not create your account.");
          setSubmitting(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(
          isSignUp
            ? "Account created, but sign-in failed. Try again."
            : "Wrong email or password.",
        );
        setSubmitting(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setSubmitting(false);
    }
  };

  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = PALETTE.primaryStrong;
    e.currentTarget.style.background = "rgba(86,141,255,0.05)";
  };
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = PALETTE.border;
    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
      noValidate
    >
      {isSignUp ? (
        <div>
          <label htmlFor="cf-name" style={labelStyle}>
            Name <span style={{ color: PALETTE.textFaint }}>(optional)</span>
          </label>
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={focusBorder}
            onBlur={blurBorder}
            style={inputStyle}
            maxLength={80}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="cf-email" style={labelStyle}>
          Email
        </label>
        <input
          id="cf-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={inputStyle}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="cf-password" style={labelStyle}>
          Password
        </label>
        <input
          id="cf-password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 8 : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={inputStyle}
          placeholder={isSignUp ? "At least 8 characters" : "••••••••"}
        />
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            fontSize: 13,
            color: PALETTE.warm,
            background: "rgba(255,180,171,0.07)",
            border: "1px solid rgba(255,180,171,0.25)",
            padding: "8px 12px",
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: 4,
          width: "100%",
          height: 44,
          fontSize: 14.5,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: PALETTE.primaryDeep,
          background: PALETTE.primary,
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)",
          transition: "transform 180ms ease, background 200ms ease",
          font: "inherit",
        }}
        onMouseEnter={(e) => {
          if (submitting) return;
          e.currentTarget.style.background = "#c4d4ff";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          if (submitting) return;
          e.currentTarget.style.background = PALETTE.primary;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {submitting
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}
