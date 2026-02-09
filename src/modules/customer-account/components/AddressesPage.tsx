'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { User, Package, MapPin, Heart, Settings, LogOut, Plus, Edit, Trash2, Check } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressesPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateDashboard: () => void;
  onNavigateOrders: () => void;
  onNavigateWishlist: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  addresses: Address[];
  onAddAddress: () => void;
  onEditAddress: (addressId: string) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefaultAddress: (addressId: string) => void;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    title: 'Mis Direcciones',
    sidebar: {
      myProfile: 'Mi Perfil',
      myOrders: 'Mis Pedidos',
      addresses: 'Direcciones',
      favorites: 'Favoritos',
      settings: 'Configuración',
      logout: 'Cerrar Sesión'
    },
    addAddress: 'Agregar Dirección',
    defaultAddress: 'Dirección Principal',
    setAsDefault: 'Establecer como Principal',
    edit: 'Editar',
    delete: 'Eliminar',
    empty: {
      title: 'No tienes direcciones guardadas',
      description: 'Agrega una dirección para acelerar el proceso de compra',
      button: 'Agregar Primera Dirección'
    },
    deleteConfirm: {
      title: '¿Eliminar dirección?',
      message: 'Esta acción no se puede deshacer',
      cancel: 'Cancelar',
      confirm: 'Eliminar'
    },
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
    title: 'My Addresses',
    sidebar: {
      myProfile: 'My Profile',
      myOrders: 'My Orders',
      addresses: 'Addresses',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout'
    },
    addAddress: 'Add Address',
    defaultAddress: 'Default Address',
    setAsDefault: 'Set as Default',
    edit: 'Edit',
    delete: 'Delete',
    empty: {
      title: 'No saved addresses',
      description: 'Add an address to speed up the checkout process',
      button: 'Add First Address'
    },
    deleteConfirm: {
      title: 'Delete address?',
      message: 'This action cannot be undone',
      cancel: 'Cancel',
      confirm: 'Delete'
    },
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

export function AddressesPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateDashboard,
  onNavigateOrders,
  onNavigateWishlist,
  onLogout,
  userName,
  userEmail,
  addresses,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress
}: AddressesPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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

  const handleDeleteClick = (addressId: string) => {
    setDeleteConfirmId(addressId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteAddress(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const menuItems = [
    { id: 'profile', label: t.sidebar.myProfile, icon: User, onClick: onNavigateDashboard },
    { id: 'orders', label: t.sidebar.myOrders, icon: Package, onClick: onNavigateOrders },
    { id: 'addresses', label: t.sidebar.addresses, icon: MapPin, onClick: () => {} },
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
                        item.id === 'addresses'
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
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h1 className={`text-3xl md:text-4xl tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.title}
                </h1>
                <button
                  onClick={onAddAddress}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 transition-opacity ${
                    isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">{t.addAddress}</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
                    isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`w-12 h-12 ${
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
                    onClick={onAddAddress}
                    className={`px-8 py-3.5 transition-opacity tracking-wide ${
                      isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                    }`}
                  >
                    {t.empty.button}
                  </button>
                </div>
              ) : (
                // Addresses Grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border p-6 relative ${
                        address.isDefault
                          ? isDarkMode 
                            ? 'border-[#8b6f47] bg-[#1a1512]' 
                            : 'border-[#8b6f47] bg-white'
                          : isDarkMode 
                            ? 'border-[#3d2f23] bg-[#1a1512]' 
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      {/* Default Badge */}
                      {address.isDefault && (
                        <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#8b6f47] text-white'
                        }`}>
                          <Check className="w-3 h-3" />
                          {t.defaultAddress}
                        </div>
                      )}

                      {/* Address Details */}
                      <div className="mb-6 pr-24">
                        <h3 className={`text-lg mb-3 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {address.name}
                        </h3>
                        <div className={`text-sm space-y-1 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state}</p>
                          <p>{address.zipCode}</p>
                          <p className="pt-2">{address.phone}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {!address.isDefault && (
                          <button
                            onClick={() => onSetDefaultAddress(address.id)}
                            className={`flex-1 px-4 py-2 border text-sm transition-colors ${
                              isDarkMode 
                                ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white' 
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {t.setAsDefault}
                          </button>
                        )}
                        <button
                          onClick={() => onEditAddress(address.id)}
                          className={`px-4 py-2 border text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white' 
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(address.id)}
                          className={`px-4 py-2 border text-sm transition-colors ${
                            isDarkMode 
                              ? 'border-[#3d2f23] text-[#b8a99a] hover:border-red-900/50 hover:text-red-400' 
                              : 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          ></div>
          <div className={`relative max-w-md w-full p-6 ${
            isDarkMode ? 'bg-[#1a1512] border border-[#3d2f23]' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-xl mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.deleteConfirm.title}
            </h3>
            <p className={`text-sm mb-6 ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.deleteConfirm.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`flex-1 px-4 py-2.5 border transition-colors ${
                  isDarkMode 
                    ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47]' 
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {t.deleteConfirm.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`flex-1 px-4 py-2.5 transition-opacity ${
                  isDarkMode ? 'bg-red-900 text-red-200 hover:opacity-90' : 'bg-red-600 text-white hover:opacity-90'
                }`}
              >
                {t.deleteConfirm.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        translations={t}
      />
    </div>
  );
}
