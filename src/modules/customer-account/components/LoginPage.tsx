"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";

interface LoginPageProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateAccount?: () => void;
  onNavigateRegister: () => void;
  onLogin: (email: string, password: string) => void | Promise<void>;
}

const translations = {
  es: {
    nav: { products: "Productos", about: "About", contact: "Contact" },
    title: "Iniciar Sesión",
    subtitle: "Accede a tu cuenta para continuar",
    email: "Correo Electrónico",
    emailPlaceholder: "tu@correo.com",
    password: "Contraseña",
    passwordPlaceholder: "Ingresa tu contraseña",
    rememberMe: "Recordarme",
    forgotPassword: "¿Olvidaste tu contraseña?",
    loginButton: "Iniciar Sesión",
    loginButtonLoading: "Iniciando sesión...",
    or: "o",
    noAccount: "¿No tienes cuenta?",
    registerLink: "Regístrate",
    footer: {
      description:
        "Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.",
      navigation: "Navegación",
      catalog: "Catálogo",
      contactTitle: "Contacto",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
    },
  },
  en: {
    nav: { products: "Products", about: "About", contact: "Contact" },
    title: "Sign In",
    subtitle: "Access your account to continue",
    email: "Email Address",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot your password?",
    loginButton: "Sign In",
    loginButtonLoading: "Signing in...",
    or: "or",
    noAccount: "Don't have an account?",
    registerLink: "Sign Up",
    footer: {
      description:
        "Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.",
      navigation: "Navigation",
      catalog: "Catalog",
      contactTitle: "Contact",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
    },
  },
};

export function LoginPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateAccount,
  onNavigateRegister,
  onLogin,
}: LoginPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const t = translations[language];

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    let hasError = false;
    if (!email) {
      setEmailError(language === "es" ? "El correo es requerido" : "Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError(language === "es" ? "Correo inválido" : "Invalid email");
      hasError = true;
    }
    if (!password) {
      setPasswordError(language === "es" ? "La contraseña es requerida" : "Password is required");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError(language === "es" ? "Mínimo 6 caracteres" : "Minimum 6 characters");
      hasError = true;
    }
    if (hasError) return;
    setIsLoading(true);
    try {
      await Promise.resolve(onLogin(email, password));
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0806]" : "bg-white"
      }`}
    >
      <Header
        isScrolled={isScrolled}
        language={language}
        isDarkMode={isDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleLanguage={onToggleLanguage}
        onToggleDarkMode={onToggleDarkMode}
        onToggleMobileMenu={handleToggleMobileMenu}
        onNavigateProducts={onNavigateProducts}
        onNavigateHome={onNavigateHome}
        onNavigateCart={() => (window.location.href = "/cart")}
        onNavigateAccount={onNavigateAccount ?? (() => (window.location.href = "/login"))}
        translations={t}
      />

      <div className="pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-md px-4 md:px-8">
          <div className="mb-8 text-center md:mb-10">
            <h1
              className={`mb-3 text-3xl tracking-tight md:text-4xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h1>
            <p
              className={`text-base ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className={`mb-2 block text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.email}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail
                    className={`h-5 w-5 ${
                      emailError
                        ? "text-red-500"
                        : isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  placeholder={t.emailPlaceholder}
                  className={`w-full border py-3.5 pl-12 pr-4 transition-colors focus:outline-none ${
                    emailError
                      ? "border-red-500 focus:border-red-500"
                      : isDarkMode
                        ? "border-[#3d2f23] bg-[#1a1512] text-white placeholder:text-[#b8a99a]/50 focus:border-[#8b6f47]"
                        : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                  }`}
                />
              </div>
              {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
            </div>

            <div>
              <label
                htmlFor="password"
                className={`mb-2 block text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.password}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock
                    className={`h-5 w-5 ${
                      passwordError
                        ? "text-red-500"
                        : isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder={t.passwordPlaceholder}
                  className={`w-full border py-3.5 pl-12 pr-12 transition-colors focus:outline-none ${
                    passwordError
                      ? "border-red-500 focus:border-red-500"
                      : isDarkMode
                        ? "border-[#3d2f23] bg-[#1a1512] text-white placeholder:text-[#b8a99a]/50 focus:border-[#8b6f47]"
                        : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${isDarkMode ? "text-[#b8a99a]" : "text-gray-400"}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${isDarkMode ? "text-[#b8a99a]" : "text-gray-400"}`} />
                  )}
                </button>
              </div>
              {passwordError && <p className="mt-2 text-sm text-red-500">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-[#8b6f47]"
                />
                <span className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                  {t.rememberMe}
                </span>
              </label>
              <button
                type="button"
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-[#b8a99a] hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.forgotPassword}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 px-6 py-3.5 tracking-wide transition-opacity ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              } ${
                isDarkMode
                  ? "bg-[#8b6f47] text-white hover:opacity-90"
                  : "bg-[#3d2f23] text-white hover:opacity-90"
              }`}
            >
              {isLoading && <Loader className="h-5 w-5 animate-spin" />}
              {isLoading ? t.loginButtonLoading : t.loginButton}
            </button>
          </form>

          <div className="relative my-8">
            <div
              className={`absolute inset-0 flex items-center ${
                isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
              }`}
            >
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${isDarkMode ? "bg-[#0a0806] text-[#b8a99a]" : "bg-white text-gray-500"}`}>
                {t.or}
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
              {t.noAccount}{" "}
              <button
                type="button"
                onClick={onNavigateRegister}
                className={`transition-colors ${
                  isDarkMode ? "text-white hover:text-[#8b6f47]" : "text-gray-900 hover:text-[#8b6f47]"
                }`}
              >
                {t.registerLink}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        translations={t}
      />
    </div>
  );
}
