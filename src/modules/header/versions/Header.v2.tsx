"use client";

/**
 * Header V2 - Nueva versión de Figma
 * Placeholder para migrar diseño actualizado desde Figma.
 * Cuando esté listo, reemplazar contenido en modules/header/components/Header.tsx
 */

import { Menu, User, ShoppingCart } from "lucide-react";

interface HeaderV2Props {
  isScrolled: boolean;
  language: "es" | "en";
  isDarkMode: boolean;
  isMobileMenuOpen: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onToggleMobileMenu: () => void;
  onNavigateProducts: () => void;
  onNavigateHome: () => void;
  onNavigateCart: () => void;
  onNavigateAccount: () => void;
  translations: Record<string, unknown>;
  cartItemsCount?: number;
}

export function HeaderV2({
  isDarkMode,
  onToggleMobileMenu,
}: Pick<HeaderV2Props, "isDarkMode" | "onToggleMobileMenu">) {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b ${
        isDarkMode ? "border-[#3d2f23] bg-[#0a0806]/95" : "border-gray-200 bg-white/95"
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4">
        <span className="font-bold">DavidSon´s</span>
        <span className="font-normal"> Design</span>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <User className="h-4 w-4" />
          <button onClick={onToggleMobileMenu} aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className={`px-4 pb-2 text-xs ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
        [Header V2 - Pendiente de migración desde Figma]
      </p>
    </header>
  );
}
