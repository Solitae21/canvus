"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCanvas } from "@/lib/api";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    createCanvas("Untitled board")
      .then((canvas) => router.replace(`/canvas/${canvas.id}`))
      .catch(() => router.replace("/"));
  }, [router]);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full border-2 border-primary-container border-t-primary animate-spin"
        />
        <span className="text-[13px] text-on-surface-variant">Creating your canvas…</span>
      </div>
    </div>
  );
}
