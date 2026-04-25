import KonvaSample from "@/client/konva-sample";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";

export default function Page() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-surface canvas-grid">
      {/* Dot-grid background rendered via CSS */}

      {/* Canvas header overlay */}
      <CanvasHeader />

      {/* Konva canvas fills viewport */}
      <div className="absolute inset-0">
        <KonvaSample />
      </div>

      {/* Floating toolbar at bottom-center */}
      <Toolbar />
    </div>
  );
}
