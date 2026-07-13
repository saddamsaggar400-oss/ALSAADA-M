import { useState } from "react";

export interface Toast { id: string; title?: string; description?: string; variant?: "default" | "destructive"; }

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  function toast(t: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  }
  function dismiss(id: string) { setToasts((prev) => prev.filter((x) => x.id !== id)); }
  return { toasts, toast, dismiss };
}
