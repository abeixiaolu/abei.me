import { createSignal } from 'solid-js';

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
};

const TTL_MS = 2400;
const MAX = 4;

const [toasts, setToasts] = createSignal<ToastItem[]>([]);
let seq = 0;

export function getToasts() {
  return toasts;
}

/** SPEC-01 Toaster · notify() */
export function notify(title: string, opts?: { description?: string }) {
  const id = ++seq;
  setToasts((prev) => [{ id, title, description: opts?.description }, ...prev].slice(0, MAX));
  window.setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, TTL_MS);
  return id;
}

export function dismissToast(id: number) {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}
