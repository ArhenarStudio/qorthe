"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

interface CookieConsentProps {
  isDarkMode: boolean;
  language: "es" | "en";
  onAccept: () => void;
  onDecline: () => void;
  onSettings?: () => void;
}

export function CookieConsent({
  isDarkMode,
  language,
  onAccept,
  onDecline,
  onSettings,
}: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent =
      typeof window !== "undefined" ? localStorage.getItem("cookie-consent") : null;
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie-consent", "accepted");
    }
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie-consent", "declined");
    }
    setIsVisible(false);
    onDecline();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const t = {
    es: {
      title: "Usamos cookies",
      message:
        "Utilizamos cookies propias y de terceros para mejorar tu experiencia de navegación y analizar el tráfico del sitio. Al hacer clic en \"Aceptar\", aceptas el uso de estas tecnologías.",
      accept: "Aceptar todas",
      decline: "Rechazar",
      settings: "Configurar",
    },
    en: {
      title: "We use cookies",
      message:
        "We use our own and third-party cookies to improve your browsing experience and analyze site traffic. By clicking \"Accept\", you agree to the use of these technologies.",
      accept: "Accept all",
      decline: "Decline",
      settings: "Settings",
    },
  };

  const content = t[language];

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] animate-slide-up p-4 md:p-6">
      <div
        className={`pointer-events-auto mx-auto max-w-6xl rounded-xl border shadow-2xl backdrop-blur-md md:mb-24 mb-20 ${
          isDarkMode
            ? "border-[#3d2f23] bg-[#1a1512]/95"
            : "border-gray-200 bg-white/95"
        }`}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <Cookie
              className={`h-8 w-8 flex-shrink-0 ${
                isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
              }`}
            />

            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className={`mb-2 text-lg font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {content.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                    }`}
                  >
                    {content.message}
                  </p>
                </div>

                <button
                  onClick={handleClose}
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

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAccept}
                  className="rounded-lg bg-[#8b6f47] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#a68760]"
                >
                  {content.accept}
                </button>

                <button
                  onClick={handleDecline}
                  className={`rounded-lg border px-6 py-2.5 font-medium transition-colors ${
                    isDarkMode
                      ? "border-[#3d2f23] text-[#b8a99a] hover:bg-[#2d2419]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {content.decline}
                </button>

                {onSettings && (
                  <button
                    onClick={onSettings}
                    className={`rounded-lg px-6 py-2.5 font-medium transition-colors ${
                      isDarkMode
                        ? "text-[#b8a99a] hover:bg-[#2d2419]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {content.settings}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
