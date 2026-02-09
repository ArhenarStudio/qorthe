"use client";

import { useState } from "react";
import { LoginPage } from "@/modules/customer-account";

export default function LoginRouteClient() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <LoginPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateRegister={() => (window.location.href = "/register")}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/account")}
    />
  );
}
