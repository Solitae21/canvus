"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PALETTE } from "@/client/landing-page/palette";
import { AuthCard } from "../auth-card";
import { AuthField } from "../auth-field";
import { AuthSubmit } from "../auth-submit";
import { GuestDivider, GuestEntryButton } from "../guest-entry-link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    router.push("/dashboard");
  };

  return (
    <AuthCard
      eyebrow="Create account"
      title="Start your first board"
      subtitle="Free forever. No credit card. Up to 3 boards on us."
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          error={errors.password}
          onChange={(v) => {
            setPassword(v);
            if (errors.password)
              setErrors((p) => ({ ...p, password: undefined }));
          }}
        />
        <AuthField
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          error={errors.confirm}
          onChange={(v) => {
            setConfirm(v);
            if (errors.confirm)
              setErrors((p) => ({ ...p, confirm: undefined }));
          }}
        />

        <AuthSubmit submitting={submitting}>
          {submitting ? "Creating account…" : "Create account"}
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
        Already have an account?{" "}
        <Link
          href="/sign-in"
          style={{
            color: PALETTE.primary,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </p>

      <GuestDivider />
      <GuestEntryButton />
    </AuthCard>
  );
}
