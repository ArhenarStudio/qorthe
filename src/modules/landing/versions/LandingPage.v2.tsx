/* Reference: Figma DSD V2 - do not use directly. Imports are relative to Figma project. */
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AnimatedSection, StaggerContainer, staggerItem } from './AnimatedSection';
import { Globe, Sun, Moon, User, ShoppingCart, ChevronDown, ChevronRight, Package, Heart, MapPin, LogOut, FileText, Shield, Cookie, Menu, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

interface LandingPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateCatalog: () => void;
  onNavigateTerms: () => void;
  onNavigatePrivacy: () => void;
  onNavigateCookies: () => void;
  onNavigateLogin?: () => void;
  onNavigateCart?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateOrders?: () => void;
  onNavigateWishlist?: () => void;
  onNavigateAddresses?: () => void;
  onLogout?: () => void;
  cartItemsCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: ['Muebles', 'Artesanales', 'Premium'],
      description: 'Cada pieza es elaborada a mano por artesanos mexicanos, combinando técnicas tradicionales con diseño contemporáneo para crear muebles únicos y atemporales.',
      cta: 'Explorar Colección'
    },
    collections: {
      title: 'Nuestras Colecciones',
      subtitle: 'Descubre piezas únicas diseñadas para transformar tu espacio',
      chairs: {
        title: 'Sillas & Sillones',
        description: 'Diseños ergonómicos con carácter artesanal',
        cta: 'Ver Colección'
      },
      tables: {
        title: 'Mesas de Comedor',
        description: 'El centro de reunión de tu hogar',
        cta: 'Ver Colección'
      },
      bedrooms: {
        title: 'Recámaras',
        description: 'Espacios de descanso con elegancia',
        cta: 'Ver Colección'
      }
    },
    process: {
      title: ['Artesanía', 'Mexicana', 'Auténtica'],
      paragraph1: 'Cada mueble de Davidsons Design nace de la pasión y dedicación de maestros artesanos mexicanos que han perfeccionado su oficio a lo largo de generaciones.',
      paragraph2: 'Seleccionamos cuidadosamente maderas nobles y materiales sostenibles, transformándolos en piezas únicas que cuentan una historia y perduran en el tiempo.',
      paragraph3: 'Nuestro compromiso es preservar las técnicas tradicionales mientras exploramos nuevas formas de diseño contemporáneo.',
      stats: {
        years: 'Años de Experiencia',
        handmade: 'Hecho a Mano',
        pieces: 'Piezas Creadas'
      }
    },
    testimonials: {
      title: 'Lo Que Dicen Nuestros Clientes',
      testimonial1: {
        text: 'La calidad y atención al detalle son excepcionales. Cada pieza es verdaderamente una obra de arte que transforma nuestro hogar.',
        name: 'María Fernández',
        location: 'Ciudad de México'
      },
      testimonial2: {
        text: 'Invertir en muebles Davidsons fue la mejor decisión. Son piezas atemporales que valoraremos por generaciones.',
        name: 'Carlos Jiménez',
        location: 'Monterrey'
      },
      testimonial3: {
        text: 'El servicio personalizado y la artesanía son incomparables. Cada detalle refleja pasión y dedicación.',
        name: 'Ana Martínez',
        location: 'Guadalajara'
      }
    },
    cta: {
      title: 'Crea Tu Espacio Ideal',
      description: 'Agenda una consulta personalizada con nuestros diseñadores y descubre cómo podemos transformar tu hogar.',
      button: 'Agendar Consulta'
    },
    footer: {
      description: 'Una herencia sin nombre que hoy encuentra forma.\nArtesanía consciente, diseño sobrio y madera trabajada con precisión.\nPiezas de autor creadas desde la tradición, pensadas para el tiempo.',
      navigation: 'Navegación',
      catalog: 'Catálogo',
      contactTitle: 'Contacto',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones',
      cookies: 'Política de Cookies',
      poweredBy: 'Powered by RockStage'
    }
  },
  en: {
    nav: {
      products: 'Products',
      about: 'About',
      contact: 'Contact'
    },
    hero: {
      title: ['Premium', 'Handcrafted', 'Furniture'],
      description: 'Each piece is handcrafted by Mexican artisans, combining traditional techniques with contemporary design to create unique and timeless furniture.',
      cta: 'Explore Collection'
    },
    collections: {
      title: 'Our Collections',
      subtitle: 'Discover unique pieces designed to transform your space',
      chairs: {
        title: 'Chairs & Armchairs',
        description: 'Ergonomic designs with artisan character',
        cta: 'View Collection'
      },
      tables: {
        title: 'Dining Tables',
        description: 'The gathering center of your home',
        cta: 'View Collection'
      },
      bedrooms: {
        title: 'Bedrooms',
        description: 'Rest spaces with elegance',
        cta: 'View Collection'
      }
    },
    process: {
      title: ['Authentic', 'Mexican', 'Craftsmanship'],
      paragraph1: 'Every piece of Davidsons Design furniture is born from the passion and dedication of Mexican master artisans who have perfected their craft over generations.',
      paragraph2: 'We carefully select noble woods and sustainable materials, transforming them into unique pieces that tell a story and endure over time.',
      paragraph3: 'Our commitment is to preserve traditional techniques while exploring new forms of contemporary design.',
      stats: {
        years: 'Years of Experience',
        handmade: 'Handmade',
        pieces: 'Pieces Created'
      }
    },
    testimonials: {
      title: 'What Our Customers Say',
      testimonial1: {
        text: 'The quality and attention to detail are exceptional. Each piece is truly a work of art that transforms our home.',
        name: 'María Fernández',
        location: 'Mexico City'
      },
      testimonial2: {
        text: 'Investing in Davidsons furniture was the best decision. They are timeless pieces that we will value for generations.',
        name: 'Carlos Jiménez',
        location: 'Monterrey'
      },
      testimonial3: {
        text: 'The personalized service and craftsmanship are incomparable. Every detail reflects passion and dedication.',
        name: 'Ana Martínez',
        location: 'Guadalajara'
      }
    },
    cta: {
      title: 'Create Your Ideal Space',
      description: 'Schedule a personalized consultation with our designers and discover how we can transform your home.',
      button: 'Schedule Consultation'
    },
    footer: {
      description: 'A nameless heritage that finds form today.\nConscious craftsmanship, sober design and precisely worked wood.\nAuthor pieces created from tradition, designed for time.',
      navigation: 'Navigation',
      catalog: 'Catalog',
      contactTitle: 'Contact',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions',
      cookies: 'Cookie Policy',
      poweredBy: 'Powered by RockStage'
    }
  }
};

