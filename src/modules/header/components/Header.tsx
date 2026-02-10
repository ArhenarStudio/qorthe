"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppState } from '@/modules/app-state';
import { useAuth } from '@/modules/auth';
import { useCart } from '@/modules/cart';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Heart,
  MapPin,
  Globe,
  Moon,
  Sun,
  MessageCircle,
  MessageSquare,
  Calendar,
  Image,
  BookOpen,
  HelpCircle,
  Calculator,
  GitCompare,
  Shield,
  FileText,
  Cookie,
} from 'lucide-react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode, language, showWhatsApp, showChat, toggleDarkMode, toggleLanguage, toggleWhatsApp, toggleChat } = useAppState();
  const { user, isAuthenticated, signOut } = useAuth();
  const { cartCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const cartItemsCount = cartCount || 0;

  const translations = {
    es: {
      products: 'Productos',
      about: 'Acerca de',
      contact: 'Contacto',
      login: 'Iniciar Sesión',
      myAccount: 'Mi Cuenta',
      dashboard: 'Panel de Control',
      orders: 'Mis Pedidos',
      wishlist: 'Lista de Deseos',
      addresses: 'Direcciones',
      logout: 'Cerrar Sesión',
      // Servicios y Recursos
      appointment: 'Agenda una Cita',
      gallery: 'Galería de Proyectos',
      blog: 'Blog',
      faq: 'Preguntas Frecuentes',
      // Herramientas
      calculator: 'Calculadora de Financiamiento',
      compare: 'Comparador de Productos',
      // Configuración
      settings: 'Configuración',
      languageLabel: 'Idioma',
      darkMode: 'Modo Oscuro',
      whatsappButton: 'Botón WhatsApp',
      liveChat: 'Chat en Vivo',
      // Legal
      legal: 'Legal',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones',
      cookies: 'Política de Cookies',
    },
    en: {
      products: 'Products',
      about: 'About',
      contact: 'Contact',
      login: 'Sign In',
      myAccount: 'My Account',
      dashboard: 'Dashboard',
      orders: 'My Orders',
      wishlist: 'Wishlist',
      addresses: 'Addresses',
      logout: 'Sign Out',
      // Services & Resources
      appointment: 'Schedule Appointment',
      gallery: 'Project Gallery',
      blog: 'Blog',
      faq: 'FAQ',
      // Tools
      calculator: 'Financing Calculator',
      compare: 'Product Comparison',
      // Settings
      settings: 'Settings',
      languageLabel: 'Language',
      darkMode: 'Dark Mode',
      whatsappButton: 'WhatsApp Button',
      liveChat: 'Live Chat',
      // Legal
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      cookies: 'Cookie Policy',
    },
  };

  const t = translations[language];

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <>
      {/* Desktop/Tablet Header - Simplified Pill when scrolled */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'py-3'
            : 'py-6'
        }`}
      >
        <div className={`max-w-7xl mx-auto transition-all duration-500 ${
          isScrolled ? 'px-4' : 'px-6 lg:px-8'
        }`}>
          <div
            className={`flex items-center justify-between transition-all duration-500 ${
              isScrolled
                ? `rounded-full px-6 py-3 shadow-lg backdrop-blur-md ${
                    isDarkMode
                      ? 'bg-[#0a0806]/95 border border-[#3d2f23]'
                      : 'bg-white/95 border border-gray-200'
                  }`
                : `px-4 py-2 ${
                    isDarkMode
                      ? 'bg-[#0a0806]/80 backdrop-blur-sm'
                      : 'bg-white/80 backdrop-blur-sm'
                  }`
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className={`font-serif transition-all duration-300 ${
                isScrolled ? 'text-2xl' : 'text-3xl'
              } ${
                isDarkMode ? 'text-[#f5f0e8]' : 'text-gray-900'
              } hover:text-[#8b6f47]`}
            >
              Davidsons Design
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/products"
                className={`transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:text-[#8b6f47]'
                    : 'text-gray-900 hover:text-[#8b6f47]'
                }`}
              >
                {t.products}
              </Link>
              <Link
                href="/about"
                className={`transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:text-[#8b6f47]'
                    : 'text-gray-900 hover:text-[#8b6f47]'
                }`}
              >
                {t.about}
              </Link>
              <a
                href="#contact"
                className={`transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:text-[#8b6f47]'
                    : 'text-gray-900 hover:text-[#8b6f47]'
                }`}
              >
                {t.contact}
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Toggle - Desktop */}
              <button
                onClick={toggleLanguage}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>

              {/* Dark Mode Toggle - Desktop */}
              <button
                onClick={toggleDarkMode}
                className={`hidden md:flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8b6f47] text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className={`hidden md:flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:block px-4 py-2 bg-[#8b6f47] text-white rounded-lg hover:bg-[#6d5838] transition-colors"
                >
                  {t.login}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode ? 'bg-[#0a0806]' : 'bg-white'
        } shadow-2xl overflow-y-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
            }`}
          >
            <span
              className={`font-serif text-xl ${
                isDarkMode ? 'text-[#f5f0e8]' : 'text-gray-900'
              }`}
            >
              Menu
            </span>
            <button
              onClick={toggleMobileMenu}
              className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                isDarkMode
                  ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* 1. NAVEGACIÓN */}
            <div className="px-4 mb-6">
              <Link
                href="/products"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="flex-1 text-left">{t.products}</span>
              </Link>
              <Link
                href="/about"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="flex-1 text-left">{t.about}</span>
              </Link>
              <a
                href="#contact"
                onClick={toggleMobileMenu}
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="flex-1 text-left">{t.contact}</span>
              </a>
            </div>

            {/* Divider */}
            <div className={`h-px mx-4 mb-6 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`} />

            {/* 2. AUTENTICACIÓN */}
            <div className="px-4 mb-6">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 p-4 rounded-lg bg-[#8b6f47] text-white hover:bg-[#6d5838] transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  {t.login}
                </Link>
              ) : (
                <>
                  <div className={`mb-3 px-2 text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-500'
                  }`}>
                    {t.myAccount}
                  </div>
                  <Link
                    href="/account"
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="flex-1 text-left">{t.dashboard}</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="flex-1 text-left">{t.orders}</span>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="flex-1 text-left">{t.wishlist}</span>
                  </Link>
                  <Link
                    href="/account/addresses"
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="flex-1 text-left">{t.addresses}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="flex-1 text-left">{t.logout}</span>
                  </button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className={`h-px mx-4 mb-6 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`} />

            {/* 3. SERVICIOS Y RECURSOS */}
            <div className="px-4 mb-6">
              <Link
                href="/appointment"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="flex-1 text-left">{t.appointment}</span>
              </Link>
              <Link
                href="/gallery"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Image className="w-5 h-5" />
                <span className="flex-1 text-left">{t.gallery}</span>
              </Link>
              <Link
                href="/blog"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span className="flex-1 text-left">{t.blog}</span>
              </Link>
              <Link
                href="/faq"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="flex-1 text-left">{t.faq}</span>
              </Link>
            </div>

            {/* Divider */}
            <div className={`h-px mx-4 mb-6 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`} />

            {/* 4. HERRAMIENTAS */}
            <div className="px-4 mb-6">
              <Link
                href="/financing-calculator"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Calculator className="w-5 h-5" />
                <span className="flex-1 text-left">{t.calculator}</span>
              </Link>
              <Link
                href="/compare"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <GitCompare className="w-5 h-5" />
                <span className="flex-1 text-left">{t.compare}</span>
              </Link>
            </div>

            {/* Divider */}
            <div className={`h-px mx-4 mb-6 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`} />

            {/* 5. CONFIGURACIÓN */}
            <div className="px-4 mb-6">
              <div className={`mb-3 px-2 text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-500'
              }`}>
                {t.settings}
              </div>

              {/* Language Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLanguage();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="flex-1 text-left">{t.languageLabel}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  isDarkMode ? 'bg-[#2d2419] text-[#8b6f47]' : 'bg-gray-100 text-[#8b6f47]'
                }`}>
                  {language.toUpperCase()}
                </span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDarkMode();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span className="flex-1 text-left">{t.darkMode}</span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isDarkMode ? 'bg-[#8b6f47]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>

              {/* WhatsApp Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWhatsApp();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="flex-1 text-left">{t.whatsappButton}</span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showWhatsApp ? 'bg-[#8b6f47]' : isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      showWhatsApp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>

              {/* Chat Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleChat();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="flex-1 text-left">{t.liveChat}</span>
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    showChat ? 'bg-[#8b6f47]' : isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      showChat ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className={`h-px mx-4 mb-6 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`} />

            {/* 6. LEGAL */}
            <div className="px-4 mb-6">
              <div className={`mb-3 px-2 text-xs font-medium uppercase tracking-wider ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-500'
              }`}>
                {t.legal}
              </div>
              <Link
                href="/privacy"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span className="flex-1 text-left">{t.privacy}</span>
              </Link>
              <Link
                href="/terms"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="flex-1 text-left">{t.terms}</span>
              </Link>
              <Link
                href="/cookies"
                className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'text-[#f5f0e8] hover:bg-[#2d2419]'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Cookie className="w-5 h-5" />
                <span className="flex-1 text-left">{t.cookies}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
