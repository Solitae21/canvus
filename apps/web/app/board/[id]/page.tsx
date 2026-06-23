import { redirect } from "next/navigation";
import CanvasStage from "@/client/canvas/canvas-stage";
import Toolbar from "@/components/toolbar";
import CanvasHeader from "@/client/canvas/canvas-header";
import CanvasRightPanel from "@/client/canvas/canvas-right-panel";
import { YjsCanvasProvider } from "@/client/canvas/use-yjs";
import { CanvasWsProvider } from "@/client/canvas/canvas-ws-context";
import { CanvasExportProvider } from "@/client/canvas/canvas-export-context";
import { BoardSnapshotLoader } from "@/client/canvas/board-snapshot-loader";
import { BoardAutoSaver } from "@/client/canvas/board-auto-saver";
import { auth } from "@/auth";
import { createBoardSocketToken } from "@/lib/socket-auth";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const { id } = await params;
  const roomId = `board:${id}`;
  const authToken = createBoardSocketToken({
    boardId: id,
    roomId,
    userId: session.user.id,
  });
  const identity = {
    userId: session.user.id,
    name: session.user.name ?? session.user.email ?? "User",
    color: "#60a5fa",
  };

  return (
    <YjsCanvasProvider canvasId={id} options={{ roomName: roomId, authToken }}>
      <CanvasWsProvider canvasId={id} roomId={roomId} identity={identity} authToken={authToken}>
        <CanvasExportProvider>
          <BoardSnapshotLoader boardId={id} />
          <BoardAutoSaver boardId={id} />
          <div className="flex flex-col w-screen h-screen overflow-hidden bg-surface">
            <div className="relative flex-1 overflow-hidden">
              <CanvasHeader canvasId={id} mode="board" />
              <div className="absolute inset-0">
                <CanvasStage canvasId={id} />
              </div>
              <CanvasRightPanel />
              <Toolbar />
            </div>
          </div>
        </CanvasExportProvider>
      </CanvasWsProvider>
    </YjsCanvasProvider>
  );
}
