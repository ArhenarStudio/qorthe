"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { useAppState } from "@/modules/app-state";
import { baseTranslations } from "../shared/translations";

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <Header />

        <ContentPageContext.Provider value={value}>
          {children}
        </ContentPageContext.Provider>

        <Footer />
      </div>
    </div>
  );
}
