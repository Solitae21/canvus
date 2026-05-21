"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Check } from "lucide-react";
import { PALETTE } from "@/client/landing-page/palette";

type Mode = "sign-in" | "sign-up";

type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  {
    label: "One special character",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
];

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((rule) => rule.test(password)),
    [password],
  );
  const allRulesMet = ruleResults.every(Boolean);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = isSignUp ? allRulesMet && passwordsMatch : true;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (isSignUp) {
      if (!allRulesMet) {
        setError("Your password doesn't meet all the requirements yet.");
        return;
      }
      if (!passwordsMatch) {
        setError("Passwords don't match.");
        return;
      }
    }

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

      {isSignUp ? (
        <ul
          aria-label="Password requirements"
          style={{
            listStyle: "none",
            margin: 0,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${PALETTE.borderSoft}`,
            borderRadius: 10,
          }}
        >
          {PASSWORD_RULES.map((rule, i) => {
            const met = ruleResults[i];
            return (
              <li
                key={rule.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12.5,
                  color: met ? PALETTE.mint : PALETTE.textDim,
                  transition: "color 160ms ease",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    flexShrink: 0,
                    borderRadius: 5,
                    border: `1px solid ${met ? PALETTE.mint : PALETTE.border}`,
                    background: met ? "rgba(125,211,164,0.16)" : "transparent",
                    transition:
                      "border-color 160ms ease, background 160ms ease",
                  }}
                >
                  {met ? <Check size={11} strokeWidth={3} /> : null}
                </span>
                {rule.label}
                <span
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    padding: 0,
                    margin: -1,
                    overflow: "hidden",
                    clip: "rect(0,0,0,0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                >
                  {met ? "requirement met" : "requirement not met"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}

      {isSignUp ? (
        <div>
          <label htmlFor="cf-confirm-password" style={labelStyle}>
            Confirm password
          </label>
          <input
            id="cf-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={focusBorder}
            onBlur={blurBorder}
            style={inputStyle}
            placeholder="Re-enter your password"
          />
          {confirmPassword.length > 0 && !passwordsMatch ? (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 12,
                color: PALETTE.warm,
              }}
            >
              Passwords don&apos;t match.
            </p>
          ) : null}
        </div>
      ) : null}

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
        disabled={submitting || !canSubmit}
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
          cursor: submitting || !canSubmit ? "not-allowed" : "pointer",
          opacity: submitting || !canSubmit ? 0.7 : 1,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)",
          transition: "transform 180ms ease, background 200ms ease",
          font: "inherit",
        }}
        onMouseEnter={(e) => {
          if (submitting || !canSubmit) return;
          e.currentTarget.style.background = "#c4d4ff";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          if (submitting || !canSubmit) return;
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
