"use client";

import React, { createContext, useContext, useState } from "react";

interface FeatureToggleContextType {
  isChatEnabled: boolean;
  isWhatsAppEnabled: boolean;
  toggleChat: () => void;
  toggleWhatsApp: () => void;
}

const FeatureToggleContext = createContext<FeatureToggleContextType | undefined>(undefined);

export const FeatureToggleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isWhatsAppEnabled, setIsWhatsAppEnabled] = useState(true);

  const toggleChat = () => setIsChatEnabled((prev) => !prev);
  const toggleWhatsApp = () => setIsWhatsAppEnabled((prev) => !prev);

  return (
    <FeatureToggleContext.Provider value={{ isChatEnabled, isWhatsAppEnabled, toggleChat, toggleWhatsApp }}>
      {children}
    </FeatureToggleContext.Provider>
  );
};

export const useFeatureToggle = () => {
  const context = useContext(FeatureToggleContext);
  if (!context) {
    throw new Error("useFeatureToggle must be used within a FeatureToggleProvider");
  }
  return context;
};
