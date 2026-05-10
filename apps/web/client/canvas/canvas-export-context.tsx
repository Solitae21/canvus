"use client";

import {
  createContext,
  useContext,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type Konva from "konva";

interface CanvasExportValue {
  stageRef: MutableRefObject<Konva.Stage | null>;
}

const Ctx = createContext<CanvasExportValue | null>(null);

export const CanvasExportProvider = ({ children }: { children: ReactNode }) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  return <Ctx.Provider value={{ stageRef }}>{children}</Ctx.Provider>;
};

export const useCanvasExportContext = (): CanvasExportValue => {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useCanvasExportContext must be used within a CanvasExportProvider");
  }
  return v;
};
