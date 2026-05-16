import { AuthCard } from "../auth-card";
import { GoogleSignIn } from "../google-sign-in";
import { GuestDivider, GuestEntryButton } from "../guest-entry-link";

export default function SignUpPage() {
  return (
    <AuthCard
      eyebrow="Create account"
      title="Start your first board"
      subtitle="Free forever. No credit card. Up to 3 boards on us."
    >
      <GoogleSignIn label="Sign up with Google" />

      <GuestDivider />
      <GuestEntryButton />
    </AuthCard>
  );
}
