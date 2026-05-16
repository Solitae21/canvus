import { Suspense } from "react";
import { AuthCard } from "../auth-card";
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
      <Suspense fallback={<GoogleSignIn label="Continue with Google" />}>
        <SignInCallback />
      </Suspense>

      <GuestDivider />
      <GuestEntryButton />
    </AuthCard>
  );
}
