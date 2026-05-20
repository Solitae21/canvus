import { AuthCard } from "../auth-card";
import { AuthSwitchLink } from "../auth-switch-link";
import { CredentialsForm } from "../credentials-form";
import { GoogleSignIn } from "../google-sign-in";
import { GuestDivider, GuestEntryButton } from "../guest-entry-link";

export default function SignUpPage() {
  return (
    <AuthCard
      eyebrow="Create account"
      title="Start your first board"
      subtitle="Free forever. No credit card. Up to 3 boards on us."
    >
      <CredentialsForm mode="sign-up" />

      <GuestDivider marginTop={18} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        <GoogleSignIn label="Sign up with Google" />
        <GuestEntryButton />
      </div>

      <AuthSwitchLink
        prompt="Already have an account?"
        href="/sign-in"
        cta="Sign in"
      />
    </AuthCard>
  );
}
