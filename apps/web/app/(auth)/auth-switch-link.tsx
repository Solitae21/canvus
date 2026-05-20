import Link from "next/link";
import { PALETTE } from "@/client/landing-page/palette";

export function AuthSwitchLink({
  prompt,
  href,
  cta,
}: {
  prompt: string;
  href: string;
  cta: string;
}) {
  return (
    <p
      style={{
        marginTop: 18,
        textAlign: "center",
        fontSize: 13,
        color: PALETTE.textDim,
      }}
    >
      {prompt}{" "}
      <Link
        href={href}
        style={{
          color: PALETTE.primary,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {cta}
      </Link>
    </p>
  );
}
