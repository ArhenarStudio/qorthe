"use client";

import { useEffect, useState } from "react";
import { WhatsAppButton } from "@/modules/whatsapp-button";
import { ChatWidget } from "@/modules/chat-widget";
import { SettingsModule } from "@/modules/settings";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { useAppState } from "@/modules/app-state";
import {
  WHATSAPP_PHONE,
  WHATSAPP_MESSAGE,
} from "@/modules/whatsapp-button/whatsapp-button.config";

export function GlobalWidgets() {
  const {
    isDarkMode,
    language,
    showWhatsApp,
    showChat,
    toggleDarkMode,
    toggleLanguage,
    toggleWhatsApp,
    toggleChat,
  } = useAppState();
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
        enabled={showWhatsApp}
        position="bottom-right"
      />
      <ChatWidget
        isDarkMode={isDarkMode}
        language={language}
        enabled={showChat}
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
      <SettingsModule
        language={language}
        isDarkMode={isDarkMode}
        showWhatsApp={showWhatsApp}
        showChat={showChat}
        onToggleLanguage={toggleLanguage}
        onToggleDarkMode={toggleDarkMode}
        onToggleWhatsApp={toggleWhatsApp}
        onToggleChat={toggleChat}
      />
    </>
  );
}
