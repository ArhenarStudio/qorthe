"use client";

import { useState } from "react";
import { RegisterPage } from "@/modules/customer-account";

export default function RegisterRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <RegisterPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateLogin={() => (window.location.href = "/login")}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/account")}
    />
  );
}
