import { useEffect } from "react";

export interface ToastData {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

const STYLES: Record<ToastData["type"], string> = {
  info: "bg-indigo-600/90 border-indigo-400/40",
  success: "bg-emerald-600/90 border-emerald-400/40",
  warning: "bg-amber-600/90 border-amber-400/40",
  error: "bg-red-600/90 border-red-400/40",
};

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none [&>*]:pointer-events-auto" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-lg border ${STYLES[toast.type]} animate-[fadeIn_0.2s_ease-out]`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
