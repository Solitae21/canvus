"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { PALETTE } from "@/client/landing-page/palette";

export function GoogleSignIn({
  label = "Continue with Google",
  callbackUrl = "/dashboard",
}: {
  label?: string;
  callbackUrl?: string;
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      style={{
        marginTop: 6,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        height: 46,
        padding: "0 22px",
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
        transition:
          "box-shadow 220ms ease, transform 180ms ease, background 200ms ease",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => {
        if (submitting) return;
        e.currentTarget.style.background = "#c4d4ff";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 24px rgba(86,141,255,0.35), 0 0 0 1px rgba(176,198,255,0.5)";
      }}
      onMouseLeave={(e) => {
        if (submitting) return;
        e.currentTarget.style.background = PALETTE.primary;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 0 rgba(0,0,0,0.4)";
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
        />
        <path
          fill="#FBBC05"
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        />
      </svg>
      {submitting ? "Redirecting…" : label}
    </button>
  );
}
