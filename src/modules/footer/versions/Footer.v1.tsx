"use client";

import { Sun, Moon } from "lucide-react";

interface FooterProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
  translations: {
    nav: {
      products: string;
      about: string;
      contact: string;
    };
    footer: {
      description: string;
      navigation: string;
      catalog: string;
      contactTitle: string;
      location: string;
      copyright: string;
      privacy: string;
      terms: string;
      cookies?: string;
    };
  };
}

export function Footer({
  language,
  isDarkMode,
  onToggleDarkMode,
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
  translations: t,
}: FooterProps) {
  return (
    <footer
      id="contact"
      className={`border-t ${
        isDarkMode ? "border-[#3d2f23] bg-[#0a0806]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 md:mb-10 md:grid-cols-2 md:gap-10 lg:mb-12 lg:grid-cols-4 lg:gap-12">
          {/* Logo & Descripción */}
          <div className="space-y-4 md:col-span-2 md:space-y-6">
            <h4
              className={`text-xl tracking-tight md:text-2xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="font-bold">DavidSon´s</span>{" "}
              <span className="font-normal">Design</span>
            </h4>
            <p
              className={`max-w-md text-sm leading-relaxed md:text-base ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.footer.description}
            </p>
          </div>

          {/* Navegación */}
          <div className="space-y-3 md:space-y-4">
            <h5
              className={`text-sm tracking-wide md:text-base ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.footer.navigation}
            </h5>
            <nav className="flex flex-col gap-2 md:gap-3">
              <a
                href="#productos"
                className={`text-sm transition-colors md:text-base ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.nav.products}
              </a>
              <a
                href="#about"
                className={`text-sm transition-colors md:text-base ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.nav.about}
              </a>
              <a
                href="#contact"
                className={`text-sm transition-colors md:text-base ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.nav.contact}
              </a>
              <a
                href="#"
                className={`text-sm transition-colors md:text-base ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.footer.catalog}
              </a>
            </nav>
          </div>

          {/* Contacto */}
          <div className="space-y-3 md:space-y-4">
            <h5
              className={`text-sm tracking-wide md:text-base ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.footer.contactTitle}
            </h5>
            <div
              className={`flex flex-col gap-2 text-sm md:gap-3 md:text-base ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              <a
                href="mailto:soporte@davidsonsdesign.com"
                className={`transition-colors ${
                  isDarkMode
                    ? "hover:text-[#f5f0e8]"
                    : "hover:text-gray-900"
                }`}
              >
                soporte@davidsonsdesign.com
              </a>
              <p>{t.footer.location}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row md:pt-8 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <p
              className={`text-center text-xs md:text-left md:text-sm ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.footer.copyright}
            </p>

            {/* Theme Toggle en Footer */}
            <button
              onClick={onToggleDarkMode}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 ${
                isDarkMode
                  ? "border-[#4a3a2a] bg-[#2d2419] text-[#f5f0e8]"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
              aria-label="Toggle theme"
            >
              <Sun
                className={`h-3.5 w-3.5 transition-all duration-300 ${
                  isDarkMode ? "scale-75 opacity-50" : "scale-100 opacity-100"
                }`}
              />
              <div
                className={`relative h-5 w-10 rounded-full ${
                  isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#8b6f47] transition-transform duration-300 ${
                    isDarkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <Moon
                className={`h-3.5 w-3.5 transition-all duration-300 ${
                  isDarkMode ? "scale-100 opacity-100" : "scale-75 opacity-50"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <div
              className={`flex gap-6 text-xs md:gap-8 md:text-sm ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "hover:text-[#f5f0e8]"
                    : "hover:text-gray-900"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePrivacy?.();
                }}
              >
                {t.footer.privacy}
              </a>
              <a
                href="#"
                className={`transition-colors ${
                  isDarkMode
                    ? "hover:text-[#f5f0e8]"
                    : "hover:text-gray-900"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateTerms?.();
                }}
              >
                {t.footer.terms}
              </a>
              {t.footer.cookies != null && (
                <a
                  href="#"
                  className={`transition-colors ${
                    isDarkMode
                      ? "hover:text-[#f5f0e8]"
                      : "hover:text-gray-900"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateCookies?.();
                  }}
                >
                  {t.footer.cookies}
                </a>
              )}
            </div>
            <p
              className={`text-xs ${
                isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
              }`}
            >
              Powered by RockStage
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
