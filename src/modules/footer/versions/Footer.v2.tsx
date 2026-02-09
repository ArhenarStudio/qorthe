"use client";

/**
 * Footer V2 - Nueva versión de Figma
 * Placeholder para migrar diseño actualizado desde Figma.
 * Cuando esté listo, reemplazar contenido y actualizar components/Footer.tsx
 */

import { Sun, Moon } from "lucide-react";

interface FooterV2Props {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  translations: Record<string, unknown>;
}

export function FooterV2({ language, isDarkMode, onToggleDarkMode, translations: t }: FooterV2Props) {
  return (
    <footer
      id="contact"
      className={`border-t ${
        isDarkMode ? "border-[#3d2f23] bg-[#0a0806]" : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
        <p className={isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}>
          [Footer V2 - Pendiente de migración desde Figma]
        </p>
        <button
          onClick={onToggleDarkMode}
          className="mt-4 flex items-center gap-2 rounded-full border px-3 py-1.5"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4" />
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
