import CanvasStage from "@/client/canvas/canvas-stage";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";
import CanvasRightPanel from "@/client/canvas/canvas-right-panel";
import { YjsCanvasProvider } from "@/client/canvas/use-yjs";
import { GuestBanner } from "@/client/guest/guest-banner";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <YjsCanvasProvider canvasId={id}>
      <div className="flex flex-col w-screen h-screen overflow-hidden bg-surface">
        <GuestBanner />
        <div className="relative flex-1 overflow-hidden">
          <CanvasHeader canvasId={id} />
          <div className="absolute inset-0">
            <CanvasStage canvasId={id} />
          </div>
          <CanvasRightPanel />
          <Toolbar />
        </div>
      </div>
    </YjsCanvasProvider>
  );
}
