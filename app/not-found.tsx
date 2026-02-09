"use client";

import { useState } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";

const translations = {
  es: {
    title: "404",
    subtitle: "Página no encontrada",
    description:
      "Lo sentimos, la página que buscas no existe o ha sido movida.",
    button: "Volver al Inicio",
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
    title: "404",
    subtitle: "Page not found",
    description:
      "Sorry, the page you are looking for does not exist or has been moved.",
    button: "Back to Home",
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

export default function NotFound() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const t = translations[language];

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Header
        language={language}
        isDarkMode={isDarkMode}
        isScrolled={false}
        isMobileMenuOpen={false}
        onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
        onToggleDarkMode={() => setIsDarkMode((m) => !m)}
        onToggleMobileMenu={() => {}}
        onNavigateHome={() => (window.location.href = "/")}
        onNavigateProducts={() => (window.location.href = "/products")}
        onNavigateCart={() => {}}
        onNavigateAccount={() => (window.location.href = "/login")}
        translations={t}
      />

      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1
            className={`mb-4 text-9xl font-bold ${
              isDarkMode ? "text-[#f5f0e8]" : "text-[#0a0806]"
            }`}
          >
            {t.title}
          </h1>
          <h2
            className={`mb-4 text-3xl font-semibold ${
              isDarkMode ? "text-[#f5f0e8]" : "text-[#0a0806]"
            }`}
          >
            {t.subtitle}
          </h2>
          <p
            className={`mb-8 text-lg ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.description}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-lg bg-[#8b6f47] px-8 py-3 text-white transition-colors hover:bg-[#6d5638]"
          >
            {t.button}
          </button>
        </div>
      </main>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((m) => !m)}
        onNavigatePrivacy={() => (window.location.href = "/privacy")}
        onNavigateTerms={() => (window.location.href = "/terms")}
        onNavigateCookies={() => (window.location.href = "/cookies")}
        translations={t}
      />
    </div>
  );
}
