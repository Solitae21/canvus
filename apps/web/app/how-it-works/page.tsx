import type { Metadata } from "next";
import HowItWorksView from "@/client/how-it-works/how-it-works-view";

export const metadata: Metadata = {
  title: "How it works — CanvUs",
  description:
    "A four-step tour of CanvUs: spin up a board, invite your team, build together, and present in real time.",
};

export default function HowItWorksPage() {
  return <HowItWorksView />;
}
