"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { LiveChatWidget } from "@/components/features/LiveChatWidget";
import { WhatsAppWidget } from "@/components/features/WhatsAppWidget";
import { ScrollToTopButton } from "@/components/ui/ScrollToTop";

export const FeatureWidgets = () => {
  const { isChatEnabled, isWhatsAppEnabled } = useFeatureToggle();
  const [isVisible, setIsVisible] = useState(false);
  const [footerOverlap, setFooterOverlap] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const updateFooterOverlap = useCallback(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const footerTop = footer.getBoundingClientRect().top;
    const viewportHeight = window.innerHeight;
    if (footerTop < viewportHeight) {
      setFooterOverlap(viewportHeight - footerTop);
    } else {
      setFooterOverlap(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateFooterOverlap, { passive: true });
    window.addEventListener("resize", updateFooterOverlap);
    updateFooterOverlap();
    return () => {
      window.removeEventListener("scroll", updateFooterOverlap);
      window.removeEventListener("resize", updateFooterOverlap);
    };
  }, [updateFooterOverlap]);

  if (!isVisible) return null;

  return (
    <>
      {isChatEnabled && <LiveChatWidget footerOverlap={footerOverlap} />}
      {isWhatsAppEnabled && <WhatsAppWidget footerOverlap={footerOverlap} />}
      <ScrollToTopButton footerOverlap={footerOverlap} />
    </>
  );
};
