import CanvasStage from "@/client/canvas/canvas-stage";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";
import CanvasRightPanel from "@/client/canvas/canvas-right-panel";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-surface">
      <CanvasHeader canvasId={id} />
      <div className="absolute inset-0">
        <CanvasStage canvasId={id} />
      </div>
      <CanvasRightPanel />
      <Toolbar />
    </div>
  );
}
