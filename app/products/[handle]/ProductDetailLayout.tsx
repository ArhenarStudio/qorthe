"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";

const translations = {
  es: {
    nav: { products: "Productos", about: "Nosotros", contact: "Contacto" },
    footer: {
      description:
        "Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.",
      navigation: "Navegación",
      catalog: "Catálogo",
      contactTitle: "Contacto",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
      cookies: "Política de Cookies",
    },
  },
  en: {
    nav: { products: "Products", about: "About", contact: "Contact" },
    footer: {
      description:
        "Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.",
      navigation: "Navigation",
      catalog: "Catalog",
      contactTitle: "Contact",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      cookies: "Cookie Policy",
    },
  },
};

export function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          onNavigateHome={() => (window.location.href = "/")}
          onNavigateProducts={() => (window.location.href = "/products")}
          onNavigateCart={() => (window.location.href = "/cart")}
          onNavigateAccount={() => (window.location.href = "/login")}
          translations={t}
        />
        <div className="pt-20 md:pt-24">{children}</div>
        <Footer
          language={language}
          isDarkMode={isDarkMode}
          onNavigatePrivacy={() => (window.location.href = "/privacy")}
          onNavigateTerms={() => (window.location.href = "/terms")}
          onNavigateCookies={() => (window.location.href = "/cookies")}
          onNavigateCatalog={() => (window.location.href = "/products")}
          translations={t}
        />
      </div>
    </div>
  );
}
