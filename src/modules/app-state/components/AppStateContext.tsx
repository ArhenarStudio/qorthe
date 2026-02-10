"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type Language = "es" | "en";

const STORAGE_KEY = "davidsons-app-state";

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

function loadFromStorage(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AppState>;
      return {
        ...defaultState,
        ...parsed,
        isDarkMode: parsed.isDarkMode ?? defaultState.isDarkMode,
        language: parsed.language === "en" ? "en" : "es",
        showWhatsApp: parsed.showWhatsApp ?? defaultState.showWhatsApp,
        showChat: parsed.showChat ?? defaultState.showChat,
      };
    }
  } catch {
    /* ignore */
  }
  return defaultState;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", state.isDarkMode);
    document.documentElement.setAttribute("lang", state.language);
  }, [hydrated, state.isDarkMode, state.language]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [hydrated, state]);

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
