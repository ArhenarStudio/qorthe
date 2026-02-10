"use client";

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  isDarkMode: boolean;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({
  id,
  type,
  message,
  isDarkMode,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: isDarkMode
      ? "bg-green-900/90 border-green-700"
      : "bg-green-50 border-green-200",
    error: isDarkMode ? "bg-red-900/90 border-red-700" : "bg-red-50 border-red-200",
    info: isDarkMode ? "bg-blue-900/90 border-blue-700" : "bg-blue-50 border-blue-200",
    warning: isDarkMode
      ? "bg-yellow-900/90 border-yellow-700"
      : "bg-yellow-50 border-yellow-200",
  };

  const iconColors = {
    success: "text-green-500",
    error: "text-red-500",
    info: "text-blue-500",
    warning: "text-yellow-500",
  };

  const textColors = {
    success: isDarkMode ? "text-green-100" : "text-green-900",
    error: isDarkMode ? "text-red-100" : "text-red-900",
    info: isDarkMode ? "text-blue-100" : "text-blue-900",
    warning: isDarkMode ? "text-yellow-100" : "text-yellow-900",
  };

  const Icon = icons[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in ${colors[type]}`}
      role="alert"
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColors[type]}`} />
      <p className={`flex-1 text-sm ${textColors[type]}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 rounded-md p-1 transition-colors ${textColors[type]} hover:opacity-70`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
