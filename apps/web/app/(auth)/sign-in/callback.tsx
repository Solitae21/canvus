"use client";

import { useSearchParams } from "next/navigation";
import { GoogleSignIn } from "../google-sign-in";

export function SignInCallback() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  return <GoogleSignIn label="Continue with Google" callbackUrl={callbackUrl} />;
}
