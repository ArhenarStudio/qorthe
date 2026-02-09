"use client";

import { useState } from "react";
import { LoginPage } from "@/modules/customer-account";

export default function LoginRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <LoginPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onLogin={(_email, _password) => {
        // TODO: Implementar lógica de login con Shopify
        window.location.href = "/account";
      }}
      onNavigateRegister={() => (window.location.href = "/register")}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/login")}
    />
  );
}
