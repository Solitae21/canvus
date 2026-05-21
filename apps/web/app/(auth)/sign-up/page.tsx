import { AuthCard } from "../auth-card";
import { AuthSwitchLink } from "../auth-switch-link";
import { CredentialsForm } from "../credentials-form";
import { GuestDivider, GuestEntryButton } from "../guest-entry-link";

export default function SignUpPage() {
  return (
    <AuthCard
      eyebrow="Create account"
      title="Start your first board"
      subtitle="CanvUs is free to use — spin up a few boards and make something."
    >
      <CredentialsForm mode="sign-up" />

      <GuestDivider marginTop={18} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
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
