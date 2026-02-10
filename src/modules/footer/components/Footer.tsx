"use client";

import {
  Sun,
  Moon,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";

interface FooterProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
  onNavigateCatalog?: () => void;
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
  onNavigateCatalog,
  translations: t,
}: FooterProps) {
  const companyDescription =
    language === "es"
      ? "Una herencia sin nombre que hoy encuentra forma. Artesanía consciente, diseño sobrio y madera trabajada con precisión. Piezas de autor creadas desde la tradición, pensadas para el tiempo."
      : "A nameless heritage that finds form today. Conscious craftsmanship, sober design and precisely worked wood. Author pieces created from tradition, designed for time.";

  return (
    <footer
      id="contact"
      className={`border-t ${
        isDarkMode ? "border-[#3d2f23] bg-[#0a0806]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="space-y-16 py-16 md:space-y-20 md:py-20 lg:py-24">
          {/* CONTENEDOR 1: Logo + Descripción (Centrado) */}
          <div className="space-y-6 text-center">
            <h4
              className={`text-4xl tracking-tight md:text-5xl lg:text-6xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              <span className="font-bold">DavidSon´s</span>{" "}
              <span className="font-normal">Design</span>
            </h4>
            <p
              className={`mx-auto max-w-3xl text-base leading-relaxed md:text-lg ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {companyDescription}
            </p>
          </div>

          {/* CONTENEDOR 2: 3 Columnas (Navegación, Contacto, Redes) */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-16">
            {/* Columna 1: Navegación */}
            <div className="text-center md:text-left">
              <h5
                className={`mb-6 text-sm uppercase tracking-widest ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.footer.navigation}
              </h5>
              <nav className="flex flex-col items-center gap-3.5 md:items-start">
                <button
                  type="button"
                  onClick={onNavigateCatalog}
                  className={`text-base transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.footer.catalog}
                </button>
                <a
                  href="#about"
                  className={`text-base transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.nav.about}
                </a>
                <a
                  href="#contact"
                  className={`text-base transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.nav.contact}
                </a>
              </nav>
            </div>

            {/* Columna 2: Contacto */}
            <div className="text-center md:text-left">
              <h5
                className={`mb-6 text-sm uppercase tracking-widest ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.footer.contactTitle}
              </h5>
              <div className="flex flex-col items-center gap-3.5 md:items-start">
                <a
                  href="mailto:soporte@davidsonsdesign.com"
                  className={`text-base transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  soporte@davidsonsdesign.com
                </a>
                <p
                  className={`text-base ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {t.footer.location}
                </p>
              </div>
            </div>

            {/* Columna 3: Redes Sociales */}
            <div className="text-center md:text-left">
              <h5
                className={`mb-6 text-sm uppercase tracking-widest ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {language === "es" ? "Síguenos" : "Follow Us"}
              </h5>
              <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
                <a
                  href="https://facebook.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                  }`}
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                  }`}
                  aria-label="X"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                  }`}
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                  }`}
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-2.5 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white"
                  }`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className={`border-t py-8 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            {/* Copyright */}
            <p
              className={`order-2 text-sm lg:order-1 ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.footer.copyright}
            </p>

            {/* Center: Legal + Cookies + Theme Toggle */}
            <div className="order-1 flex items-center gap-6 lg:order-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePrivacy?.();
                }}
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.footer.privacy}
              </button>

              <span
                className={`h-1 w-1 rounded-full ${
                  isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateTerms?.();
                }}
                className={`text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.footer.terms}
              </button>

              {t.footer.cookies != null && (
                <>
                  <span
                    className={`h-1 w-1 rounded-full ${
                      isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateCookies?.();
                    }}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? "text-[#b8a99a] hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.footer.cookies}
                  </button>
                </>
              )}

              <span
                className={`h-1 w-1 rounded-full ${
                  isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 ${
                  isDarkMode
                    ? "border-[#3d2f23] bg-[#2d2419] hover:border-[#8b6f47]"
                    : "border-gray-300 bg-gray-50 hover:border-[#8b6f47]"
                }`}
                aria-label="Toggle theme"
              >
                <Sun
                  className={`h-3.5 w-3.5 transition-all ${
                    isDarkMode ? "opacity-40" : "opacity-100"
                  }`}
                />
                <div
                  className={`relative h-4 w-9 rounded-full ${
                    isDarkMode ? "bg-[#1a1512]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${
                      isDarkMode ? "left-5" : "left-0.5"
                    }`}
                  />
                </div>
                <Moon
                  className={`h-3.5 w-3.5 transition-all ${
                    isDarkMode ? "opacity-100" : "opacity-40"
                  }`}
                />
              </button>
            </div>

            {/* Powered by */}
            <p
              className={`order-3 text-xs ${
                isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
              }`}
            >
              Powered by{" "}
              <span className="font-medium text-[#8b6f47]">RockStage</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
