import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
  type?: "warning" | "danger" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  isDarkMode,
  type = "warning",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconColors = {
    warning: "text-yellow-500",
    danger: "text-red-500",
    info: "text-blue-500",
  };

  return (
    <div className="fixed inset-0 z-[10000] flex animate-fade-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md animate-scale-in rounded-xl border shadow-2xl ${
          isDarkMode
            ? "border-[#3d2f23] bg-[#1a1512]"
            : "border-gray-200 bg-white"
        }`}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`rounded-full p-3 ${
                isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
              }`}
            >
              <AlertTriangle className={`h-6 w-6 ${iconColors[type]}`} />
            </div>

            <div className="flex-1">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3
                  id="modal-title"
                  className={`text-lg font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>

                <button
                  onClick={onCancel}
                  className={`rounded-md p-1 transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p
                id="modal-description"
                className={`mb-6 text-sm leading-relaxed ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {message}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onCancel}
                  className={`rounded-lg border px-5 py-2.5 font-medium transition-colors ${
                    isDarkMode
                      ? "border-[#3d2f23] text-[#b8a99a] hover:bg-[#2d2419]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {cancelText}
                </button>

                <button
                  onClick={onConfirm}
                  className={`rounded-lg px-5 py-2.5 font-medium transition-colors ${
                    type === "danger"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-[#8b6f47] text-white hover:bg-[#a68760]"
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
