"use client";

import { useState } from "react";
import { CartPage } from "@/modules/cart";

export default function CartPageRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <CartPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() =>
        setLanguage((lang) => (lang === "es" ? "en" : "es"))
      }
      onToggleDarkMode={() => setIsDarkMode((mode) => !mode)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/login")}
      onContinueShopping={() => (window.location.href = "/products")}
    />
  );
}
