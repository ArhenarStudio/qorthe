'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { MapPin, ShoppingBag, ChevronRight, Plus, Edit } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

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

interface CheckoutPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateCart: () => void;
  onNavigatePayment: () => void;
  onAddAddress: () => void;
  onEditAddress: (addressId: string) => void;
  cartItems: CartItem[];
  savedAddresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    title: 'Checkout',
    steps: {
      shipping: 'Envío',
      payment: 'Pago',
      confirmation: 'Confirmación'
    },
    shippingAddress: {
      title: 'Dirección de Envío',
      selectAddress: 'Seleccionar Dirección',
      addNew: 'Agregar Nueva Dirección',
      edit: 'Editar',
      default: 'Principal'
    },
    shippingMethod: {
      title: 'Método de Envío',
      free: 'Envío Gratis',
      freeDesc: '5-7 días hábiles',
      standard: 'Envío Estándar',
      standardDesc: '3-5 días hábiles',
      express: 'Envío Express',
      expressDesc: '1-2 días hábiles'
    },
    orderSummary: {
      title: 'Resumen del Pedido',
      items: 'artículos',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      total: 'Total'
    },
    continueToPayment: 'Continuar al Pago',
    backToCart: '← Volver al Carrito',
    selectAddressError: 'Selecciona una dirección de envío',
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
    title: 'Checkout',
    steps: {
      shipping: 'Shipping',
      payment: 'Payment',
      confirmation: 'Confirmation'
    },
    shippingAddress: {
      title: 'Shipping Address',
      selectAddress: 'Select Address',
      addNew: 'Add New Address',
      edit: 'Edit',
      default: 'Default'
    },
    shippingMethod: {
      title: 'Shipping Method',
      free: 'Free Shipping',
      freeDesc: '5-7 business days',
      standard: 'Standard Shipping',
      standardDesc: '3-5 business days',
      express: 'Express Shipping',
      expressDesc: '1-2 business days'
    },
    orderSummary: {
      title: 'Order Summary',
      items: 'items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total'
    },
    continueToPayment: 'Continue to Payment',
    backToCart: '← Back to Cart',
    selectAddressError: 'Please select a shipping address',
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

