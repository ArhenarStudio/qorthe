"use client";

import React, { useState, useEffect } from "react";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { LiveChatWidget } from "@/components/features/LiveChatWidget";
import { WhatsAppWidget } from "@/components/features/WhatsAppWidget";
import { ScrollToTopButton } from "@/components/ui/ScrollToTop";

export const FeatureWidgets = () => {
  const { isChatEnabled, isWhatsAppEnabled } = useFeatureToggle();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {isChatEnabled && <LiveChatWidget />}
      {isWhatsAppEnabled && <WhatsAppWidget />}
      <ScrollToTopButton />
    </>
  );
};
