/**
 * Backup V1 - 2026-02-09. Componente activo en components/RegisterPage.tsx
 */
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { Mail, Lock, Eye, EyeOff, User, Loader } from "lucide-react";

interface RegisterPageProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateAccount?: () => void;
  onNavigateLogin: () => void;
  onRegister: (name: string, email: string, password: string) => void | Promise<void>;
}

const translations = {
  es: {
    nav: { products: "Productos", about: "About", contact: "Contact" },
    title: "Crear Cuenta",
    subtitle: "Únete a nuestra comunidad",
    fullName: "Nombre Completo",
    fullNamePlaceholder: "Tu nombre completo",
    email: "Correo Electrónico",
    emailPlaceholder: "tu@correo.com",
    password: "Contraseña",
    passwordPlaceholder: "Mínimo 6 caracteres",
    confirmPassword: "Confirmar Contraseña",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    acceptTerms: "Acepto los ",
    termsLink: "términos y condiciones",
    registerButton: "Crear Cuenta",
    registerButtonLoading: "Creando cuenta...",
    or: "o",
    hasAccount: "¿Ya tienes cuenta? ",
    loginLink: "Inicia Sesión",
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
    title: "Create Account",
    subtitle: "Join our community",
    fullName: "Full Name",
    fullNamePlaceholder: "Your full name",
    email: "Email Address",
    emailPlaceholder: "your@email.com",
    password: "Password",
    passwordPlaceholder: "Minimum 6 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    acceptTerms: "I accept the ",
    termsLink: "terms and conditions",
    registerButton: "Create Account",
    registerButtonLoading: "Creating account...",
    or: "or",
    hasAccount: "Already have an account? ",
    loginLink: "Sign In",
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

export function RegisterPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateAccount,
  onNavigateLogin,
  onRegister,
}: RegisterPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

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
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setTermsError("");
    let hasError = false;
    if (!fullName.trim()) {
      setNameError(language === "es" ? "El nombre es requerido" : "Name is required");
      hasError = true;
    }
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
    if (!confirmPassword) {
      setConfirmPasswordError(
        language === "es" ? "Confirma tu contraseña" : "Confirm your password"
      );
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        language === "es" ? "Las contraseñas no coinciden" : "Passwords do not match"
      );
      hasError = true;
    }
    if (!acceptTerms) {
      setTermsError(language === "es" ? "Debes aceptar los términos" : "You must accept the terms");
      hasError = true;
    }
    if (hasError) return;
    setIsLoading(true);
    try {
      await Promise.resolve(onRegister(fullName, email, password));
    } catch (err) {
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (err: string) =>
    err
      ? "border-red-500 focus:border-red-500"
      : isDarkMode
        ? "border-[#3d2f23] bg-[#1a1512] text-white placeholder:text-[#b8a99a]/50 focus:border-[#8b6f47]"
        : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400";

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
            <p className={`text-base ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className={`mb-2 block text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}
              >
                {t.fullName}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User
                    className={`h-5 w-5 ${
                      nameError ? "text-red-500" : isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setNameError("");
                  }}
                  placeholder={t.fullNamePlaceholder}
                  className={`w-full border py-3.5 pl-12 pr-4 transition-colors focus:outline-none ${inputClass(nameError)}`}
                />
              </div>
              {nameError && <p className="mt-2 text-sm text-red-500">{nameError}</p>}
            </div>

            <div>
              <label
                htmlFor="email"
                className={`mb-2 block text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}
              >
                {t.email}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail
                    className={`h-5 w-5 ${
                      emailError ? "text-red-500" : isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
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
                  className={`w-full border py-3.5 pl-12 pr-4 transition-colors focus:outline-none ${inputClass(emailError)}`}
                />
              </div>
              {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
            </div>

            <div>
              <label
                htmlFor="password"
                className={`mb-2 block text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}
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
                  className={`w-full border py-3.5 pl-12 pr-12 transition-colors focus:outline-none ${inputClass(passwordError)}`}
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

            <div>
              <label
                htmlFor="confirmPassword"
                className={`mb-2 block text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}
              >
                {t.confirmPassword}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock
                    className={`h-5 w-5 ${
                      confirmPasswordError
                        ? "text-red-500"
                        : isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordError("");
                  }}
                  placeholder={t.confirmPasswordPlaceholder}
                  className={`w-full border py-3.5 pl-12 pr-12 transition-colors focus:outline-none ${inputClass(confirmPasswordError)}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`h-5 w-5 ${isDarkMode ? "text-[#b8a99a]" : "text-gray-400"}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${isDarkMode ? "text-[#b8a99a]" : "text-gray-400"}`} />
                  )}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-2 text-sm text-red-500">{confirmPasswordError}</p>
              )}
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    setTermsError("");
                  }}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#8b6f47]"
                />
                <span
                  className={`text-sm ${
                    termsError ? "text-red-500" : isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {t.acceptTerms}
                  <button
                    type="button"
                    className={`transition-colors ${
                      isDarkMode ? "text-white hover:text-[#8b6f47]" : "text-gray-900 hover:text-[#8b6f47]"
                    }`}
                  >
                    {t.termsLink}
                  </button>
                </span>
              </label>
              {termsError && <p className="mt-2 text-sm text-red-500">{termsError}</p>}
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
              {isLoading ? t.registerButtonLoading : t.registerButton}
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
              {t.hasAccount}
              <button
                type="button"
                onClick={onNavigateLogin}
                className={`transition-colors ${
                  isDarkMode ? "text-white hover:text-[#8b6f47]" : "text-gray-900 hover:text-[#8b6f47]"
                }`}
              >
                {t.loginLink}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateCookies={() => (window.location.href = "/cookies")}
        onNavigateCatalog={() => (window.location.href = "/products")}
        translations={t}
      />
    </div>
  );
}
