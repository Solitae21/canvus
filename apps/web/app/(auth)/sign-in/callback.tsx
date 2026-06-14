"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CredentialsForm } from "../credentials-form";
import { useToast } from "@/components/toast/toast-provider";

export function SignInCallback() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const expired = params.get("expired") === "1";
  const { error } = useToast();
  const warned = useRef(false);

  useEffect(() => {
    if (expired && !warned.current) {
      warned.current = true;
      error("Your session expired — please sign in again.", {
        title: "Session expired",
      });
    }
  }, [expired, error]);

  return <CredentialsForm mode="sign-in" callbackUrl={callbackUrl} />;
}
