"use client";

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
} from "lucide-react";

interface HeaderProps {
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
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateOrders?: () => void;
  onNavigateWishlist?: () => void;
  onNavigateAddresses?: () => void;
  onLogout?: () => void;
  cartItemsCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  translations: {
    nav: {
      products: string;
      about: string;
      contact: string;
    };
  };
}

export function Header({
  isScrolled,
  language,
  isDarkMode,
  isMobileMenuOpen,
  onToggleLanguage,
  onToggleDarkMode,
  onToggleMobileMenu,
  onNavigateProducts,
  onNavigateHome,
  onNavigateCart,
  onNavigateAccount,
  onNavigateLogin,
  onNavigateDashboard,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateAddresses,
  onLogout,
  cartItemsCount,
  isAuthenticated = false,
  userName,
  translations: t,
}: HeaderProps) {
  return (
    <>
      {/* Header Principal */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm transition-all duration-300 ${
          isDarkMode
            ? "border-[#3d2f23] bg-[#0a0806]/95 text-[#f5f0e8]"
            : "border-gray-200 bg-white/95 text-gray-900"
        } ${isScrolled ? "-translate-y-4 opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-4 md:px-8 md:py-6 lg:px-12">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg tracking-tight md:text-xl lg:text-2xl">
              <span className="font-bold">DavidSon´s</span>{" "}
              <span className="font-normal">Design</span>
            </h1>
          </div>

          {/* Desktop - Menu Button */}
          <div className="hidden lg:block">
            <button
              onClick={onToggleMobileMenu}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile - Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={onToggleMobileMenu}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Sticky Desktop */}
      <div
        className={`fixed left-1/2 top-6 z-50 hidden -translate-x-1/2 transition-all duration-300 lg:block ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`rounded-full border shadow-lg backdrop-blur-sm ${
            isDarkMode
              ? "border-[#3d2f23] bg-[#0a0806]/95 text-[#f5f0e8]"
              : "border-gray-200 bg-white/95 text-gray-900"
          }`}
        >
          <nav className="flex items-center justify-between gap-6 px-6 py-2.5">
            {/* Logo */}
            <a
              href="#"
              className="whitespace-nowrap tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-bold">DavidSon´s</span>
              <span className="text-sm font-normal"> Design</span>
            </a>

            {/* Controls Group */}
            <div className="flex items-center gap-2">
              {/* Cart Icon with Count */}
              <button
                onClick={onNavigateCart}
                className={`flex items-center gap-1.5 rounded-full p-2 transition-colors ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Shopping cart"
              >
                {cartItemsCount != null && cartItemsCount > 0 && (
                  <span
                    className={`text-xs font-medium ${
                      isDarkMode ? "text-[#f5f0e8]" : "text-gray-900"
                    }`}
                  >
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="h-4 w-4" />
              </button>

              {/* User Icon */}
              <button
                onClick={onNavigateAccount}
                className={`rounded-full p-2 transition-colors ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Mi cuenta"
              >
                <User className="h-4 w-4" />
              </button>

              {/* Menu Button */}
              <button
                onClick={onToggleMobileMenu}
                className={`rounded-full p-2 transition-colors ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Header Sticky Mobile */}
      <div
        className={`fixed left-1/2 top-4 z-40 -translate-x-1/2 transition-all duration-300 lg:hidden ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`rounded-full border shadow-lg backdrop-blur-sm ${
            isDarkMode
              ? "border-[#3d2f23] bg-[#0a0806]/95 text-[#f5f0e8]"
              : "border-gray-200 bg-white/95 text-gray-900"
          }`}
        >
          <nav className="flex w-full items-center justify-between gap-1 px-3 py-1.5 md:px-4 md:py-2">
            {/* Logo - más compacto */}
            <a
              href="#"
              className="flex items-center whitespace-nowrap tracking-tight transition-opacity hover:opacity-80"
            >
              <span className="text-[10px] font-bold md:text-xs">
                DavidSon´s
              </span>
              <span className="ml-0.5 text-[10px] font-normal md:text-xs">
                Design
              </span>
            </a>

            {/* Controls Group - Más horizontal */}
            <div className="flex items-center gap-1 md:gap-1.5">
              {/* Cart Icon with Count */}
              <button
                onClick={onNavigateCart}
                className={`flex items-center gap-1 rounded-full p-1.5 transition-colors md:gap-1.5 md:p-2 ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Shopping cart"
              >
                {cartItemsCount != null && cartItemsCount > 0 && (
                  <span
                    className={`text-[10px] font-medium md:text-xs ${
                      isDarkMode ? "text-[#f5f0e8]" : "text-gray-900"
                    }`}
                  >
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>

              {/* User Icon */}
              <button
                onClick={onNavigateAccount}
                className={`rounded-full p-1.5 transition-colors md:p-2 ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Mi cuenta"
              >
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={onToggleMobileMenu}
                className={`rounded-full p-1.5 transition-colors md:p-2 ${
                  isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                }`}
                aria-label="Toggle menu"
              >
                <Menu className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Menu Panel Lateral - Visible en todas las resoluciones */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop con blur */}
        <div
          className={`absolute inset-0 backdrop-blur-md ${
            isDarkMode ? "bg-[#0a0806]/80" : "bg-white/80"
          }`}
          onClick={onToggleMobileMenu}
          onKeyDown={(e) => e.key === "Escape" && onToggleMobileMenu()}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />

        {/* Menu Panel deslizante desde la derecha */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-full border-l shadow-2xl transition-transform duration-500 ease-out sm:w-96 ${
            isDarkMode
              ? "border-[#3d2f23] bg-[#0a0806] text-[#f5f0e8]"
              : "border-gray-200 bg-white text-gray-900"
          } ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div
            className={`flex items-center justify-between border-b px-6 py-6 md:px-8 ${
              isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
            }`}
          >
            {/* Logo */}
            <a href="#" className="flex items-center">
              <h1 className="text-lg tracking-tight md:text-xl">
                <span className="font-bold">DavidSon´s</span>{" "}
                <span className="font-normal">Design</span>
              </h1>
            </a>

            {/* Close Button */}
            <button
              onClick={onToggleMobileMenu}
              className="group relative flex h-8 w-8 items-center justify-center"
              aria-label="Close menu"
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <span
                  className={`absolute h-0.5 w-6 rotate-45 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]"
                      : "bg-gray-600 group-hover:bg-gray-900"
                  }`}
                />
                <span
                  className={`absolute h-0.5 w-6 -rotate-45 transition-all duration-300 ${
                    isDarkMode
                      ? "bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]"
                      : "bg-gray-600 group-hover:bg-gray-900"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 90px)" }}
          >
            {/* Navegación Principal */}
            <div
              className={`border-b px-4 py-3 ${
                isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wider ${
                  isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
                }`}
              >
                {language === "es" ? "Navegación" : "Navigation"}
              </p>
            </div>
            <button
              onClick={() => {
                onNavigateProducts();
                onToggleMobileMenu();
              }}
              className={`flex w-full items-center justify-between px-6 py-4 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
            >
              <span>{t.nav.products}</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            <a
              href="#about"
              onClick={onToggleMobileMenu}
              className={`flex w-full items-center justify-between px-6 py-4 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
            >
              <span>{t.nav.about}</span>
              <ChevronRight className="h-5 w-5" />
            </a>
            <a
              href="#contact"
              onClick={onToggleMobileMenu}
              className={`flex w-full items-center justify-between px-6 py-4 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
            >
              <span>{t.nav.contact}</span>
              <ChevronRight className="h-5 w-5" />
            </a>

            {/* Mi Cuenta Section (Solo si está autenticado) */}
            {isAuthenticated && (
              <>
                <div
                  className={`border-b border-t px-4 py-3 ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <p
                    className={`text-xs uppercase tracking-wider ${
                      isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
                    }`}
                  >
                    {language === "es" ? "Mi Cuenta" : "My Account"}
                  </p>
                </div>
                {userName && (
                  <div
                    className={`border-b px-6 py-4 ${
                      isDarkMode
                        ? "border-[#3d2f23] bg-[#2d2419]/50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {language === "es" ? "Hola," : "Hello,"}
                    </p>
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {userName}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    onNavigateDashboard?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Panel de Control" : "Dashboard"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigateOrders?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Mis Pedidos" : "My Orders"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigateWishlist?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                  }`}
                >
                  <Heart className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Lista de Deseos" : "Wishlist"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    onNavigateAddresses?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Direcciones" : "Addresses"}
                  </span>
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode
                      ? "text-red-400 hover:bg-[#2d2419]"
                      : "text-red-600 hover:bg-gray-100"
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Cerrar Sesión" : "Logout"}
                  </span>
                </button>
              </>
            )}

            {/* Login Button (Solo si NO está autenticado) */}
            {!isAuthenticated && (
              <>
                <div
                  className={`border-t px-4 py-3 ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                />
                <button
                  onClick={() => {
                    onNavigateLogin?.();
                    onToggleMobileMenu();
                  }}
                  className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                    isDarkMode
                      ? "bg-[#8b6f47] text-white hover:opacity-90"
                      : "bg-[#3d2f23] text-white hover:opacity-90"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span className="flex-1 text-left">
                    {language === "es" ? "Iniciar Sesión" : "Sign In"}
                  </span>
                </button>
              </>
            )}

            {/* Configuración */}
            <div
              className={`border-t px-4 py-3 ${
                isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
              }`}
            >
              <p
                className={`text-xs uppercase tracking-wider ${
                  isDarkMode ? "text-[#b8a99a]/60" : "text-gray-500"
                }`}
              >
                {language === "es" ? "Configuración" : "Settings"}
              </p>
            </div>
            {/* Language Toggle */}
            <button
              onClick={() => {
                onToggleLanguage();
                onToggleMobileMenu();
              }}
              className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
            >
              <Globe className="h-5 w-5" />
              <span className="flex-1 text-left">
                {language === "es" ? "Idioma" : "Language"}
              </span>
              <span
                className={`rounded px-2 py-1 text-sm font-medium ${
                  isDarkMode ? "bg-[#8b6f47] text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {language === "es" ? "ES" : "EN"}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                onToggleDarkMode();
                onToggleMobileMenu();
              }}
              className={`flex w-full items-center gap-3 px-6 py-4 transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="flex-1 text-left">
                {isDarkMode
                  ? language === "es"
                    ? "Modo Oscuro"
                    : "Dark Mode"
                  : language === "es"
                    ? "Modo Claro"
                    : "Light Mode"}
              </span>
              <div className="relative h-6 w-11 rounded-full bg-[#8b6f47]">
                <div
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    isDarkMode ? "right-1" : "left-1"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
