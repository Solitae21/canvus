import { Suspense } from "react";
import { AuthCard } from "../auth-card";
import { AuthSwitchLink } from "../auth-switch-link";
import { CredentialsForm } from "../credentials-form";
import { GoogleSignIn } from "../google-sign-in";
import { GuestDivider, GuestEntryButton } from "../guest-entry-link";
import { SignInCallback } from "./callback";

export default function SignInPage() {
  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to CanvUs"
      subtitle="Pick up where your team left off."
    >
      <Suspense fallback={<CredentialsForm mode="sign-in" />}>
        <SignInCallback />
      </Suspense>

      <GuestDivider marginTop={18} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        <GoogleSignIn label="Continue with Google" />
        <GuestEntryButton />
      </div>

      <AuthSwitchLink
        prompt="New to CanvUs?"
        href="/sign-up"
        cta="Create an account"
      />
    </AuthCard>
  );
}
