/**
 * Backup V1 - 2026-02-09. Componente activo en components/OrderDetailPage.tsx
 */
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle, Clock } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface OrderProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface TrackingStep {
  status: string;
  date: string;
  description: string;
  completed: boolean;
}

interface OrderDetail {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  products: OrderProduct[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  tracking: TrackingStep[];
}

interface OrderDetailPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateOrders: () => void;
  orderDetail: OrderDetail;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    backToOrders: 'Volver a Pedidos',
    orderTitle: 'Pedido',
    orderDate: 'Fecha del Pedido',
    orderStatus: {
      processing: 'En Proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    },
    sections: {
      products: 'Productos',
      shipping: 'Dirección de Envío',
      payment: 'Método de Pago',
      tracking: 'Seguimiento'
    },
    quantity: 'Cantidad',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    total: 'Total',
    trackingSteps: {
      'order-placed': 'Pedido Realizado',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'in-transit': 'En Tránsito',
      'delivered': 'Entregado'
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
    backToOrders: 'Back to Orders',
    orderTitle: 'Order',
    orderDate: 'Order Date',
    orderStatus: {
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    },
    sections: {
      products: 'Products',
      shipping: 'Shipping Address',
      payment: 'Payment Method',
      tracking: 'Tracking'
    },
    quantity: 'Quantity',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    trackingSteps: {
      'order-placed': 'Order Placed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'in-transit': 'In Transit',
      'delivered': 'Delivered'
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

export function OrderDetailPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateOrders,
  orderDetail
}: OrderDetailPageProps) {
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
          {/* Back Button */}
          <button
            onClick={onNavigateOrders}
            className={`flex items-center gap-2 mb-6 transition-colors ${
              isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backToOrders}
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-10">
            <div>
              <h1 className={`text-3xl md:text-4xl mb-2 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {t.orderTitle} #{orderDetail.id}
              </h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.orderDate}: {orderDetail.date}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full w-fit ${
              getStatusColor(orderDetail.status)
            }`}>
              {t.orderStatus[orderDetail.status]}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Products Section */}
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl md:text-2xl mb-6 tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.sections.products}
                </h2>
                <div className="space-y-6">
                  {orderDetail.products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex gap-4 pb-6 border-b last:border-b-0 ${
                        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base md:text-lg mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.name}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.quantity}: {product.quantity}
                        </p>
                        <p className={`text-base md:text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${product.price.toLocaleString('es-MX')} MXN
                        </p>
                      </div>
                      <div className={`text-lg md:text-xl ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${(product.price * product.quantity).toLocaleString('es-MX')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className={`mt-8 pt-6 border-t space-y-3 ${
                  isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.subtotal}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${orderDetail.subtotal.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.shipping}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${orderDetail.shipping.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className={`flex justify-between pt-3 border-t text-lg md:text-xl ${
                    isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                  }`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.total}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${orderDetail.total.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Tracking Section */}
              {orderDetail.status !== 'cancelled' && (
                <div className={`border p-6 md:p-8 ${
                  isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
                }`}>
                  <h2 className={`text-xl md:text-2xl mb-6 tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.sections.tracking}
                  </h2>
                  <div className="space-y-6">
                    {orderDetail.tracking.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                              : isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-100'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className={`w-6 h-6 ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`} />
                            ) : (
                              <Clock className={`w-6 h-6 ${
                                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
                              }`} />
                            )}
                          </div>
                          {index < orderDetail.tracking.length - 1 && (
                            <div className={`w-0.5 h-12 ${
                              step.completed
                                ? isDarkMode ? 'bg-green-400/30' : 'bg-green-200'
                                : isDarkMode ? 'bg-[#3d2f23]' : 'bg-gray-200'
                            }`}></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <h3 className={`text-base md:text-lg mb-1 ${
                            step.completed
                              ? isDarkMode ? 'text-white' : 'text-gray-900'
                              : isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                          }`}>
                            {t.trackingSteps[step.status as keyof typeof t.trackingSteps] || step.status}
                          </h3>
                          <p className={`text-sm mb-1 ${
                            isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                          }`}>
                            {step.description}
                          </p>
                          {step.completed && (
                            <p className={`text-xs ${
                              isDarkMode ? 'text-[#b8a99a]/70' : 'text-gray-500'
                            }`}>
                              {step.date}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Shipping & Payment */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className={`border p-6 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                  }`}>
                    <MapPin className={`w-5 h-5 ${
                      isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                    }`} />
                  </div>
                  <h2 className={`text-lg tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.sections.shipping}
                  </h2>
                </div>
                <div className={`text-sm space-y-1 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {orderDetail.shippingAddress.name}
                  </p>
                  <p>{orderDetail.shippingAddress.street}</p>
                  <p>
                    {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state}
                  </p>
                  <p>{orderDetail.shippingAddress.zipCode}</p>
                  <p className="pt-2">{orderDetail.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className={`border p-6 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                    }`} />
                  </div>
                  <h2 className={`text-lg tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.sections.payment}
                  </h2>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {orderDetail.paymentMethod}
                </p>
              </div>

              {/* Shipping Info */}
              {orderDetail.status === 'shipped' && (
                <div className={`border p-6 ${
                  isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                    }`}>
                      <Truck className={`w-5 h-5 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <h2 className={`text-lg tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      En Camino
                    </h2>
                  </div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                  }`}>
                    {language === 'es' 
                      ? 'Tu pedido está en camino y llegará pronto.'
                      : 'Your order is on its way and will arrive soon.'}
                  </p>
                </div>
              )}
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
