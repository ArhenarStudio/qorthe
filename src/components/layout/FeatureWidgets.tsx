"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFeatureToggle } from "@/contexts/FeatureToggleContext";
import { LiveChatWidget } from "@/components/features/LiveChatWidget";
import { WhatsAppWidget } from "@/components/features/WhatsAppWidget";
import { ScrollToTopButton } from "@/components/ui/ScrollToTop";

export const FeatureWidgets = () => {
  const { isChatEnabled, isWhatsAppEnabled } = useFeatureToggle();
  const [isVisible, setIsVisible] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const updateFooterOffset = useCallback(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const footerRect = footer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // How much of the footer is visible from the bottom of viewport
    if (footerRect.top < viewportHeight) {
      // Footer is visible — calculate how much it pushes widgets up
      const overlap = viewportHeight - footerRect.top;
      setFooterOffset(overlap);
    } else {
      setFooterOffset(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateFooterOffset, { passive: true });
    window.addEventListener("resize", updateFooterOffset);
    updateFooterOffset();
    return () => {
      window.removeEventListener("scroll", updateFooterOffset);
      window.removeEventListener("resize", updateFooterOffset);
    };
  }, [updateFooterOffset]);

  if (!isVisible) return null;

  return (
    <>
      {isChatEnabled && <LiveChatWidget footerOffset={footerOffset} />}
      {isWhatsAppEnabled && <WhatsAppWidget footerOffset={footerOffset} />}
      <ScrollToTopButton footerOffset={footerOffset} />
    </>
  );
};
