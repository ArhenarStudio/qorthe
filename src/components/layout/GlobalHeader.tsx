"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, ShoppingCart, User, 
  Sun,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { AuthModal } from '@/components/auth/AuthModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { NavigationOverlay } from '@/components/layout/NavigationOverlay';
import { DesktopMenu } from '@/components/layout/DesktopMenu';
import { GlobalSearchOverlay } from '@/components/search/GlobalSearchOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useCartContext } from '@/contexts/CartContext';

const logoDSD = '/images/logo-dsd.png';

const CONTENT = {
  topbar: {
    shipping: "Envíos Internacionales",
    customization: "Personalización Láser Incluida",
    warranty: "Garantía de por vida"
  },
  nav: {
    collections: "Colecciones",
    products: "Tablas de Autor",
    restaurants: "Restaurantes",
    about: "La Marca",
    menu: "Menú",
    guest: "Invitado",
    login_cta: "Iniciar sesión o registrarse",
    orders: "Mis Pedidos",
    favorites: "Favoritos",
    blog: "Blog & Noticias",
    gallery: "Galería de Proyectos",
    appointment: "Agendar Cita",
    financing: "Financiamiento",
    help: "Ayuda & FAQ",
    theme_light: "Claro",
    copyright: "© 2026 DavidSon's Design"
  }
};

