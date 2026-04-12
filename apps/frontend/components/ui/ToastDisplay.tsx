"use client";
// Toast Display Component - Shows toast notifications

"use client";

import { useToast } from "@/contexts/ToastContext";
import { Toast } from "@/components/ui/Toast";

export function ToastDisplay() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