export function CheckoutPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateCart,
  onNavigatePayment,
  onAddAddress,
  onEditAddress,
  cartItems,
  savedAddresses,
  selectedAddressId,
  onSelectAddress
}: CheckoutPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'free' | 'standard' | 'express'>('free');
  const [error, setError] = useState('');

  const t = translations[language];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethod === 'free' ? 0 : shippingMethod === 'standard' ? 299 : 599;
  const total = subtotal + shippingCost;

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

  const handleContinueToPayment = () => {
    if (!selectedAddressId) {
      setError(t.selectAddressError);
      return;
    }
    onNavigatePayment();
  };

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
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8 md:mb-10">
            <h1 className={`text-3xl md:text-4xl lg:text-5xl mb-4 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.title}
            </h1>
            <button
              onClick={onNavigateCart}
              className={`text-sm md:text-base transition-colors ${
                isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.backToCart}
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-4">
              {/* Step 1 - Shipping */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#3d2f23] text-white'
                }`}>
                  1
                </div>
                <span className={`hidden sm:inline ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.steps.shipping}
                </span>
              </div>

              <ChevronRight className={`w-5 h-5 ${
                isDarkMode ? 'text-[#3d2f23]' : 'text-gray-300'
              }`} />

              {/* Step 2 - Payment */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-[#2d2419] text-[#b8a99a]' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`hidden sm:inline ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.steps.payment}
                </span>
              </div>

              <ChevronRight className={`w-5 h-5 ${
                isDarkMode ? 'text-[#3d2f23]' : 'text-gray-300'
              }`} />

              {/* Step 3 - Confirmation */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-[#2d2419] text-[#b8a99a]' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className={`hidden sm:inline ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.steps.confirmation}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                  }`}>
                    <MapPin className={`w-5 h-5 ${
                      isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                    }`} />
                  </div>
                  <h2 className={`text-xl md:text-2xl tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.shippingAddress.title}
                  </h2>
                </div>

                {savedAddresses.length === 0 ? (
                  <button
                    onClick={onAddAddress}
                    className={`w-full p-6 border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                      isDarkMode 
                        ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white' 
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    {t.shippingAddress.addNew}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block p-4 border cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? isDarkMode 
                              ? 'border-[#8b6f47] bg-[#2d2419]' 
                              : 'border-[#8b6f47] bg-[#f5f1ed]'
                            : isDarkMode 
                              ? 'border-[#3d2f23] hover:border-[#8b6f47]' 
                              : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="radio"
                            name="address"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => {
                              onSelectAddress(address.id);
                              setError('');
                            }}
                            className="w-5 h-5 mt-1 accent-[#8b6f47] cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {address.name}
                              </h3>
                              {address.isDefault && (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#8b6f47] text-white'
                                }`}>
                                  {t.shippingAddress.default}
                                </span>
                              )}
                            </div>
                            <div className={`text-sm space-y-0.5 ${
                              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                            }`}>
                              <p>{address.street}</p>
                              <p>{address.city}, {address.state} {address.zipCode}</p>
                              <p>{address.phone}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              onEditAddress(address.id);
                            }}
                            className={`p-2 rounded transition-colors ${
                              isDarkMode ? 'hover:bg-[#2d2419]' : 'hover:bg-gray-100'
                            }`}
                          >
                            <Edit className={`w-4 h-4 ${
                              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                            }`} />
                          </button>
                        </div>
                      </label>
                    ))}

                    <button
                      onClick={onAddAddress}
                      className={`w-full p-4 border flex items-center justify-center gap-2 transition-colors ${
                        isDarkMode 
                          ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      {t.shippingAddress.addNew}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-sm text-red-500">{error}</p>
                )}
              </div>

              {/* Shipping Method */}
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                  }`}>
                    <ShoppingBag className={`w-5 h-5 ${
                      isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                    }`} />
                  </div>
                  <h2 className={`text-xl md:text-2xl tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.shippingMethod.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                    shippingMethod === 'free'
                      ? isDarkMode 
                        ? 'border-[#8b6f47] bg-[#2d2419]' 
                        : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode 
                        ? 'border-[#3d2f23] hover:border-[#8b6f47]' 
                        : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="shipping"
                        value="free"
                        checked={shippingMethod === 'free'}
                        onChange={() => setShippingMethod('free')}
                        className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                      />
                      <div>
                        <div className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {t.shippingMethod.free}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.shippingMethod.freeDesc}
                        </div>
                      </div>
                    </div>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      Gratis
                    </span>
                  </label>

                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                    shippingMethod === 'standard'
                      ? isDarkMode 
                        ? 'border-[#8b6f47] bg-[#2d2419]' 
                        : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode 
                        ? 'border-[#3d2f23] hover:border-[#8b6f47]' 
                        : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                      />
                      <div>
                        <div className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {t.shippingMethod.standard}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.shippingMethod.standardDesc}
                        </div>
                      </div>
                    </div>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      $299 MXN
                    </span>
                  </label>

                  <label className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                    shippingMethod === 'express'
                      ? isDarkMode 
                        ? 'border-[#8b6f47] bg-[#2d2419]' 
                        : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode 
                        ? 'border-[#3d2f23] hover:border-[#8b6f47]' 
                        : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                      />
                      <div>
                        <div className={`${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {t.shippingMethod.express}
                        </div>
                        <div className={`text-sm ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.shippingMethod.expressDesc}
                        </div>
                      </div>
                    </div>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      $599 MXN
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className={`sticky top-32 border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl md:text-2xl mb-6 tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.orderSummary.title}
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm mb-1 line-clamp-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h4>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          ${item.price.toLocaleString('es-MX')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                    }`}>
                      +{cartItems.length - 3} {t.orderSummary.items}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className={`space-y-3 pt-6 border-t ${
                  isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.orderSummary.subtotal}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${subtotal.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.orderSummary.shipping}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-MX')} MXN`}
                    </span>
                  </div>
                  <div className={`flex justify-between pt-3 border-t text-lg ${
                    isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                  }`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.orderSummary.total}
                    </span>
                    <span className={`text-xl ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${total.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinueToPayment}
                  className={`w-full mt-6 px-6 py-3.5 transition-opacity tracking-wide ${
                    isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                  }`}
                >
                  {t.continueToPayment}
                </button>
              </div>
            </div>
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
