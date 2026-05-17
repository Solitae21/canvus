"use client";

import { useAppSelector } from "@/redux/hooks";
import { selectIsPresenting } from "@/redux/slice/ui/ui-slice";
import { useFullscreen } from "./use-fullscreen";
import PresentModeControls from "./present-mode-controls";
import ChatPanel from "./chat-panel";

export default function PresentModeShell() {
  const active = useAppSelector(selectIsPresenting);
  useFullscreen(active);
  return (
    <>
      <PresentModeControls />
      <ChatPanel />
    </>
  );
}
