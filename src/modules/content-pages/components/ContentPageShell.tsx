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
import { baseTranslations } from "../shared/translations";

interface ContentPageContextValue {
  language: "es" | "en";
  isDarkMode: boolean;
  setLanguage: (l: "es" | "en" | ((prev: "es" | "en") => "es" | "en")) => void;
  setIsDarkMode: (m: boolean | ((prev: boolean) => boolean)) => void;
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
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = baseTranslations[language];

  const nav = useCallback((path: string) => () => {
    window.location.href = path;
  }, []);

  const value: ContentPageContextValue = {
    language,
    isDarkMode,
    setLanguage,
    setIsDarkMode,
    nav,
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <Header
          isScrolled={isScrolled}
          language={language}
          isDarkMode={isDarkMode}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
          onToggleDarkMode={() => setIsDarkMode((m) => !m)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((m) => !m)}
          onNavigateHome={nav("/")}
          onNavigateProducts={nav("/products")}
          onNavigateCart={nav("/cart")}
          onNavigateAccount={nav("/login")}
          translations={t}
        />

        <ContentPageContext.Provider value={value}>
          {children}
        </ContentPageContext.Provider>

        <Footer
          language={language}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode((m) => !m)}
          onNavigatePrivacy={nav("/privacy")}
          onNavigateTerms={nav("/terms")}
          onNavigateCookies={nav("/cookies")}
          onNavigateCatalog={nav("/products")}
          translations={t}
        />
      </div>
    </div>
  );
}
