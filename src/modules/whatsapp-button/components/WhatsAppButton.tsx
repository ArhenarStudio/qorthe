"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  isDarkMode: boolean;
  enabled?: boolean;
  position?: "bottom-right" | "bottom-left";
}

export function WhatsAppButton({
  phoneNumber,
  message = "¡Hola! Me interesa conocer más sobre sus muebles artesanales.",
  isDarkMode,
  enabled = true,
  position = "bottom-right",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!enabled) return null;

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const positionClasses =
    position === "bottom-right" ? "right-6" : "left-6 md:left-8";
  const bottomClass = position === "bottom-right" ? "bottom-24" : "bottom-6 md:bottom-8";

  return (
    <div
      className={`fixed ${bottomClass} ${positionClasses} z-50`}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex items-center gap-3 rounded-full border-2 border-[#25D366]/20 shadow-2xl transition-all duration-300 ${
          isDarkMode
            ? "bg-[#25D366] text-white hover:bg-[#128C7E]"
            : "bg-[#25D366] text-white hover:bg-[#128C7E]"
        } ${isHovered ? "px-6 py-4" : "p-4"}`}
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 flex-shrink-0" />

        {isHovered && (
          <span className="whitespace-nowrap text-sm font-medium animate-fade-in">
            Contáctanos
          </span>
        )}

        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
      </button>

      {!isHovered && (
        <div
          className={`pointer-events-none absolute bottom-full right-0 mb-2 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
            isDarkMode
              ? "border border-[#3d2f23] bg-[#2d2419] text-[#b8a99a]"
              : "bg-gray-900 text-white"
          }`}
        >
          ¿Necesitas ayuda?
          <div
            className={`absolute right-4 top-full h-2 w-2 rotate-45 ${
              isDarkMode
                ? "border-b border-r border-[#3d2f23] bg-[#2d2419]"
                : "bg-gray-900"
            }`}
          />
        </div>
      )}
    </div>
  );
}
