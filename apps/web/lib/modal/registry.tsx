import type { ComponentType } from "react";
import type { CanvasSummary } from "@canvus/shared";
import { DeleteCanvasDialog } from "@/client/modals/delete-canvas-dialog";

/**
 * Add a new entry here to register a modal. The key becomes the typed
 * identifier passed to `useModal().open(key, props)`.
 *
 * Props listed here are the full props the modal component accepts (minus the
 * built-in `open` / `onClose` the registry injects). Function-valued props
 * are stripped from Redux state automatically and re-attached at render
 * time, so callbacks can flow through normally.
 */
export interface ModalPropsMap {
  deleteCanvas: {
    canvas: CanvasSummary;
    onConfirm: () => Promise<void> | void;
  };
}

export type ModalKey = keyof ModalPropsMap;

export type ModalComponentProps<K extends ModalKey> = ModalPropsMap[K] & {
  open: boolean;
  onClose: () => void;
};

interface RegistryEntry<K extends ModalKey> {
  component: ComponentType<ModalComponentProps<K>>;
  /** Must match the component's CSS exit-animation duration. */
  exitDurationMs: number;
}

type Registry = { [K in ModalKey]: RegistryEntry<K> };

export const modalRegistry: Registry = {
  deleteCanvas: {
    component: DeleteCanvasDialog,
    exitDurationMs: 200,
  },
};
