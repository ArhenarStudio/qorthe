'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { CheckCircle, Package, Mail, Download, ArrowRight, MapPin, CreditCard } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface OrderConfirmationPageProps {
  language: 'es' | 'en';
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateOrders: () => void;
  onNavigateOrderDetail: (orderId: string) => void;
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  estimatedDelivery: string;
  userEmail: string;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    success: {
      title: '¡Pedido Confirmado!',
      subtitle: 'Gracias por tu compra',
      message: 'Hemos recibido tu pedido y lo estamos procesando. Te enviaremos un correo de confirmación a'
    },
    orderInfo: {
      orderNumber: 'Número de Pedido',
      orderDate: 'Fecha del Pedido',
      estimatedDelivery: 'Entrega Estimada'
    },
    sections: {
      orderDetails: 'Detalles del Pedido',
      shippingAddress: 'Dirección de Envío',
      paymentMethod: 'Método de Pago',
      orderSummary: 'Resumen del Pedido'
    },
    items: 'artículos',
    quantity: 'Cant.',
    subtotal: 'Subtotal',
    shipping: 'Envío',
    total: 'Total',
    actions: {
      viewOrder: 'Ver Detalles del Pedido',
      downloadInvoice: 'Descargar Factura',
      continueShopping: 'Continuar Comprando',
      viewAllOrders: 'Ver Todos mis Pedidos'
    },
    nextSteps: {
      title: 'Próximos Pasos',
      step1: {
        title: 'Confirmación por Email',
        description: 'Recibirás un correo con los detalles de tu pedido'
      },
      step2: {
        title: 'Preparación',
        description: 'Prepararemos tu pedido con cuidado'
      },
      step3: {
        title: 'Envío',
        description: 'Te notificaremos cuando tu pedido sea enviado con el número de rastreo'
      }
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
    success: {
      title: 'Order Confirmed!',
      subtitle: 'Thank you for your purchase',
      message: 'We have received your order and are processing it. We will send you a confirmation email to'
    },
    orderInfo: {
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      estimatedDelivery: 'Estimated Delivery'
    },
    sections: {
      orderDetails: 'Order Details',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary'
    },
    items: 'items',
    quantity: 'Qty.',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    actions: {
      viewOrder: 'View Order Details',
      downloadInvoice: 'Download Invoice',
      continueShopping: 'Continue Shopping',
      viewAllOrders: 'View All Orders'
    },
    nextSteps: {
      title: 'Next Steps',
      step1: {
        title: 'Email Confirmation',
        description: 'You will receive an email with your order details'
      },
      step2: {
        title: 'Preparation',
        description: 'We will carefully prepare your order'
      },
      step3: {
        title: 'Shipping',
        description: 'We will notify you when your order is shipped with tracking number'
      }
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

export function OrderConfirmationPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateOrders,
  onNavigateOrderDetail,
  orderId,
  orderDate,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
  paymentMethod,
  estimatedDelivery,
  userEmail
}: OrderConfirmationPageProps) {
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
          {/* Success Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-12 h-12 md:w-14 md:h-14 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <h1 className={`text-3xl md:text-4xl lg:text-5xl mb-3 tracking-tight ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {t.success.title}
            </h1>
            <p className={`text-lg md:text-xl mb-4 ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.success.subtitle}
            </p>
            <p className={`text-sm md:text-base max-w-2xl mx-auto ${
              isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
            }`}>
              {t.success.message} <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{userEmail}</span>
            </p>
          </div>

          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-12">
            <div className={`border p-6 text-center ${
              isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
            }`}>
              <div className={`text-sm mb-2 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.orderInfo.orderNumber}
              </div>
              <div className={`text-xl md:text-2xl ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                #{orderId}
              </div>
            </div>

            <div className={`border p-6 text-center ${
              isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
            }`}>
              <div className={`text-sm mb-2 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.orderInfo.orderDate}
              </div>
              <div className={`text-xl md:text-2xl ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {orderDate}
              </div>
            </div>

            <div className={`border p-6 text-center ${
              isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
            }`}>
              <div className={`text-sm mb-2 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
              }`}>
                {t.orderInfo.estimatedDelivery}
              </div>
              <div className={`text-xl md:text-2xl ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {estimatedDelivery}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl md:text-2xl mb-6 tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.sections.orderDetails}
                </h2>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-4 pb-6 border-b last:border-b-0 ${
                        isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                      }`}
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-base md:text-lg mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.quantity}: {item.quantity}
                        </p>
                        <p className={`text-base md:text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${item.price.toLocaleString('es-MX')} MXN
                        </p>
                      </div>
                      <div className={`text-lg md:text-xl ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${(item.price * item.quantity).toLocaleString('es-MX')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className={`mt-6 pt-6 border-t space-y-3 ${
                  isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.subtotal}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${subtotal.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                      {t.shipping}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')} MXN`}
                    </span>
                  </div>
                  <div className={`flex justify-between pt-3 border-t text-lg md:text-xl ${
                    isDarkMode ? 'border-[#3d2f23]' : 'border-gray-200'
                  }`}>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.total}
                    </span>
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      ${total.toLocaleString('es-MX')} MXN
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <h2 className={`text-xl md:text-2xl mb-6 tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {t.nextSteps.title}
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                    }`}>
                      <Mail className={`w-5 h-5 ${
                        isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {t.nextSteps.step1.title}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {t.nextSteps.step1.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {t.nextSteps.step2.title}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {t.nextSteps.step2.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                    }`}>
                      <ArrowRight className={`w-5 h-5 ${
                        isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {t.nextSteps.step3.title}
                      </h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {t.nextSteps.step3.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Shipping & Actions */}
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
                    {t.sections.shippingAddress}
                  </h2>
                </div>
                <div className={`text-sm space-y-1 ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {shippingAddress.name}
                  </p>
                  <p>{shippingAddress.street}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state}</p>
                  <p>{shippingAddress.zipCode}</p>
                  <p className="pt-2">{shippingAddress.phone}</p>
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
                    {t.sections.paymentMethod}
                  </h2>
                </div>
                <p className={`text-sm ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {paymentMethod}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => onNavigateOrderDetail(orderId)}
                  className={`w-full px-6 py-3 transition-opacity ${
                    isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                  }`}
                >
                  {t.actions.viewOrder}
                </button>

                <button
                  className={`w-full px-6 py-3 border flex items-center justify-center gap-2 transition-colors ${
                    isDarkMode 
                      ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47]' 
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  {t.actions.downloadInvoice}
                </button>

                <button
                  onClick={onNavigateProducts}
                  className={`w-full px-6 py-3 border transition-colors ${
                    isDarkMode 
                      ? 'border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47]' 
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {t.actions.continueShopping}
                </button>

                <button
                  onClick={onNavigateOrders}
                  className={`w-full text-center text-sm transition-colors ${
                    isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.actions.viewAllOrders} →
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
