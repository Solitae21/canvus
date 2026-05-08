"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PALETTE } from "@/client/landing-page/palette";
import { AuthCard } from "../auth-card";
import { AuthField } from "../auth-field";
import { AuthSubmit } from "../auth-submit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    router.push("/dashboard");
  };

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to CanvUs"
      subtitle="Pick up where your team left off."
    >
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
        noValidate
      >
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@studio.com"
          value={email}
          error={errors.email}
          onChange={(v) => {
            setEmail(v);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password)
              setErrors((p) => ({ ...p, password: undefined }));
          }}
        />

        <AuthSubmit submitting={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </AuthSubmit>
      </form>

      <p
        style={{
          marginTop: 22,
          fontSize: 13.5,
          color: PALETTE.textDim,
          textAlign: "center",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          style={{
            color: PALETTE.primary,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
