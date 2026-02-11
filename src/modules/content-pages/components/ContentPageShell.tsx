"use client";

import { createContext, useContext, useCallback } from "react";
import { useAppState } from "@/modules/app-state";

interface ContentPageContextValue {
  language: "es" | "en";
  isDarkMode: boolean;
  nav: (path: string) => () => void;
}

const ContentPageContext = createContext<ContentPageContextValue | null>(null);

export function useContentPage() {
  const ctx = useContext(ContentPageContext);
  if (!ctx) throw new Error("useContentPage must be used within ContentPageShell");
  return ctx;
}

interface ContentPageShellProps {
  children: React.ReactNode;
}

export function ContentPageShell({ children }: ContentPageShellProps) {
  const { isDarkMode, language } = useAppState();

  const nav = useCallback((path: string) => () => {
    window.location.href = path;
  }, []);

  const value: ContentPageContextValue = {
    language,
    isDarkMode,
    nav,
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <ContentPageContext.Provider value={value}>
          {children}
        </ContentPageContext.Provider>
      </div>
    </div>
  );
}
