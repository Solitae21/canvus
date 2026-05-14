import type { Metadata } from "next";
import FeaturesView from "@/client/features/features-view";

export const metadata: Metadata = {
  title: "Features — CanvUs",
  description:
    "Everything inside CanvUs: real-time co-editing, the flowchart toolkit, present mode, anchored comments, export, and workspaces — in one place.",
};

export default function FeaturesPage() {
  return <FeaturesView />;
}
