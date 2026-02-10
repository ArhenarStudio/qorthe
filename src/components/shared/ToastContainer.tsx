"use client";

import { Toast, type ToastType } from "./Toast";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  isDarkMode: boolean;
  onClose: (id: string) => void;
}

export function ToastContainer({
  toasts,
  isDarkMode,
  onClose,
}: ToastContainerProps) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[9999] flex max-w-md flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            type={toast.type}
            message={toast.message}
            isDarkMode={isDarkMode}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
}
