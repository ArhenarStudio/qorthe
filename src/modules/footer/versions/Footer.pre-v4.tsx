"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Calendar,
  Calculator,
  GitCompare,
  Image,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Newsletter } from "@/modules/newsletter";
import { useAppState } from "@/modules/app-state";
import { baseTranslations } from "@/modules/content-pages/shared/translations";

interface FooterProps {
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
  onNavigateCatalog?: () => void;
  onNavigateFAQ?: () => void;
  onNavigateBlog?: () => void;
  onNavigateProjectGallery?: () => void;
  onNavigateAppointment?: () => void;
  onNavigateProductComparison?: () => void;
  onNavigateFinancingCalculator?: () => void;
  onNavigateMission?: () => void;
  onNavigateAbout?: () => void;
  translations?: (typeof baseTranslations)["es"] | { nav: { products: string; about: string; contact: string }; footer: Record<string, string | undefined> };
}

const linkClass = (isDark: boolean) =>
  isDark
    ? "text-base transition-colors text-[#b8a99a] hover:text-white"
    : "text-base transition-colors text-gray-600 hover:text-gray-900";

export function Footer({
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
  onNavigateCatalog,
  onNavigateFAQ,
  onNavigateBlog,
  onNavigateProjectGallery,
  onNavigateAppointment,
  onNavigateProductComparison,
  onNavigateFinancingCalculator,
  onNavigateMission,
  onNavigateAbout,
  translations: translationsProp,
}: FooterProps) {
  const { isDarkMode, language } = useAppState();
  const t = translationsProp ?? baseTranslations[language];
  const companyDescription =
    language === "es"
      ? "Una herencia sin nombre que hoy encuentra forma. Artesanía consciente, diseño sobrio y madera trabajada con precisión. Piezas de autor creadas desde la tradición, pensadas para el tiempo."
      : "A nameless heritage that finds form today. Conscious craftsmanship, sober design and precisely worked wood. Author pieces created from tradition, designed for time.";

  const toolsTitle = language === "es" ? "Herramientas" : "Tools";
  const aboutTitle = language === "es" ? "Sobre Nosotros" : "About Us";

  const tools = [
    {
      name: language === "es" ? "Agendar Cita" : "Schedule Appointment",
      icon: Calendar,
      href: "/appointment",
      onClick: onNavigateAppointment,
    },
    {
      name: language === "es" ? "Calculadora" : "Financing Calculator",
      icon: Calculator,
      href: "/certifications",
      onClick: onNavigateFinancingCalculator,
    },
    {
      name: language === "es" ? "Comparador" : "Product Comparison",
      icon: GitCompare,
      href: "/compare",
      onClick: onNavigateProductComparison,
    },
    {
      name: language === "es" ? "Galería de Proyectos" : "Project Gallery",
      icon: Image,
      href: "/gallery",
      onClick: onNavigateProjectGallery,
    },
    {
      name: language === "es" ? "Preguntas Frecuentes" : "FAQs",
      icon: HelpCircle,
      href: "/faq",
      onClick: onNavigateFAQ,
    },
    {
      name: language === "es" ? "Blog" : "Blog",
      icon: BookOpen,
      href: "/blog",
      onClick: onNavigateBlog,
    },
  ];

  const socialClass = isDarkMode
    ? "rounded-lg p-2.5 transition-all duration-300 bg-[#2d2419] text-[#b8a99a] hover:bg-[#8b6f47] hover:text-white"
    : "rounded-lg p-2.5 transition-all duration-300 bg-gray-100 text-gray-600 hover:bg-[#8b6f47] hover:text-white";

  return (
    <footer
      id="contact"
      className={`border-t ${
        isDarkMode ? "border-[#3d2f23] bg-[#0a0806]" : "border-gray-200 bg-white"
      }`}
    >
      {/* Newsletter Section */}
      <div
        className={`border-b ${
          isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
        }`}
      >
        <Newsletter isDarkMode={isDarkMode} language={language} />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="space-y-16 py-16 md:space-y-20 md:py-20 lg:py-24">
          {/* Logo + Descripción */}
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

          {/* 4 Columnas */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-12">
            {/* Columna 1: Sobre Nosotros */}
            <div className="text-center md:text-left">
              <h5
                className={`mb-6 text-sm uppercase tracking-widest ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {aboutTitle}
              </h5>
              <nav className="flex flex-col items-center gap-3.5 md:items-start">
                <Link
                  href="/mission-vision"
                  onClick={() => onNavigateMission?.()}
                  className={linkClass(isDarkMode)}
                >
                  {language === "es" ? "Misión y Visión" : "Mission & Vision"}
                </Link>
                <Link
                  href="/about"
                  onClick={() => onNavigateAbout?.()}
                  className={linkClass(isDarkMode)}
                >
                  {language === "es" ? "Quiénes Somos" : "Who We Are"}
                </Link>
                <Link
                  href="/faq"
                  onClick={() => onNavigateFAQ?.()}
                  className={linkClass(isDarkMode)}
                >
                  {language === "es" ? "Preguntas Frecuentes" : "FAQs"}
                </Link>
              </nav>
            </div>

            {/* Columna 2: Herramientas */}
            <div className="text-center md:text-left">
              <h5
                className={`mb-6 text-sm uppercase tracking-widest ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {toolsTitle}
              </h5>
              <nav className="flex flex-col items-center gap-3.5 md:items-start">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      onClick={() => tool.onClick?.()}
                      className={`flex items-center gap-2.5 ${linkClass(
                        isDarkMode
                      )}`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{tool.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Columna 3: Contacto */}
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
                  className={linkClass(isDarkMode)}
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

            {/* Columna 4: Redes Sociales */}
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
                  className={socialClass}
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://x.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="X"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/davidsonsdesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialClass}
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
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <p
              id="footer-copyright"
              className={`text-sm ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.footer.copyright}
            </p>
            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
              }`}
            />
            <Link
              href="/privacy"
              onClick={() => onNavigatePrivacy?.()}
              className={`text-sm transition-colors ${
                isDarkMode
                  ? "text-[#b8a99a] hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.footer.privacy}
            </Link>
            <span
              className={`h-1 w-1 rounded-full ${
                isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
              }`}
            />
            <Link
              href="/terms"
              onClick={() => onNavigateTerms?.()}
              className={`text-sm transition-colors ${
                isDarkMode
                  ? "text-[#b8a99a] hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.footer.terms}
            </Link>
            {t.footer.cookies != null && (
              <>
                <span
                  className={`h-1 w-1 rounded-full ${
                    isDarkMode ? "bg-[#3d2f23]" : "bg-gray-300"
                  }`}
                />
                <Link
                  href="/cookies"
                  onClick={() => onNavigateCookies?.()}
                  className={`text-sm transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {language === "es" ? "Cookies" : "Cookies"}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
