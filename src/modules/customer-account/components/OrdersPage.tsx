'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { User, Package, MapPin, Heart, Settings, LogOut, Truck } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface OrderProduct {
  id: string;
  name: string;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  products: OrderProduct[];
}

interface OrdersPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateDashboard: () => void;
  onNavigateAddresses: () => void;
  onNavigateWishlist: () => void;
  onNavigateOrderDetail: (orderId: string) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  orders: Order[];
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    title: 'Mis Pedidos',
    sidebar: {
      myProfile: 'Mi Perfil',
      myOrders: 'Mis Pedidos',
      addresses: 'Direcciones',
      favorites: 'Favoritos',
      settings: 'Configuración',
      logout: 'Cerrar Sesión'
    },
    filters: {
      all: 'Todos',
      processing: 'En Proceso',
      shipped: 'Enviados',
      delivered: 'Completados',
      cancelled: 'Cancelados'
    },
    empty: {
      title: 'No tienes pedidos aún',
      description: 'Cuando realices tu primera compra, aparecerá aquí',
      button: 'Explorar Productos'
    },
    order: 'Pedido',
    date: 'Fecha',
    viewDetails: 'Ver Detalles',
    track: 'Rastrear',
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
    title: 'My Orders',
    sidebar: {
      myProfile: 'My Profile',
      myOrders: 'My Orders',
      addresses: 'Addresses',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout'
    },
    filters: {
      all: 'All',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Completed',
      cancelled: 'Cancelled'
    },
    empty: {
      title: 'No orders yet',
      description: 'When you make your first purchase, it will appear here',
      button: 'Explore Products'
    },
    order: 'Order',
    date: 'Date',
    viewDetails: 'View Details',
    track: 'Track',
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

export function OrdersPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateDashboard,
  onNavigateAddresses,
  onNavigateWishlist,
  onNavigateOrderDetail,
  onLogout,
  userName,
  userEmail,
  orders
}: OrdersPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

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

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800';
      case 'delivered':
        return isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
      case 'cancelled':
        return isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  const menuItems = [
    { id: 'profile', label: t.sidebar.myProfile, icon: User, onClick: onNavigateDashboard },
    { id: 'orders', label: t.sidebar.myOrders, icon: Package, onClick: () => {} },
    { id: 'addresses', label: t.sidebar.addresses, icon: MapPin, onClick: onNavigateAddresses },
    { id: 'favorites', label: t.sidebar.favorites, icon: Heart, onClick: onNavigateWishlist },
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
                        item.id === 'orders'
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

              {/* Filters */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded whitespace-nowrap transition-colors text-sm ${
                      activeFilter === filter
                        ? isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#3d2f23] text-white'
                        : isDarkMode 
                          ? 'bg-[#1a1512] border border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47]' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {t.filters[filter]}
                  </button>
                ))}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                    isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-100'
                  }`}>
                    <Package className={`w-12 h-12 ${
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
                // Orders Grid
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`border p-6 transition-colors ${
                        isDarkMode 
                          ? 'bg-[#1a1512] border-[#3d2f23] hover:border-[#8b6f47]' 
                          : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                          }`}>
                            <Package className={`w-6 h-6 ${
                              isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                            }`} />
                          </div>
                          <div>
                            <div className={`mb-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {t.order} #{order.id}
                            </div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                            }`}>
                              {order.date}
                            </div>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm w-fit ${
                          getStatusColor(order.status)
                        }`}>
                          {t.filters[order.status]}
                        </span>
                      </div>

                      {/* Product Thumbnails */}
                      <div className="flex items-center gap-3 mb-6">
                        {order.products.slice(0, 4).map((product, index) => (
                          <div
                            key={product.id}
                            className="w-16 h-16 flex-shrink-0 overflow-hidden"
                            style={{ zIndex: order.products.length - index }}
                          >
                            <ImageWithFallback
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.products.length > 4 && (
                          <div className={`w-16 h-16 flex items-center justify-center text-sm ${
                            isDarkMode ? 'bg-[#2d2419] text-[#b8a99a]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{order.products.length - 4}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className={`text-xl ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${order.total.toLocaleString('es-MX')} MXN
                        </div>
                        <div className="flex gap-3">
                          {order.status === 'shipped' && (
                            <button
                              className={`px-4 py-2 border text-sm transition-colors ${
                                isDarkMode 
                                  ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white' 
                                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              <Truck className="w-4 h-4 inline mr-2" />
                              {t.track}
                            </button>
                          )}
                          <button
                            onClick={() => onNavigateOrderDetail(order.id)}
                            className={`px-4 py-2 transition-opacity ${
                              isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                            }`}
                          >
                            {t.viewDetails}
                          </button>
                        </div>
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
        translations={t}
      />
    </div>
  );
}
