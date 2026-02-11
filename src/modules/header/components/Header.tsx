"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Globe,
  Sun,
  Moon,
  Menu,
  ShoppingCart,
  User,
  ChevronRight,
  Package,
  Heart,
  MapPin,
  LogOut,
  Calendar,
  Image,
  BookOpen,
  HelpCircle,
  Calculator,
  GitCompare,
  MessageCircle,
  MessageSquare,
} from "lucide-react";
import { useAppState } from "@/modules/app-state";
import { useAuth } from "@/modules/auth";
import { useCart } from "@/modules/cart";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, language, showWhatsApp, showChat, toggleDarkMode, toggleLanguage, toggleWhatsApp, toggleChat } =
    useAppState();
  const { user, isAuthenticated, signOut } = useAuth();
  const { cartCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const lang = language === "es" ? "es" : "en";
  const cartItemsCount = cartCount ?? 0;
  const userName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email : undefined;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const nav = (path: string) => {
    closeMenu();
    router.push(path);
  };

  const handleLogout = async () => {
    await signOut();
    closeMenu();
    router.push("/");
  };

  const t = {
    es: {
      products: "Productos",
      about: "Acerca de",
      contact: "Contacto",
      nav: "Navegación",
      myAccount: "Mi Cuenta",
      dashboard: "Panel de Control",
      orders: "Mis Pedidos",
      wishlist: "Lista de Deseos",
      addresses: "Direcciones",
      logout: "Cerrar Sesión",
      signIn: "Iniciar Sesión",
      settings: "Configuración",
      language: "Idioma",
      darkMode: "Modo Oscuro",
      lightMode: "Modo Claro",
      whatsapp: "Botón WhatsApp",
      liveChat: "Chat en Vivo",
      additionalLinks: "Enlaces Adicionales",
      faq: "Preguntas Frecuentes",
      blog: "Blog",
      projectGallery: "Galería de Proyectos",
      appointment: "Cita",
      compare: "Comparar",
      calculator: "Calculadora",
    },
    en: {
      products: "Products",
      about: "About",
      contact: "Contact",
      nav: "Navigation",
      myAccount: "My Account",
      dashboard: "Dashboard",
      orders: "My Orders",
      wishlist: "Wishlist",
      addresses: "Addresses",
      logout: "Logout",
      signIn: "Sign In",
      settings: "Settings",
      language: "Language",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      whatsapp: "WhatsApp Button",
      liveChat: "Live Chat",
      additionalLinks: "Additional Links",
      faq: "FAQ",
      blog: "Blog",
      projectGallery: "Project Gallery",
      appointment: "Appointment",
      compare: "Compare",
      calculator: "Calculator",
    },
  }[lang];

  const headerCls = (visible: boolean) =>
    `backdrop-blur-sm border transition-all duration-300 ${
      isDarkMode
        ? "bg-[#0a0806]/95 border-[#3d2f23] text-[#f5f0e8]"
        : "bg-white/95 border-gray-200 text-gray-900"
    } ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`;

  const btnHover = isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100";

  return (
    <>
      {/* Header Principal - oculto al hacer scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          isDarkMode ? "bg-[#0a0806]/95 border-[#3d2f23] text-[#f5f0e8]" : "bg-white/95 border-gray-200 text-gray-900"
        } ${isScrolled ? "opacity-0 pointer-events-none -translate-y-4" : "opacity-100"}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <h1 className="text-lg md:text-xl lg:text-2xl tracking-tight">
              <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
            </h1>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/cart"
              className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="Shopping cart"
            >
              {cartItemsCount > 0 && (
                <span className={isDarkMode ? "text-sm font-medium text-[#f5f0e8]" : "text-sm font-medium text-gray-900"}>
                  {cartItemsCount}
                </span>
              )}
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className={`p-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="User account"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-1.5">
            <Link
              href="/cart"
              className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="Shopping cart"
            >
              {cartItemsCount > 0 && (
                <span className={isDarkMode ? "text-xs font-medium text-[#f5f0e8]" : "text-xs font-medium text-gray-900"}>
                  {cartItemsCount}
                </span>
              )}
              <ShoppingCart className="w-4 h-4" />
            </Link>
            <Link
              href={isAuthenticated ? "/account" : "/login"}
              className={`p-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="User account"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${btnHover}`}
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Sticky Desktop */}
      <div
        className={`hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className={`rounded-full shadow-lg ${headerCls(true)}`}>
          <nav className="flex items-center justify-between gap-6 px-6 py-2.5">
            <Link href="/" className="hover:opacity-80 transition-opacity tracking-tight whitespace-nowrap">
              <span className="font-bold text-sm">DavidSon´s</span>
              <span className="font-normal text-sm"> Design</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/cart" className={`flex items-center gap-1.5 p-2 rounded-full transition-colors ${btnHover}`} aria-label="Shopping cart">
                {cartItemsCount > 0 && (
                  <span className={isDarkMode ? "text-xs font-medium text-[#f5f0e8]" : "text-xs font-medium text-gray-900"}>
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="w-4 h-4" />
              </Link>
              <Link href={isAuthenticated ? "/account" : "/login"} className={`p-2 rounded-full transition-colors ${btnHover}`} aria-label="User account">
                <User className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 rounded-full transition-colors ${btnHover}`}
                aria-label="Toggle menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Header Sticky Mobile */}
      <div
        className={`lg:hidden fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className={`rounded-full shadow-lg ${headerCls(true)}`}>
          <nav className="flex items-center justify-between w-full gap-1 px-3 md:px-4 py-1.5 md:py-2">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity tracking-tight whitespace-nowrap">
              <span className="font-bold text-[10px] md:text-xs">DavidSon´s</span>
              <span className="font-normal text-[10px] md:text-xs ml-0.5">Design</span>
            </Link>
            <div className="flex items-center gap-1 md:gap-1.5">
              <Link
                href="/cart"
                className={`flex items-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-full transition-colors ${btnHover}`}
                aria-label="Shopping cart"
              >
                {cartItemsCount > 0 && (
                  <span
                    className={
                      isDarkMode ? "text-[10px] md:text-xs font-medium text-[#f5f0e8]" : "text-[10px] md:text-xs font-medium text-gray-900"
                    }
                  >
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${btnHover}`}
                aria-label="User account"
              >
                <User className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${btnHover}`}
                aria-label="Toggle menu"
              >
                <Menu className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Menu Panel Lateral */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 backdrop-blur-md ${isDarkMode ? "bg-[#0a0806]/80" : "bg-white/80"}`}
          onClick={closeMenu}
          aria-hidden
        />
        <div
          className={`absolute right-0 top-0 bottom-0 w-full sm:w-96 border-l shadow-2xl transition-transform duration-500 ease-out ${
            isDarkMode ? "bg-[#0a0806] border-[#3d2f23] text-[#f5f0e8]" : "bg-white border-gray-200 text-gray-900"
          } ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div
            className={`px-6 md:px-8 py-6 flex items-center justify-between border-b ${
              isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
            }`}
          >
            <Link href="/" onClick={closeMenu} className="flex items-center hover:opacity-80 transition-opacity">
              <h1 className="text-lg md:text-xl tracking-tight">
                <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
              </h1>
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              className="relative w-8 h-8 flex items-center justify-center group"
              aria-label="Close menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className={`absolute w-6 h-0.5 rotate-45 ${
                    isDarkMode ? "bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]" : "bg-gray-600 group-hover:bg-gray-900"
                  }`}
                />
                <span
                  className={`absolute w-6 h-0.5 -rotate-45 ${
                    isDarkMode ? "bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]" : "bg-gray-600 group-hover:bg-gray-900"
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 90px)" }}>
            <div className={`px-4 py-3 border-b ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"}`}>
                {t.nav}
              </p>
            </div>
            <button
              type="button"
              onClick={() => nav("/products")}
              className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${btnHover}`}
            >
              <span>{t.products}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              href="/about"
              onClick={closeMenu}
              className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${btnHover}`}
            >
              <span>{t.about}</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#contact"
              onClick={closeMenu}
              className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${btnHover}`}
            >
              <span>{t.contact}</span>
              <ChevronRight className="w-5 h-5" />
            </a>

            {isAuthenticated && (
              <>
                <div className={`px-4 py-3 border-t border-b ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}>
                  <p className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"}`}>
                    {t.myAccount}
                  </p>
                </div>
                {userName && (
                  <div
                    className={`px-6 py-4 border-b ${
                      isDarkMode ? "bg-[#2d2419]/50 border-[#3d2f23]" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <p className={`text-xs ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                      {lang === "es" ? "Hola," : "Hello,"}
                    </p>
                    <p className={isDarkMode ? "font-medium text-white" : "font-medium text-gray-900"}>{userName}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => nav("/account")}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
                >
                  <User className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.dashboard}</span>
                </button>
                <button
                  type="button"
                  onClick={() => nav("/account/orders")}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
                >
                  <Package className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.orders}</span>
                </button>
                <button
                  type="button"
                  onClick={() => nav("/account/wishlist")}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.wishlist}</span>
                </button>
                <button
                  type="button"
                  onClick={() => nav("/account/addresses")}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.addresses}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "text-red-400 hover:bg-[#2d2419]" : "text-red-600 hover:bg-gray-100"
                  }`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.logout}</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className={`px-4 py-3 border-t ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`} />
                <button
                  type="button"
                  onClick={() => nav("/login")}
                  className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "bg-[#8b6f47] text-white hover:opacity-90" : "bg-[#3d2f23] text-white hover:opacity-90"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="flex-1 text-left">{t.signIn}</span>
                </button>
              </>
            )}

            <div className={`px-4 py-3 border-t ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"}`}>
                {t.settings}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleLanguage}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <Globe className="w-5 h-5" />
              <span className="flex-1 text-left">{t.language}</span>
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  isDarkMode ? "bg-[#8b6f47] text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {lang === "es" ? "ES" : "EN"}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="flex-1 text-left">
                {isDarkMode ? t.darkMode : t.lightMode}
              </span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isDarkMode ? "bg-[#8b6f47]" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isDarkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </button>
            <button
              type="button"
              onClick={toggleWhatsApp}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="flex-1 text-left">{t.whatsapp}</span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showWhatsApp ? "bg-[#8b6f47]" : isDarkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    showWhatsApp ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </button>
            <button
              type="button"
              onClick={toggleChat}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="flex-1 text-left">{t.liveChat}</span>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  showChat ? "bg-[#8b6f47]" : isDarkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    showChat ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </button>

            <div className={`px-4 py-3 border-t ${isDarkMode ? "border-[#3d2f23]" : "border-gray-200"}`}>
              <p className={`text-xs uppercase tracking-wider ${isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"}`}>
                {t.additionalLinks}
              </p>
            </div>
            <button type="button" onClick={() => nav("/faq")} className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}>
              <HelpCircle className="w-5 h-5" />
              <span className="flex-1 text-left">{t.faq}</span>
            </button>
            <button type="button" onClick={() => nav("/blog")} className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}>
              <BookOpen className="w-5 h-5" />
              <span className="flex-1 text-left">{t.blog}</span>
            </button>
            <button
              type="button"
              onClick={() => nav("/gallery")}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <Image className="w-5 h-5" />
              <span className="flex-1 text-left">{t.projectGallery}</span>
            </button>
            <button
              type="button"
              onClick={() => nav("/appointment")}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <Calendar className="w-5 h-5" />
              <span className="flex-1 text-left">{t.appointment}</span>
            </button>
            <button
              type="button"
              onClick={() => nav("/compare")}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <GitCompare className="w-5 h-5" />
              <span className="flex-1 text-left">{t.compare}</span>
            </button>
            <button
              type="button"
              onClick={() => nav("/financing-calculator")}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${btnHover}`}
            >
              <Calculator className="w-5 h-5" />
              <span className="flex-1 text-left">{t.calculator}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
