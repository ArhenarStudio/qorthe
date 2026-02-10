"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Language = "es" | "en";

interface AppState {
  isDarkMode: boolean;
  language: Language;
  showWhatsApp: boolean;
  showChat: boolean;
}

interface AppStateContextValue extends AppState {
  toggleDarkMode: () => void;
  toggleLanguage: () => void;
  toggleWhatsApp: () => void;
  toggleChat: () => void;
}

const defaultState: AppState = {
  isDarkMode: false,
  language: "es",
  showWhatsApp: true,
  showChat: true,
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const toggleDarkMode = useCallback(() => {
    setState((s) => ({ ...s, isDarkMode: !s.isDarkMode }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setState((s) => ({
      ...s,
      language: s.language === "es" ? "en" : "es",
    }));
  }, []);

  const toggleWhatsApp = useCallback(() => {
    setState((s) => ({ ...s, showWhatsApp: !s.showWhatsApp }));
  }, []);

  const toggleChat = useCallback(() => {
    setState((s) => ({ ...s, showChat: !s.showChat }));
  }, []);

  const value: AppStateContextValue = {
    ...state,
    toggleDarkMode,
    toggleLanguage,
    toggleWhatsApp,
    toggleChat,
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
