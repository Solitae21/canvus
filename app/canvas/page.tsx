import KonvaSample from "@/client/konva-sample";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";
import CanvasRightPanel from "@/client/canvas/canvas-right-panel";

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

      {/* Properties panel — auto-opens when a shape is selected */}
      <CanvasRightPanel />

      {/* Floating toolbar at bottom-center */}
      <Toolbar />
    </div>
  );
}
