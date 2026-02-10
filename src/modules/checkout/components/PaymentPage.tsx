'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/modules/app-state';
import { Header } from '@/modules/header';
import { Footer } from '@/modules/footer';
import { CreditCard, Wallet, Building2, ChevronRight, Lock, Loader } from 'lucide-react';
import { ImageWithFallback } from '@/components/shared/ImageWithFallback';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface PaymentPageProps {
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateCheckout: () => void;
  onPlaceOrder: (paymentData: any) => Promise<void>;
  cartItems: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

const translations = {
  es: {
    nav: {
      products: 'Productos',
      about: 'About',
      contact: 'Contact',
    },
    title: 'Pago',
    steps: {
      shipping: 'Envío',
      payment: 'Pago',
      confirmation: 'Confirmación'
    },
    paymentMethod: {
      title: 'Método de Pago',
      card: 'Tarjeta de Crédito/Débito',
      paypal: 'PayPal',
      transfer: 'Transferencia Bancaria'
    },
    cardForm: {
      cardNumber: 'Número de Tarjeta',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      cardholderName: 'Nombre del Titular',
      cardholderNamePlaceholder: 'Juan Pérez',
      expiryDate: 'Fecha de Vencimiento',
      expiryDatePlaceholder: 'MM/AA',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      saveCard: 'Guardar tarjeta para futuras compras'
    },
    paypalInfo: {
      message: 'Serás redirigido a PayPal para completar tu pago de forma segura.',
      redirect: 'Continuar con PayPal'
    },
    transferInfo: {
      title: 'Información de Transferencia',
      bank: 'Banco',
      accountNumber: 'Número de Cuenta',
      clabe: 'CLABE Interbancaria',
      beneficiary: 'Beneficiario',
      reference: 'Referencia',
      instructions: 'Realiza la transferencia y envíanos el comprobante a',
      company: 'Davidsons Design S.A. de C.V.'
    },
    orderSummary: {
      title: 'Resumen del Pedido',
      items: 'artículos',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      total: 'Total'
    },
    placeOrder: 'Realizar Pedido',
    processing: 'Procesando...',
    backToShipping: '← Volver a Envío',
    securePayment: 'Pago seguro con encriptación SSL',
    errors: {
      cardNumberRequired: 'El número de tarjeta es requerido',
      cardNumberInvalid: 'Número de tarjeta inválido',
      cardholderRequired: 'El nombre del titular es requerido',
      expiryRequired: 'La fecha de vencimiento es requerida',
      expiryInvalid: 'Fecha de vencimiento inválida',
      cvvRequired: 'El CVV es requerido',
      cvvInvalid: 'CVV inválido'
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
    title: 'Payment',
    steps: {
      shipping: 'Shipping',
      payment: 'Payment',
      confirmation: 'Confirmation'
    },
    paymentMethod: {
      title: 'Payment Method',
      card: 'Credit/Debit Card',
      paypal: 'PayPal',
      transfer: 'Bank Transfer'
    },
    cardForm: {
      cardNumber: 'Card Number',
      cardNumberPlaceholder: '1234 5678 9012 3456',
      cardholderName: 'Cardholder Name',
      cardholderNamePlaceholder: 'John Doe',
      expiryDate: 'Expiry Date',
      expiryDatePlaceholder: 'MM/YY',
      cvv: 'CVV',
      cvvPlaceholder: '123',
      saveCard: 'Save card for future purchases'
    },
    paypalInfo: {
      message: 'You will be redirected to PayPal to complete your payment securely.',
      redirect: 'Continue with PayPal'
    },
    transferInfo: {
      title: 'Transfer Information',
      bank: 'Bank',
      accountNumber: 'Account Number',
      clabe: 'CLABE',
      beneficiary: 'Beneficiary',
      reference: 'Reference',
      instructions: 'Make the transfer and send us the receipt to',
      company: 'Davidsons Design S.A. de C.V.'
    },
    orderSummary: {
      title: 'Order Summary',
      items: 'items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      total: 'Total'
    },
    placeOrder: 'Place Order',
    processing: 'Processing...',
    backToShipping: '← Back to Shipping',
    securePayment: 'Secure payment with SSL encryption',
    errors: {
      cardNumberRequired: 'Card number is required',
      cardNumberInvalid: 'Invalid card number',
      cardholderRequired: 'Cardholder name is required',
      expiryRequired: 'Expiry date is required',
      expiryInvalid: 'Invalid expiry date',
      cvvRequired: 'CVV is required',
      cvvInvalid: 'Invalid CVV'
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

export function PaymentPage({
  onNavigateHome,
  onNavigateProducts,
  onNavigateCheckout,
  onPlaceOrder,
  cartItems,
  subtotal,
  shipping,
  total
}: PaymentPageProps) {
  const { language, isDarkMode } = useAppState();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCardForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cardNumber) {
      newErrors.cardNumber = t.errors.cardNumberRequired;
    } else if (cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = t.errors.cardNumberInvalid;
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = t.errors.cardholderRequired;
    }

    if (!expiryDate) {
      newErrors.expiryDate = t.errors.expiryRequired;
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = t.errors.expiryInvalid;
    }

    if (!cvv) {
      newErrors.cvv = t.errors.cvvRequired;
    } else if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = t.errors.cvvInvalid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'card' && !validateCardForm()) {
      return;
    }

    setIsProcessing(true);
    try {
      await onPlaceOrder({
        method: paymentMethod,
        cardNumber: paymentMethod === 'card' ? cardNumber : undefined,
        cardholderName: paymentMethod === 'card' ? cardholderName : undefined,
        expiryDate: paymentMethod === 'card' ? expiryDate : undefined,
        cvv: paymentMethod === 'card' ? cvv : undefined,
        saveCard: paymentMethod === 'card' ? saveCard : undefined
      });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0806]' : 'bg-white'}`}>
      <Header />

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
              onClick={onNavigateCheckout}
              className={`text-sm md:text-base transition-colors ${
                isDarkMode ? 'text-[#b8a99a] hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.backToShipping}
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-4">
              {/* Step 1 - Shipping */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  ✓
                </div>
                <span className={`hidden sm:inline ${
                  isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                }`}>
                  {t.steps.shipping}
                </span>
              </div>

              <ChevronRight className={`w-5 h-5 ${
                isDarkMode ? 'text-[#b8a99a]' : 'text-gray-400'
              }`} />

              {/* Step 2 - Payment */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-[#8b6f47] text-white' : 'bg-[#3d2f23] text-white'
                }`}>
                  2
                </div>
                <span className={`hidden sm:inline ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
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
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2">
              <div className={`border p-6 md:p-8 ${
                isDarkMode ? 'bg-[#1a1512] border-[#3d2f23]' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#8b6f47]/20' : 'bg-[#d4c4b0]/30'
                  }`}>
                    <CreditCard className={`w-5 h-5 ${
                      isDarkMode ? 'text-[#8b6f47]' : 'text-[#3d2f23]'
                    }`} />
                  </div>
                  <h2 className={`text-xl md:text-2xl tracking-tight ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t.paymentMethod.title}
                  </h2>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 mb-8">
                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? isDarkMode ? 'border-[#8b6f47] bg-[#2d2419]' : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode ? 'border-[#3d2f23] hover:border-[#8b6f47]' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                    />
                    <CreditCard className={`w-6 h-6 ${isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}`} />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.paymentMethod.card}
                    </span>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'paypal'
                      ? isDarkMode ? 'border-[#8b6f47] bg-[#2d2419]' : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode ? 'border-[#3d2f23] hover:border-[#8b6f47]' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                    />
                    <Wallet className={`w-6 h-6 ${isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}`} />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.paymentMethod.paypal}
                    </span>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'transfer'
                      ? isDarkMode ? 'border-[#8b6f47] bg-[#2d2419]' : 'border-[#8b6f47] bg-[#f5f1ed]'
                      : isDarkMode ? 'border-[#3d2f23] hover:border-[#8b6f47]' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                    />
                    <Building2 className={`w-6 h-6 ${isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}`} />
                    <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {t.paymentMethod.transfer}
                    </span>
                  </label>
                </div>

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-5">
                    <div>
                      <label className={`block text-sm mb-2 ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {t.cardForm.cardNumber}
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          if (formatted.replace(/\s/g, '').length <= 16) {
                            setCardNumber(formatted);
                            if (errors.cardNumber) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.cardNumber;
                                return newErrors;
                              });
                            }
                          }
                        }}
                        placeholder={t.cardForm.cardNumberPlaceholder}
                        maxLength={19}
                        className={`w-full px-4 py-3 border transition-colors ${
                          errors.cardNumber
                            ? 'border-red-500 focus:border-red-500'
                            : isDarkMode 
                              ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                        } focus:outline-none`}
                      />
                      {errors.cardNumber && (
                        <p className="mt-2 text-sm text-red-500">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm mb-2 ${
                        isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                      }`}>
                        {t.cardForm.cardholderName}
                      </label>
                      <input
                        type="text"
                        value={cardholderName}
                        onChange={(e) => {
                          setCardholderName(e.target.value);
                          if (errors.cardholderName) {
                            setErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.cardholderName;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder={t.cardForm.cardholderNamePlaceholder}
                        className={`w-full px-4 py-3 border transition-colors ${
                          errors.cardholderName
                            ? 'border-red-500 focus:border-red-500'
                            : isDarkMode 
                              ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                        } focus:outline-none`}
                      />
                      {errors.cardholderName && (
                        <p className="mt-2 text-sm text-red-500">{errors.cardholderName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className={`block text-sm mb-2 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.cardForm.expiryDate}
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            if (formatted.length <= 5) {
                              setExpiryDate(formatted);
                              if (errors.expiryDate) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.expiryDate;
                                  return newErrors;
                                });
                              }
                            }
                          }}
                          placeholder={t.cardForm.expiryDatePlaceholder}
                          maxLength={5}
                          className={`w-full px-4 py-3 border transition-colors ${
                            errors.expiryDate
                              ? 'border-red-500 focus:border-red-500'
                              : isDarkMode 
                                ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                          } focus:outline-none`}
                        />
                        {errors.expiryDate && (
                          <p className="mt-2 text-sm text-red-500">{errors.expiryDate}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm mb-2 ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.cardForm.cvv}
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setCvv(value);
                              if (errors.cvv) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.cvv;
                                  return newErrors;
                                });
                              }
                            }
                          }}
                          placeholder={t.cardForm.cvvPlaceholder}
                          maxLength={4}
                          className={`w-full px-4 py-3 border transition-colors ${
                            errors.cvv
                              ? 'border-red-500 focus:border-red-500'
                              : isDarkMode 
                                ? 'bg-[#0a0806] border-[#3d2f23] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                          } focus:outline-none`}
                        />
                        {errors.cvv && (
                          <p className="mt-2 text-sm text-red-500">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="w-5 h-5 accent-[#8b6f47] cursor-pointer"
                        />
                        <span className={`text-sm ${
                          isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                        }`}>
                          {t.cardForm.saveCard}
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* PayPal Info */}
                {paymentMethod === 'paypal' && (
                  <div className={`p-6 rounded ${
                    isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-50'
                  }`}>
                    <p className={`mb-4 ${
                      isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                    }`}>
                      {t.paypalInfo.message}
                    </p>
                  </div>
                )}

                {/* Transfer Info */}
                {paymentMethod === 'transfer' && (
                  <div className={`p-6 rounded space-y-4 ${
                    isDarkMode ? 'bg-[#2d2419]' : 'bg-gray-50'
                  }`}>
                    <h3 className={`text-lg mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {t.transferInfo.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                          {t.transferInfo.bank}:
                        </span>
                        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          BBVA México
                        </p>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                          {t.transferInfo.beneficiary}:
                        </span>
                        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {t.transferInfo.company}
                        </p>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                          {t.transferInfo.accountNumber}:
                        </span>
                        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          0123456789
                        </p>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'}>
                          {t.transferInfo.clabe}:
                        </span>
                        <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          012345678901234567
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm pt-4 ${
                      isDarkMode ? 'text-[#b8a99a]' : 'text-gray-600'
                    }`}>
                      {t.transferInfo.instructions} <strong>soporte@davidsonsdesign.com</strong>
                    </p>
                  </div>
                )}

                {/* Secure Payment Notice */}
                <div className={`flex items-center gap-2 mt-6 pt-6 border-t ${
                  isDarkMode ? 'border-[#3d2f23] text-[#b8a99a]' : 'border-gray-200 text-gray-600'
                }`}>
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">{t.securePayment}</span>
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
                      {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')} MXN`}
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

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className={`w-full mt-6 px-6 py-3.5 flex items-center justify-center gap-2 transition-opacity tracking-wide ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    isDarkMode ? 'bg-[#8b6f47] text-white hover:opacity-90' : 'bg-[#3d2f23] text-white hover:opacity-90'
                  }`}
                >
                  {isProcessing && <Loader className="w-5 h-5 animate-spin" />}
                  {isProcessing ? t.processing : t.placeOrder}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
