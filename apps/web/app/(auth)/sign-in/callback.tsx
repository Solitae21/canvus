"use client";

import { useSearchParams } from "next/navigation";
import { CredentialsForm } from "../credentials-form";

export function SignInCallback() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  return <CredentialsForm mode="sign-in" callbackUrl={callbackUrl} />;
}
