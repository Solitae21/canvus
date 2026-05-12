"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  type ModalEntry,
  markModalClosing,
  removeModal,
  selectModals,
} from "@/redux/slice/ui/ui-slice";
import { usePresence } from "@/lib/use-presence";
import { clearCallbacks, getCallbacks } from "./callbacks";
import {
  type ModalComponentProps,
  type ModalKey,
  modalRegistry,
} from "./registry";

export function ModalRoot() {
  const modals = useAppSelector(selectModals);
  return (
    <>
      {modals.map((entry) => (
        <ModalSlot key={entry.id} entry={entry} />
      ))}
    </>
  );
}

function ModalSlot({ entry }: { entry: ModalEntry }) {
  const dispatch = useAppDispatch();
  const registryEntry = modalRegistry[entry.key as ModalKey];
  const isOpen = entry.status === "open";
  const { shouldRender } = usePresence(
    isOpen,
    registryEntry?.exitDurationMs ?? 200,
  );

  useEffect(() => {
    if (shouldRender) return;
    dispatch(removeModal(entry.id));
    clearCallbacks(entry.id);
  }, [shouldRender, entry.id, dispatch]);

  if (!registryEntry) {
    if (typeof console !== "undefined") {
      console.warn(`[modal] unknown modal key: ${entry.key}`);
    }
    return null;
  }
  if (!shouldRender) return null;

  const Component = registryEntry.component as React.ComponentType<
    ModalComponentProps<ModalKey>
  >;
  const callbackBag = getCallbacks(entry.id) ?? {};

  const mergedProps = {
    ...entry.props,
    ...callbackBag,
    open: isOpen,
    onClose: () => dispatch(markModalClosing(entry.id)),
  } as unknown as ModalComponentProps<ModalKey>;

  return <Component {...mergedProps} />;
}
