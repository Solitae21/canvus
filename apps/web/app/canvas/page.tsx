import CanvasStage from "@/client/canvas/canvas-stage";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";
import CanvasRightPanel from "@/client/canvas/canvas-right-panel";

export default function Page() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-surface">
      <CanvasHeader />

      <div className="absolute inset-0">
        <CanvasStage />
      </div>

      <CanvasRightPanel />

      <Toolbar />
    </div>
  );
}
