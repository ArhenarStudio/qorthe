"use client";

import { useState, useEffect } from "react";
import { WhatsAppButton } from "@/modules/whatsapp-button";
import { ChatWidget } from "@/modules/chat-widget";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { WHATSAPP_PHONE, WHATSAPP_MESSAGE } from "@/modules/whatsapp-button/whatsapp-button.config";

export function GlobalWidgets() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <WhatsAppButton
        phoneNumber={WHATSAPP_PHONE}
        message={WHATSAPP_MESSAGE}
        isDarkMode={isDarkMode}
        enabled
        position="bottom-left"
      />
      <ChatWidget
        isDarkMode={isDarkMode}
        language={language}
        enabled
      />
      <ScrollToTop isDarkMode={isDarkMode} />
      <CookieConsent
        isDarkMode={isDarkMode}
        language={language}
        onAccept={() => {}}
        onDecline={() => {}}
        onSettings={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/cookies";
          }
        }}
      />
    </>
  );
}