export function LandingPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateCatalog,
  onNavigateTerms,
  onNavigatePrivacy,
  onNavigateCookies,
  onNavigateLogin,
  onNavigateCart,
  onNavigateDashboard,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateAddresses,
  onLogout,
  cartItemsCount,
  isAuthenticated,
  userName
}: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0806]' : 'bg-white'}`}>
      {/* Header Principal */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#0a0806]/95 border-[#3d2f23] text-[#f5f0e8]' 
          : 'bg-white/95 border-gray-200 text-gray-900'
      } ${isScrolled ? 'opacity-0 pointer-events-none -translate-y-4' : 'opacity-100'}`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-lg md:text-xl lg:text-2xl tracking-tight">
              <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
            </h1>
          </div>
          
          {/* Desktop - Menu Button */}
          <div className="hidden lg:block">
            <button
              onClick={toggleMobileMenu}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile - Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Simplificado (Scroll) - Desktop only */}
      <div className={`hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`backdrop-blur-sm border rounded-full px-6 py-2.5 shadow-lg ${
          isDarkMode 
            ? 'bg-[#0a0806]/95 border-[#3d2f23] text-[#f5f0e8]' 
            : 'bg-white/95 border-gray-200 text-gray-900'
        }`}>
          <nav className="flex items-center gap-4">
            {/* Logo */}
            <a href="#" className="hover:opacity-80 transition-opacity tracking-tight whitespace-nowrap">
              <span className="font-bold text-sm">DavidSon´s</span><span className="font-normal text-sm"> Design</span>
            </a>
            
            {/* Divisor */}
            <div className={`w-px h-5 ${isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'}`}></div>
            
            {/* Controls Group */}
            <div className="flex items-center gap-2 relative">
              {/* Cart Icon with Count */}
              <button
                onClick={onNavigateCart}
                className={`flex items-center gap-2 p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="Shopping cart"
              >
                {cartItemsCount && cartItemsCount > 0 && (
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-[#f5f0e8]' : 'text-gray-900'
                  }`}>
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="w-4 h-4" />
              </button>

              {/* User Icon */}
              <button
                onClick={isAuthenticated ? onNavigateDashboard : onNavigateLogin}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="User account"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Menu Dropdown */}
              <button
                onClick={toggleMobileMenu}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="Toggle menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Header Sticky Mobile - Estilo píldora como desktop */}
      <div className={`lg:hidden fixed top-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`backdrop-blur-sm border rounded-full shadow-lg ${
          isDarkMode 
            ? 'bg-[#0a0806]/95 border-[#3d2f23] text-[#f5f0e8]' 
            : 'bg-white/95 border-gray-200 text-gray-900'
        }`}>
          <nav className="flex items-center justify-between w-full gap-1 px-3 md:px-4 py-1.5 md:py-2">
            {/* Logo - más compacto */}
            <a href="#" className="flex items-center hover:opacity-80 transition-opacity tracking-tight whitespace-nowrap">
              <span className="font-bold text-[10px] md:text-xs">DavidSon´s</span>
              <span className="font-normal text-[10px] md:text-xs ml-0.5">Design</span>
            </a>
            
            {/* Controls Group - Más horizontal */}
            <div className="flex items-center gap-1 md:gap-1.5">
              {/* Cart Icon with Count */}
              <button
                onClick={onNavigateCart}
                className={`flex items-center gap-1 md:gap-1.5 p-1.5 md:p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="Shopping cart"
              >
                {cartItemsCount && cartItemsCount > 0 && (
                  <span className={`text-[10px] md:text-xs font-medium ${
                    isDarkMode ? 'text-[#f5f0e8]' : 'text-gray-900'
                  }`}>
                    {cartItemsCount}
                  </span>
                )}
                <ShoppingCart className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </button>

              {/* User Icon */}
              <button
                onClick={isAuthenticated ? onNavigateDashboard : onNavigateLogin}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="User account"
              >
                <User className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </button>
            
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className={`p-1.5 md:p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                }`}
                aria-label="Toggle menu"
              >
                <Menu className="w-3.5 md:w-4 h-3.5 md:h-4" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Menu Panel Lateral - Visible en todas las resoluciones */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop con blur */}
        <div 
          className={`absolute inset-0 backdrop-blur-md ${
            isDarkMode ? 'bg-[#0a0806]/80' : 'bg-white/80'
          }`}
          onClick={toggleMobileMenu}
        ></div>
        
        {/* Menu Panel deslizante desde la derecha */}
        <div 
          className={`absolute right-0 top-0 bottom-0 w-full sm:w-96 border-l shadow-2xl transition-transform duration-500 ease-out ${
            isDarkMode 
              ? 'bg-[#0a0806] border-[#3d2f23] text-[#f5f0e8]' 
              : 'bg-white border-gray-200 text-gray-900'
          } ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className={`px-6 md:px-8 py-6 flex items-center justify-between border-b ${
            isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
          }`}>
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-lg md:text-xl tracking-tight">
                <span className="font-bold">DavidSon´s</span> <span className="font-normal">Design</span>
              </h1>
            </div>
            
            {/* Close Button animado */}
            <button
              onClick={toggleMobileMenu}
              className="relative w-8 h-8 flex items-center justify-center group"
              aria-label="Close menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className={`absolute w-6 h-0.5 rotate-45 transition-all duration-300 ${
                  isDarkMode ? 'bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]' : 'bg-gray-600 group-hover:bg-gray-900'
                }`}></span>
                <span className={`absolute w-6 h-0.5 -rotate-45 transition-all duration-300 ${
                  isDarkMode ? 'bg-[#f5f0e8]/70 group-hover:bg-[#f5f0e8]' : 'bg-gray-600 group-hover:bg-gray-900'
                }`}></span>
              </div>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="flex flex-col px-6 md:px-8 pt-8 pb-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Navegación Principal */}
            <div className="mb-8">
              <h3 className={`text-xs uppercase tracking-wider mb-4 ${
                isDarkMode ? 'text-[#b8a99a]/60' : 'text-gray-500'
              }`}>
                {language === 'es' ? 'Navegación' : 'Navigation'}
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    onNavigateCatalog();
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '100ms' : '0ms' }}
                >
                  <span className="text-lg">{t.nav.products}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <a 
                  href="#about"
                  onClick={toggleMobileMenu}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '150ms' : '0ms' }}
                >
                  <span className="text-lg">{t.nav.about}</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
                <a 
                  href="#contact"
                  onClick={toggleMobileMenu}
                  className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '200ms' : '0ms' }}
                >
                  <span className="text-lg">{t.nav.contact}</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Mi Cuenta Section (Solo si está autenticado) */}
            {isAuthenticated && (
              <div className="mb-8">
                <h3 className={`text-xs uppercase tracking-wider mb-4 ${
                  isDarkMode ? 'text-[#b8a99a]/60' : 'text-gray-500'
                }`}>
                  {language === 'es' ? 'Mi Cuenta' : 'My Account'}
                </h3>
                <div className="space-y-1">
                  {userName && (
                    <div className={`p-4 rounded-lg mb-2 transition-all duration-300 ${
                      isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                      style={{ transitionDelay: isMobileMenuOpen ? '250ms' : '0ms' }}
                    >
                      <p className={`text-sm ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {language === 'es' ? 'Hola,' : 'Hello,'}
                      </p>
                      <p className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {userName}
                      </p>
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      onNavigateDashboard?.();
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                        : 'text-gray-900 hover:bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: isMobileMenuOpen ? '300ms' : '0ms' }}
                  >
                    <User className="w-5 h-5" />
                    <span className="flex-1 text-left">{language === 'es' ? 'Panel de Control' : 'Dashboard'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      onNavigateOrders?.();
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                        : 'text-gray-900 hover:bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: isMobileMenuOpen ? '350ms' : '0ms' }}
                  >
                    <Package className="w-5 h-5" />
                    <span className="flex-1 text-left">{language === 'es' ? 'Mis Pedidos' : 'My Orders'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      onNavigateWishlist?.();
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                        : 'text-gray-900 hover:bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: isMobileMenuOpen ? '400ms' : '0ms' }}
                  >
                    <Heart className="w-5 h-5" />
                    <span className="flex-1 text-left">{language === 'es' ? 'Lista de Deseos' : 'Wishlist'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      onNavigateAddresses?.();
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                        : 'text-gray-900 hover:bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: isMobileMenuOpen ? '450ms' : '0ms' }}
                  >
                    <MapPin className="w-5 h-5" />
                    <span className="flex-1 text-left">{language === 'es' ? 'Direcciones' : 'Addresses'}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      onLogout?.();
                      toggleMobileMenu();
                    }}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-[#2d2419]' 
                        : 'text-red-600 hover:bg-gray-100'
                    } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                    style={{ transitionDelay: isMobileMenuOpen ? '500ms' : '0ms' }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="flex-1 text-left">{language === 'es' ? 'Cerrar Sesión' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Login Button (Solo si NO está autenticado) */}
            {!isAuthenticated && (
              <div className="mb-8">
                <button 
                  onClick={() => {
                    onNavigateLogin?.();
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-[#8b6f47] text-white hover:opacity-90' 
                      : 'bg-[#3d2f23] text-white hover:opacity-90'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '250ms' : '0ms' }}
                >
                  <User className="w-5 h-5" />
                  <span className="flex-1 text-left">{language === 'es' ? 'Iniciar Sesión' : 'Sign In'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Configuración */}
            <div className="mb-8">
              <h3 className={`text-xs uppercase tracking-wider mb-4 ${
                isDarkMode ? 'text-[#b8a99a]/60' : 'text-gray-500'
              }`}>
                {language === 'es' ? 'Configuración' : 'Settings'}
              </h3>
              <div className="space-y-1">
                {/* Language Toggle */}
                <button 
                  onClick={onToggleLanguage}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '550ms' : '0ms' }}
                >
                  <Globe className="w-5 h-5" />
                  <span className="flex-1 text-left">{language === 'es' ? 'Idioma' : 'Language'}</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {language === 'es' ? 'ES' : 'EN'}
                  </span>
                </button>

                {/* Theme Toggle */}
                <button 
                  onClick={onToggleDarkMode}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '600ms' : '0ms' }}
                >
                  {isDarkMode ? (
                    <>
                      <Moon className="w-5 h-5" />
                      <span className="flex-1 text-left">{language === 'es' ? 'Modo Oscuro' : 'Dark Mode'}</span>
                      <div className="flex items-center gap-2">
                        <div className="relative w-11 h-6 rounded-full bg-[#8b6f47]">
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" />
                      <span className="flex-1 text-left">{language === 'es' ? 'Modo Claro' : 'Light Mode'}</span>
                      <div className="flex items-center gap-2">
                        <div className="relative w-11 h-6 rounded-full bg-gray-300">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform"></div>
                        </div>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Legal */}
            <div className="mb-4">
              <h3 className={`text-xs uppercase tracking-wider mb-4 ${
                isDarkMode ? 'text-[#b8a99a]/60' : 'text-gray-500'
              }`}>
                {language === 'es' ? 'Legal' : 'Legal'}
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    onNavigatePrivacy();
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '650ms' : '0ms' }}
                >
                  <Shield className="w-5 h-5" />
                  <span className="flex-1 text-left text-sm">{t.footer.privacy}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    onNavigateTerms();
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '700ms' : '0ms' }}
                >
                  <FileText className="w-5 h-5" />
                  <span className="flex-1 text-left text-sm">{t.footer.terms}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    onNavigateCookies();
                    toggleMobileMenu();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    isDarkMode 
                      ? 'text-[#f5f0e8] hover:bg-[#2d2419]' 
                      : 'text-gray-900 hover:bg-gray-100'
                  } ${isMobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                  style={{ transitionDelay: isMobileMenuOpen ? '750ms' : '0ms' }}
                >
                  <Cookie className="w-5 h-5" />
                  <span className="flex-1 text-left text-sm">{t.footer.cookies}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-20 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-20 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4 md:space-y-6">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t.hero.title.map((line, index) => (
                    <motion.span 
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                      className="block"
                    >
                      {line}
                    </motion.span>
                  ))}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className={`text-base md:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}
                >
                  {t.hero.description}
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNavigateCatalog}
                className={`px-6 md:px-8 py-3 md:py-4 transition-opacity tracking-wide ${
                  isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                }`}
              >
                {t.hero.cta}
              </motion.button>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative aspect-square md:aspect-[4/3] lg:aspect-square"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
                  alt="Mueble artesanal premium"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className={`py-12 md:py-16 lg:py-20 border-t ${
        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <AnimatedSection className="text-center mb-10 md:mb-12 lg:mb-16">
            <h2 className={`text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.collections.title}
            </h2>
            <p className={`text-base md:text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.collections.subtitle}
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Chairs Collection */}
            <motion.div variants={staggerItem} className="group cursor-pointer" onClick={onNavigateCatalog}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80"
                  alt="Sillas artesanales"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <h3 className={`text-xl md:text-2xl mb-2 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t.collections.chairs.title}
              </h3>
              <p className={`text-sm md:text-base mb-3 md:mb-4 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.collections.chairs.description}
              </p>
              <span className={`text-sm tracking-wide transition-colors ${
                isDarkMode ? 'text-[#8b6f47] group-hover:text-white' : 'text-[#3d2f23] group-hover:text-[#8b6f47]'
              }`}>
                {t.collections.chairs.cta} →
              </span>
            </motion.div>

            {/* Tables Collection */}
            <motion.div variants={staggerItem} className="group cursor-pointer" onClick={onNavigateCatalog}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1617098900591-3f90928e8c54?w=600&q=80"
                  alt="Mesas de comedor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <h3 className={`text-xl md:text-2xl mb-2 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t.collections.tables.title}
              </h3>
              <p className={`text-sm md:text-base mb-3 md:mb-4 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.collections.tables.description}
              </p>
              <span className={`text-sm tracking-wide transition-colors ${
                isDarkMode ? 'text-[#8b6f47] group-hover:text-white' : 'text-[#3d2f23] group-hover:text-[#8b6f47]'
              }`}>
                {t.collections.tables.cta} →
              </span>
            </motion.div>

            {/* Bedrooms Collection */}
            <motion.div variants={staggerItem} className="group cursor-pointer" onClick={onNavigateCatalog}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] overflow-hidden mb-4 md:mb-6"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80"
                  alt="Recámaras elegantes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
              <h3 className={`text-xl md:text-2xl mb-2 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t.collections.bedrooms.title}
              </h3>
              <p className={`text-sm md:text-base mb-3 md:mb-4 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.collections.bedrooms.description}
              </p>
              <span className={`text-sm tracking-wide transition-colors ${
                isDarkMode ? 'text-[#8b6f47] group-hover:text-white' : 'text-[#3d2f23] group-hover:text-[#8b6f47]'
              }`}>
                {t.collections.bedrooms.cta} →
              </span>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* Process Section */}
      <section id="about" className={`py-12 md:py-16 lg:py-20 border-t ${
        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Left Image */}
            <AnimatedSection direction="left" className="relative aspect-[4/3]">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=800&q=80"
                  alt="Artesano trabajando"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatedSection>

            {/* Right Content */}
            <AnimatedSection direction="right" delay={0.2} className="flex flex-col justify-center space-y-6 md:space-y-8">
              <h2 className={`text-2xl md:text-3xl lg:text-4xl tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t.process.title.map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < t.process.title.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <div className="space-y-4 md:space-y-6">
                <p className={`text-sm md:text-base ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.process.paragraph1}
                </p>
                <p className={`text-sm md:text-base ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.process.paragraph2}
                </p>
                <p className={`text-sm md:text-base ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.process.paragraph3}
                </p>
              </div>

              {/* Stats */}
              <StaggerContainer className="grid grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6">
                <motion.div variants={staggerItem}>
                  <motion.div 
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className={`text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    28+
                  </motion.div>
                  <div className={`text-xs md:text-sm ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {t.process.stats.years}
                  </div>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <motion.div 
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className={`text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    100%
                  </motion.div>
                  <div className={`text-xs md:text-sm ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {t.process.stats.handmade}
                  </div>
                </motion.div>
                <motion.div variants={staggerItem}>
                  <motion.div 
                    initial={{ scale: 1 }}
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    viewport={{ once: true }}
                    className={`text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    5000+
                  </motion.div>
                  <div className={`text-xs md:text-sm ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {t.process.stats.pieces}
                  </div>
                </motion.div>
              </StaggerContainer>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-12 md:py-16 lg:py-20 border-t ${
        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <AnimatedSection className="text-center mb-10 md:mb-12 lg:mb-16">
            <h2 className={`text-2xl md:text-3xl lg:text-4xl tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.testimonials.title}
            </h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className={`p-6 md:p-8 border ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`text-sm md:text-base mb-4 md:mb-6 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                "{t.testimonials.testimonial1.text}"
              </p>
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.testimonials.testimonial1.name}
                </p>
                <p className={`text-xs md:text-sm ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.testimonials.testimonial1.location}
                </p>
              </div>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className={`p-6 md:p-8 border ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`text-sm md:text-base mb-4 md:mb-6 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                "{t.testimonials.testimonial2.text}"
              </p>
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.testimonials.testimonial2.name}
                </p>
                <p className={`text-xs md:text-sm ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.testimonials.testimonial2.location}
                </p>
              </div>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div 
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className={`p-6 md:p-8 border ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <p className={`text-sm md:text-base mb-4 md:mb-6 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                "{t.testimonials.testimonial3.text}"
              </p>
              <div>
                <p className={`font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.testimonials.testimonial3.name}
                </p>
                <p className={`text-xs md:text-sm ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.testimonials.testimonial3.location}
                </p>
              </div>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-12 md:py-16 lg:py-20 border-t ${
        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <AnimatedSection>
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className={`p-8 md:p-12 lg:p-16 text-center ${
                isDarkMode ? 'bg-[#1a1512]' : 'bg-gray-50'
              }`}
            >
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {t.cta.title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className={`text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}
              >
                {t.cta.description}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                className={`px-6 md:px-8 py-3 md:py-4 transition-opacity tracking-wide ${
                  isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                }`}
              >
                {t.cta.button}
              </motion.button>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={`border-t ${
        isDarkMode ? 'bg-[#0a0806] border-[#3d2f23]' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          
          {/* Main Footer Content */}
          <div className="py-16 md:py-20 lg:py-24 space-y-16 md:space-y-20">
            
            {/* CONTENEDOR 1: Logo + Descripción (Centrado) */}
            <div className="text-center space-y-6">
              <h4 className={`text-4xl md:text-5xl lg:text-6xl tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <span className="font-bold">DavidSon´s</span>{' '}
                <span className="font-normal">Design</span>
              </h4>
              <p className={`text-base md:text-lg leading-relaxed max-w-3xl mx-auto ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.footer.description}
              </p>
            </div>

            {/* CONTENEDOR 2: 3 Columnas (Navegación, Contacto, Redes) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
              
              {/* Columna 1: Navegación */}
              <div className="text-center md:text-left">
                <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.footer.navigation}
                </h5>
                <nav className="flex flex-col items-center md:items-start gap-3.5">

                  <button
                    onClick={onNavigateCatalog}
                    className={`text-base transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.footer.catalog}
                  </button>
                  <a
                    href="#about"
                    className={`text-base transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.nav.about}
                  </a>
                  <a
                    href="#contact"
                    className={`text-base transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.nav.contact}
                  </a>
                </nav>
              </div>

              {/* Columna 2: Contacto */}
              <div className="text-center md:text-left">
                <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.footer.contactTitle}
                </h5>
                <div className="flex flex-col items-center md:items-start gap-3.5">
                  <a 
                    href="mailto:soporte@davidsonsdesign.com" 
                    className={`text-base transition-colors ${
                      isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    soporte@davidsonsdesign.com
                  </a>
                  <p className={`text-base ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {t.footer.location}
                  </p>
                </div>
              </div>

              {/* Columna 3: Redes Sociales */}
              <div className="text-center md:text-left">
                <h5 className={`text-sm tracking-widest uppercase mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {language === 'es' ? 'Síguenos' : 'Follow Us'}
                </h5>
                <div className="flex flex-wrap justify-center md:justify-start gap-2.5">
                  <a href="https://facebook.com/davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                  <a href="https://x.com/davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="X"><Twitter className="w-5 h-5" /></a>
                  <a href="https://instagram.com/davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                  <a href="https://youtube.com/@davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="YouTube"><Youtube className="w-5 h-5" /></a>
                  <a href="https://tiktok.com/@davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="TikTok">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                  </a>
                  <a href="https://pinterest.com/davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="Pinterest">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
                  </a>
                  <a href="https://linkedin.com/company/davidsonsdesign" target="_blank" rel="noopener noreferrer"
                    className={`p-2.5 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-[#2d2419] hover:bg-[#8b6f47] text-[#b8a99a] hover:text-white' : 'bg-gray-100 hover:bg-[#8b6f47] text-gray-600 hover:text-white'}`}
                    aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
                </div>
              </div>
            </div>
          </div>

        {/* Bottom Bar */}
        <div className={`py-8 border-t ${
          isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
        }`}>
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Copyright */}
            <p className={`text-sm order-2 lg:order-1 ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.footer.copyright}
            </p>

            {/* Center: Legal + Theme Toggle */}
            <div className="flex items-center gap-6 order-1 lg:order-2">
              <button
                onClick={onNavigatePrivacy}
                className={`text-sm transition-colors ${
                  isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.footer.privacy}
              </button>
              
              <span className={`w-1 h-1 rounded-full ${
                isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-300'
              }`}></span>
              
              <button
                onClick={onNavigateTerms}
                className={`text-sm transition-colors ${
                  isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.footer.terms}
              </button>

              <span className={`w-1 h-1 rounded-full ${
                isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-300'
              }`}></span>

              <button
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-[#2d2419] border-[#3d2f23] hover:border-[#8b6f47]' 
                    : 'bg-gray-50 border-gray-300 hover:border-[#8b6f47]'
                }`}
                aria-label="Toggle theme"
              >
                <Sun className={`w-3.5 h-3.5 transition-all ${isDarkMode ? 'opacity-40' : 'opacity-100'}`} />
                <div className={`relative w-9 h-4 rounded-full ${isDarkMode ? 'bg-[#1a1512]' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-[#8b6f47] transition-all duration-300 ${isDarkMode ? 'left-5' : 'left-0.5'}`}></div>
                </div>
                <Moon className={`w-3.5 h-3.5 transition-all ${isDarkMode ? 'opacity-100' : 'opacity-40'}`} />
              </button>
            </div>

            {/* Powered by */}
            <p className={`text-xs order-3 ${
              isDarkMode ? 'text-[#b8a99a]/60' : 'text-gray-500'
            }`}>
              Powered by <span className="font-medium text-[#8b6f47]">RockStage</span>
            </p>
          </div>
        </div>
      </div>
      </footer>
    </div>
  );
}