export const GlobalHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const { itemCount, isDrawerOpen: isCartOpen, openDrawer: openCart, closeDrawer: closeCart } = useCartContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return null;
      case '/cart': return 'Tu Compra';
      case '/shop': return 'Catálogo';
      case '/account': return 'Mi Cuenta';
      case '/contact': return 'Contacto';
      case '/legal-notice': return 'Aviso Legal';
      case '/terms': return 'Términos y Condiciones';
      case '/sales-conditions': return 'Condiciones de Venta';
      case '/shipping-policy': return 'Envíos';
      case '/returns-policy': return 'Devoluciones';
      case '/warranty-policy': return 'Garantía';
      case '/privacy-policy': return 'Privacidad';
      case '/cookies-policy': return 'Cookies';
      case '/intellectual-property': return 'Propiedad Intelectual';
      case '/dispute-resolution': return 'Resolución de Disputas';
      default: 
        if (path?.startsWith('/shop/')) return 'Detalle de Producto';
        return null;
    }
  };

  const pageTitle = getPageTitle(pathname ?? '/');
  
  const [msgIndex, setMsgIndex] = useState(0);
  const TOPBAR_MESSAGES = [
    CONTENT.topbar.shipping,
    CONTENT.topbar.customization,
    CONTENT.topbar.warranty,
    "Usa el código DAVIDSON10 para 10% OFF"
  ];

  const isAuthenticated = !!user;
  const cartItemsCount = itemCount;
  
  const onNavigateHome = () => router.push('/');
  
  const onNavigateCart = () => {
    openCart();
    setIsMobileMenuOpen(false);
  };

  const onNavigateDashboard = () => router.push('/account');
  
  const onNavigateLogin = () => {
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
    setIsDesktopMenuOpen(false); 
  };
  
  const handleMenuToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsDesktopMenuOpen(!isDesktopMenuOpen);
    } else {
      setIsMobileMenuOpen(true);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % TOPBAR_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [TOPBAR_MESSAGES.length]);

  useEffect(() => {
    const handleOpenCart = () => openCart();
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: CONTENT.nav.collections, href: '#collections' },
    { name: CONTENT.nav.products, href: '#products' },
    { name: CONTENT.nav.restaurants, href: '#services' },
    { name: CONTENT.nav.about, href: '#about' },
  ];

  return (
    <>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <GlobalSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />

      <div 
        className={clsx(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ease-in-out",
          scrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
      >
        <div className="bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 text-[10px] md:text-xs py-2.5 px-4 text-center tracking-widest uppercase font-medium h-10 flex items-center justify-center overflow-hidden relative transition-colors duration-300">
          <AnimatePresence mode="wait">
            <motion.span
              key={msgIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="absolute w-full px-4"
            >
              {TOPBAR_MESSAGES[msgIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <header className="bg-sand-100/90 dark:bg-wood-900/90 backdrop-blur-md border-b border-wood-900/5 dark:border-sand-100/5 relative transition-colors duration-300">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between relative">
            
            <div className="flex-1 flex items-center justify-start">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-wood-900 dark:text-sand-100 hover:bg-wood-900/5 dark:hover:bg-sand-100/10 rounded-full transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>

              <button 
                onClick={handleMenuToggle}
                className="hidden md:flex group items-center gap-2 text-wood-900 dark:text-sand-100 hover:text-wood-700 dark:hover:text-sand-300 transition-colors"
              >
                <span className="text-sm font-medium tracking-widest uppercase border-b border-transparent group-hover:border-wood-900 dark:group-hover:border-sand-100 transition-all">
                  {isDesktopMenuOpen ? "Cerrar" : CONTENT.nav.menu}
                </span>
              </button>

              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 ml-8 px-4 py-1.5 bg-wood-900/5 dark:bg-sand-100/5 hover:bg-wood-900/10 dark:hover:bg-sand-100/10 rounded-full transition-all group"
              >
                <Search className="w-3.5 h-3.5 text-wood-900/50 dark:text-sand-100/50 group-hover:text-wood-900 dark:group-hover:text-sand-100 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-wood-900/50 dark:text-sand-100/50 group-hover:text-wood-900 dark:group-hover:text-sand-100 transition-colors">
                  Buscar
                </span>
              </button>
            </div>
            
            <div className={clsx(
              "absolute left-1/2 bottom-0 -translate-x-1/2 z-20 transition-all duration-500 ease-in-out",
              isDesktopMenuOpen ? "translate-y-0 opacity-0 pointer-events-none scale-95" : "translate-y-[46%] opacity-100 scale-100"
            )}>
               <button 
                 onClick={onNavigateHome} 
                 className="relative block focus:outline-none group"
                 aria-label="Ir al inicio"
               >
                 <div className="relative w-[76px] md:w-[106px] lg:w-[137px] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1">
                   <img 
                      src={logoDSD} 
                      alt="DavidSon's Design Seal" 
                      className="w-full h-auto drop-shadow-[0_4px_6px_rgba(45,36,25,0.4)] hover:drop-shadow-[0_8px_12px_rgba(45,36,25,0.5)] transition-all duration-500"
                   />
                 </div>
               </button>
            </div>
            
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
              <button onClick={isAuthenticated ? onNavigateDashboard : onNavigateLogin} className="p-2 hover:bg-wood-900/5 dark:hover:bg-sand-100/10 rounded-full transition-colors group">
                <User className="w-5 h-5 text-wood-900 dark:text-sand-100 group-hover:scale-110 transition-transform" />
              </button>
              
              <button onClick={onNavigateCart} className="relative p-2 hover:bg-wood-900/5 dark:hover:bg-sand-100/10 rounded-full transition-colors group">
                <ShoppingCart className="w-5 h-5 text-wood-900 dark:text-sand-100 group-hover:scale-110 transition-transform" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 text-[10px] flex items-center justify-center rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      </div>

      <div 
        className={clsx(
          "fixed top-6 left-0 right-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ease-out",
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
        )}
      >
        <div className="pointer-events-auto bg-sand-100/90 dark:bg-wood-900/90 backdrop-blur-xl border border-wood-900/10 dark:border-sand-100/10 rounded-full shadow-2xl shadow-wood-900/10 dark:shadow-black/20 px-4 py-2 flex items-center justify-center mx-auto transition-all">
          
          <div className="flex md:hidden items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <Menu className="w-5 h-5" />
             </button>
             
             <div className="w-px h-4 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={() => setIsSearchOpen(true)} className="p-1 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <Search className="w-5 h-5" />
             </button>

             <div className="w-px h-4 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={onNavigateHome} className="shrink-0 mx-1">
                <img src={logoDSD} alt="DavidSon's" className="h-8 w-auto" />
             </button>

             <div className="w-px h-4 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={isAuthenticated ? onNavigateDashboard : onNavigateLogin} className="p-1 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <User className="w-5 h-5" />
             </button>

             <div className="w-px h-4 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={onNavigateCart} className="p-1 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors relative">
               <ShoppingCart className="w-5 h-5" />
               {cartItemsCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 text-[9px] flex items-center justify-center rounded-full font-bold">
                   {cartItemsCount}
                 </span>
               )}
             </button>
          </div>

          <div className="hidden md:flex items-center gap-4 px-2">
             <button onClick={handleMenuToggle} className="p-1.5 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <Menu className="w-5 h-5" />
             </button>
             
             <div className="w-px h-5 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={() => setIsSearchOpen(true)} className="p-1.5 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <Search className="w-5 h-5" />
             </button>

             <div className="w-px h-5 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={onNavigateHome} className="shrink-0 mx-2 hover:opacity-80 transition-opacity">
                <img src={logoDSD} alt="DavidSon's" className="h-10 w-auto" />
             </button>

             <div className="w-px h-5 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={isAuthenticated ? onNavigateDashboard : onNavigateLogin} className="p-1.5 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors">
               <User className="w-5 h-5" />
             </button>

             <div className="w-px h-5 bg-wood-900/15 dark:bg-sand-100/15"></div>

             <button onClick={onNavigateCart} className="p-1.5 text-wood-900 dark:text-sand-100 hover:text-wood-600 dark:hover:text-sand-300 transition-colors relative">
               <ShoppingCart className="w-5 h-5" />
               {cartItemsCount > 0 && (
                 <span className="absolute -top-1 -right-1 w-4 h-4 bg-wood-900 text-sand-100 dark:bg-sand-100 dark:text-wood-900 text-[10px] flex items-center justify-center rounded-full font-bold">
                   {cartItemsCount}
                 </span>
               )}
             </button>
          </div>
        </div>

        <AnimatePresence>
          {pageTitle && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-2 pointer-events-auto"
            >
              <div className="px-3 py-1 bg-white/60 dark:bg-wood-950/60 backdrop-blur-md rounded-full border border-wood-100 dark:border-wood-800 shadow-sm flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-wood-500 dark:text-sand-400 font-serif">
                  {pageTitle}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DesktopMenu 
        isOpen={isDesktopMenuOpen} 
        onClose={() => setIsDesktopMenuOpen(false)} 
      />

      <NavigationOverlay 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        logo={logoDSD}
        isAuthenticated={isAuthenticated}
        onLogin={onNavigateLogin}
        content={CONTENT.nav}
        navLinks={navLinks}
      />
    </>
  );
};
