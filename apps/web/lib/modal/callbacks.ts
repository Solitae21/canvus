type CallbackBag = Record<string, (...args: never[]) => unknown>;

const store = new Map<string, CallbackBag>();

export function registerCallbacks(id: string, callbacks: CallbackBag): void {
  if (Object.keys(callbacks).length === 0) return;
  store.set(id, callbacks);
}

export function getCallbacks(id: string): CallbackBag | undefined {
  return store.get(id);
}

export function clearCallbacks(id: string): void {
  store.delete(id);
}

export function splitProps(
  props: Record<string, unknown>,
): { serializable: Record<string, unknown>; callbacks: CallbackBag } {
  const serializable: Record<string, unknown> = {};
  const callbacks: CallbackBag = {};
  for (const [key, value] of Object.entries(props)) {
    if (typeof value === "function") {
      callbacks[key] = value as (...args: never[]) => unknown;
    } else {
      serializable[key] = value;
    }
  }
  return { serializable, callbacks };
}
