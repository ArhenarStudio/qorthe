/**
 * Backup V1 - 2026-02-09. Componente activo en components/WishlistPage.tsx
 */
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { User, Package, MapPin, Heart, Settings, LogOut, ShoppingCart, X } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  available: boolean;
  category: string;
}

interface WishlistPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateDashboard: () => void;
  onNavigateOrders: () => void;
  onNavigateAddresses: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  wishlistProducts: WishlistProduct[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    title: 'Mis Favoritos',
    sidebar: {
      myProfile: 'Mi Perfil',
      myOrders: 'Mis Pedidos',
      addresses: 'Direcciones',
      favorites: 'Favoritos',
      settings: 'Configuración',
      logout: 'Cerrar Sesión'
    },
    empty: {
      title: 'No tienes favoritos aún',
      description: 'Guarda tus productos favoritos aquí para encontrarlos fácilmente más tarde',
      button: 'Explorar Productos'
    },
    addToCart: 'Agregar al Carrito',
    remove: 'Eliminar',
    available: 'Disponible',
    outOfStock: 'Agotado',
    footer: {
      description: 'Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.',
      navigation: 'Navegación',
      catalog: 'Catálogo',
      contactTitle: 'Contacto',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. Todos los derechos reservados.',
      privacy: 'Política de Privacidad',
      terms: 'Términos y Condiciones'
    }
  },
  en: {
    nav: {
      products: 'Products',
      about: 'About',
      contact: 'Contact',
    },
    title: 'My Favorites',
    sidebar: {
      myProfile: 'My Profile',
      myOrders: 'My Orders',
      addresses: 'Addresses',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout'
    },
    empty: {
      title: 'No favorites yet',
      description: 'Save your favorite products here to easily find them later',
      button: 'Explore Products'
    },
    addToCart: 'Add to Cart',
    remove: 'Remove',
    available: 'Available',
    outOfStock: 'Out of Stock',
    footer: {
      description: 'Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.',
      navigation: 'Navigation',
      catalog: 'Catalog',
      contactTitle: 'Contact',
      location: 'Hermosillo, Sonora.',
      copyright: '© 2026 Davidsons Design. All rights reserved.',
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions'
    }
  }
};

export function WishlistPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateDashboard,
  onNavigateOrders,
  onNavigateAddresses,
  onLogout,
  userName,
  userEmail,
  wishlistProducts,
  onRemoveFromWishlist,
  onAddToCart
}: WishlistPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const menuItems = [
    { id: 'profile', label: t.sidebar.myProfile, icon: User, onClick: onNavigateDashboard },
    { id: 'orders', label: t.sidebar.myOrders, icon: Package, onClick: onNavigateOrders },
    { id: 'addresses', label: t.sidebar.addresses, icon: MapPin, onClick: onNavigateAddresses },
    { id: 'favorites', label: t.sidebar.favorites, icon: Heart, onClick: () => {} },
    { id: 'settings', label: t.sidebar.settings, icon: Settings, onClick: () => {} },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0806]' : 'bg-white'}`}>
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
        onNavigateCart={() => (window.location.href = '/cart')}
        onNavigateAccount={() => (window.location.href = '/login')}
        translations={t}
      />

      <div className="pt-28 md:pt-32 lg:pt-40 pb-12 md:pb-16 lg:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className={`border p-6 sticky top-32 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-gray-50 border-gray-200'
              }`}>
                {/* User Info */}
                <div className={`flex items-center gap-4 mb-8 pb-8 border-b ${
                  isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]' : 'bg-[#d4c4b0]'
                  }`}>
                    <User className={`w-8 h-8 ${isDarkMode ? 'text-white' : 'text-[#3d2f23]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg truncate ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {userName}
                    </h2>
                    <p className={`text-sm truncate ${
                      isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                    }`}>
                      {userEmail}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                        item.id === 'favorites'
                          ? isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#3d2f23] text-white'
                          : isDarkMode ? 'hover:bg-[#2d2419] text-[#b8a99a]' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-red-900/20 text-[#b8a99a] hover:text-red-400' : 'hover:bg-red-50 text-gray-700 hover:text-red-600'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">{t.sidebar.logout}</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-9">
              {/* Header */}
              <div className="mb-8 md:mb-10">
                <h1 className={`text-3xl md:text-4xl tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.title}
                </h1>
              </div>

              {wishlistProducts.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                    isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-100'
                  }`}>
                    <Heart className={`w-12 h-12 ${
                      isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                    }`} />
                  </div>
                  <h2 className={`text-2xl md:text-3xl mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.empty.title}
                  </h2>
                  <p className={`text-base md:text-lg mb-8 max-w-md ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {t.empty.description}
                  </p>
                  <button
                    onClick={onNavigateProducts}
                    className={`px-8 py-3.5 transition-opacity tracking-wide ${
                      isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                    }`}
                  >
                    {t.empty.button}
                  </button>
                </div>
              ) : (
                // Products Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border group relative ${
                        isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveFromWishlist(product.id)}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
                          isDarkMode 
                            ? 'bg-[#0a0806]/80 hover:bg-[#0a0806] text-[#b8a99a] hover:text-red-400' 
                            : 'bg-white/80 hover:bg-white text-gray-600 hover:text-red-600'
                        }`}
                        aria-label={t.remove}
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden relative">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Availability Badge */}
                        {!product.available && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className={`px-4 py-2 rounded text-sm ${
                              isDarkMode ? 'bg-red-900/90 text-red-200' : 'bg-red-600 text-white'
                            }`}>
                              {t.outOfStock}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <div className={`text-xs mb-2 ${
                          isDarkMode ? 'text-[#b8a99a]/70' : 'text-gray-500'
                        }`}>
                          {product.category}
                        </div>
                        <h3 className={`text-base md:text-lg mb-2 line-clamp-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                        <p className={`text-lg md:text-xl mb-4 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          ${product.price.toLocaleString('es-MX')} MXN
                        </p>

                        {/* Availability Status */}
                        {product.available && (
                          <div className="flex items-center gap-2 mb-4">
                            <div className={`w-2 h-2 rounded-full ${
                              isDarkMode ? 'bg-green-400' : 'bg-green-500'
                            }`}></div>
                            <span className={`text-sm ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {t.available}
                            </span>
                          </div>
                        )}

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => onAddToCart(product.id)}
                          disabled={!product.available}
                          className={`w-full px-4 py-3 flex items-center justify-center gap-2 transition-opacity ${
                            product.available
                              ? isDarkMode 
                                ? 'bg-[#8b6f47] text-white hover:opacity-90' 
                                : 'bg-[#3d2f23] text-white hover:opacity-90'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {t.addToCart}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
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
