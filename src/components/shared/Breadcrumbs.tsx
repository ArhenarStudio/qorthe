"use client";

import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  isDarkMode: boolean;
  language: "es" | "en";
  onNavigateHome: () => void;
}

export function Breadcrumbs({
  items,
  isDarkMode,
  language,
  onNavigateHome,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label={
        language === "es" ? "Navegación de migas de pan" : "Breadcrumb navigation"
      }
      className={`border-b py-4 ${
        isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <button
              onClick={onNavigateHome}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isDarkMode
                  ? "text-[#b8a99a] hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label={language === "es" ? "Ir a inicio" : "Go to home"}
            >
              <Home className="h-4 w-4" />
              <span>{language === "es" ? "Inicio" : "Home"}</span>
            </button>
          </li>

          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <ChevronRight
                className={`h-4 w-4 ${
                  isDarkMode ? "text-[#3d2f23]" : "text-gray-400"
                }`}
              />
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={`text-sm transition-colors ${
                    isDarkMode
                      ? "text-[#b8a99a] hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
