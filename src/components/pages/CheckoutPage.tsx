"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Lock, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2, Trash2, Plus, Minus, Tag, X, Wallet, Banknote, AlertCircle } from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';
import { commerce } from '@/lib/commerce';
import { MercadoPagoBrick } from '@/components/checkout/MercadoPagoBrick';
import { StripeCheckout, StripeCheckoutHandle } from '@/components/checkout/StripeCheckout';
import { LOCATIONS } from '@/data/locations';
// CheckoutHeader/Footer are part of the left panel design, rendered inline below
import { CheckoutFooter } from '@/components/layout/CheckoutFooter';

// ─── Shipping option ID (from Medusa DB) ───
const DEFAULT_SHIPPING_OPTION_ID = 'so_01KJ619T56SW3JP5JSKEAWXC5V';

const logoDSD = '/images/logo-dsd.png';
const paypalLogo = '/images/paypal-logo.png';
const mercadoPagoLogo = '/images/mercado-pago-logo.png';
const stripeLogo = '/images/stripe-logo.png';

// Modern Input Component
const InputField = ({ label, name, register, errors, placeholder, type = "text", required = true, className = "" }: any) => {
  const isPhone = name === 'phone';
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-wood-600 uppercase tracking-wide ml-1">{label}</label>
      <div className="relative">
        {isPhone && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <select 
              className="h-full bg-transparent py-0 pl-0 border-0 border-r border-wood-200 text-wood-900 focus:ring-0 text-sm font-medium cursor-pointer outline-none bg-none pr-3"
              defaultValue="+52"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            >
              <option value="+52">MX +52</option>
              <option value="+1">US +1</option>
              <option value="+34">ES +34</option>
              <option value="+54">AR +54</option>
              <option value="+57">CO +57</option>
              <option value="+56">CL +56</option>
              <option value="+51">PE +51</option>
              <option value="+593">EC +593</option>
              <option value="+58">VE +58</option>
              <option value="+598">UY +598</option>
              <option value="+595">PY +595</option>
              <option value="+591">BO +591</option>
              <option value="+506">CR +506</option>
              <option value="+507">PA +507</option>
              <option value="+1">DO +1</option>
              <option value="+502">GT +502</option>
              <option value="+503">SV +503</option>
              <option value="+504">HN +504</option>
              <option value="+505">NI +505</option>
              <option value="+1">PR +1</option>
              <option value="+55">BR +55</option>
            </select>
          </div>
        )}
        <input 
          {...register(name, { required })}
          type={type}
          className={`w-full bg-white border border-wood-200 rounded-lg py-3 text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-2 focus:ring-wood-900/10 focus:border-wood-900 transition-all duration-300 ${isPhone ? 'pl-24' : 'px-4'}`}
          placeholder={placeholder}
        />
      </div>
      {errors[name] && <span className="text-xs text-red-500 ml-1">Requerido</span>}
    </div>
  );
};

// Select Component
const SelectField = ({ label, name, register, errors, options, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-semibold text-wood-600 uppercase tracking-wide ml-1">{label}</label>
    <div className="relative">
      <select 
        {...register(name, { required: true })}
        className="w-full bg-white border border-wood-200 rounded-lg px-4 py-3 text-wood-900 focus:outline-none focus:ring-2 focus:ring-wood-900/10 focus:border-wood-900 transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="">Seleccionar...</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-400 pointer-events-none" />
    </div>
    {errors[name] && <span className="text-xs text-red-500 ml-1">Requerido</span>}
  </div>
);

// Text Area Component
const TextAreaField = ({ label, name, register, errors, placeholder, required = false, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-xs font-semibold text-wood-600 uppercase tracking-wide ml-1">{label}</label>
    <textarea
      {...register(name, { required })}
      className="w-full bg-white border border-wood-200 rounded-lg px-4 py-3 text-wood-900 placeholder:text-wood-300 focus:outline-none focus:ring-2 focus:ring-wood-900/10 focus:border-wood-900 transition-all duration-300 min-h-[100px] resize-y"
      placeholder={placeholder}
    />
    {errors[name] && <span className="text-xs text-red-500 ml-1">Requerido</span>}
  </div>
);

export const CheckoutPage = () => {
  const router = useRouter();
  const stripeRef = React.useRef<StripeCheckoutHandle>(null);
  const { register, handleSubmit, trigger, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      country: 'MX',
      state: '',
      city: '',
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      street: '',
      exteriorNumber: '',
      interiorNumber: '',
      reference: '',
      zip: '',
      shippingNotes: '',
      paymentMethod: 'stripe',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
      termsAccepted: false
    }
  });

  const selectedCountry = useWatch({ control, name: 'country' });
  const selectedState = useWatch({ control, name: 'state' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const watchedEmail = useWatch({ control, name: 'email' });
  const watchedFirstName = useWatch({ control, name: 'firstName' });
  const watchedLastName = useWatch({ control, name: 'lastName' });
  const watchedStreet = useWatch({ control, name: 'street' });
  const watchedExterior = useWatch({ control, name: 'exteriorNumber' });
  const watchedInterior = useWatch({ control, name: 'interiorNumber' });
  const watchedCity = useWatch({ control, name: 'city' });
  const watchedState = useWatch({ control, name: 'state' });
  const watchedZip = useWatch({ control, name: 'zip' });
  const watchedPhone = useWatch({ control, name: 'phone' });

  // Reset dependent fields when parent changes
  useEffect(() => {
    setValue('state', '');
    setValue('city', '');
  }, [selectedCountry, setValue]);

  useEffect(() => {
    setValue('city', '');
  }, [selectedState, setValue]);

  // Compute available states and cities
  const availableStates = LOCATIONS[selectedCountry]?.states.map(s => ({ value: s.name, label: s.name })) || [];
  
  const selectedStateData = LOCATIONS[selectedCountry]?.states.find(s => s.name === selectedState);
  const availableCities = selectedStateData?.cities.map(c => ({ value: c, label: c })) || [];

  const [step, setStep] = useState(1); // 1: Info & Shipping, 2: Payment
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Cart State (from CartContext)
  const { cart, loading: cartLoading, updating: cartUpdating, subtotal: cartSubtotal, currencyCode, updateItem: cartUpdateItem, removeItem: cartRemoveItem, clearCart } = useCartContext();

  // Guard: redirect to cart if empty (after loading finishes)
  useEffect(() => {
    if (!cartLoading && (!cart || (cart.lines?.length ?? 0) === 0)) {
      router.replace('/cart');
    }
  }, [cartLoading, cart, router]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Cart Calculations
  const subtotal = cartSubtotal;
  const shipping: number = 0; // Free shipping for testing
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount) : 0;
  const total = Math.max(0, subtotal + shipping - discountAmount);

  const cartItems = cart?.lines ?? [];

  // Cart Handlers
  const updateQuantity = (lineId: string, delta: number) => {
    const line = cartItems.find(l => l.id === lineId);
    if (!line) return;
    const newQuantity = Math.max(1, line.quantity + delta);
    cartUpdateItem(lineId, newQuantity);
  };

  const removeItem = (lineId: string) => {
    cartRemoveItem(lineId);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;
    const code = couponCode.toUpperCase();
    if (code === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 0.10 });
      setCouponCode('');
    } else if (code === 'LUJO20') {
      setAppliedCoupon({ code: 'LUJO20', discount: 0.20 });
      setCouponCode('');
    } else {
      setCouponError('Cupón inválido o expirado');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const onSubmit = (data: any) => {
    console.log(data);
    // If Stripe is selected, trigger Stripe payment via ref
    if (paymentMethod === 'stripe' && stripeRef.current) {
      stripeRef.current.submit();
      return;
    }
    // MercadoPago handles its own submit via the Payment Brick
    // This fallback should not be reached when a payment provider is active
  };

  const handleContinue = async () => {
    const isValid = await trigger(['email', 'firstName', 'lastName', 'street', 'exteriorNumber', 'city', 'state', 'zip', 'phone', 'country']);
    if (!isValid || !cart?.id) return;

    setCheckoutError('');
    try {
      // Register email + shipping address in Medusa cart
      await commerce.updateCartDetails(cart.id, {
        email: watchedEmail,
        shipping_address: {
          first_name: watchedFirstName,
          last_name: watchedLastName,
          address_1: `${watchedStreet} ${watchedExterior}`.trim(),
          address_2: watchedInterior || '',
          city: watchedCity,
          province: watchedState,
          postal_code: watchedZip,
          country_code: (selectedCountry || 'MX').toLowerCase(),
          phone: watchedPhone,
        },
      });

      // Add default shipping method to cart (idempotent — skip if already has one)
      // TODO: Phase 6 — replace hardcoded ID with dynamic shipping options
      const SHIPPING_OPTION_ID = 'so_01KJ619T56SW3JP5JSKEAWXC5V';
      try {
        await commerce.addShippingMethod(cart.id, SHIPPING_OPTION_ID);
      } catch (shippingErr: unknown) {
        // If shipping method already exists or profile conflict, log and continue
        // The backend fallback in medusa-helpers.ts will handle it
        console.warn('[Checkout] Shipping method note:', (shippingErr as Error).message);
      }

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      console.error('[Checkout] Error preparing cart:', err);
      setCheckoutError(
        (err as Error).message || 'Error al preparar tu pedido. Intenta de nuevo.'
      );
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans lg:flex lg:flex-row-reverse">
      
      {/* RIGHT COLUMN: ORDER SUMMARY */}
      <aside className="lg:w-[45%] bg-sand-50 border-l border-wood-100 lg:min-h-screen flex flex-col relative z-20">
        {/* Mobile Toggle */}
        <div 
          className="lg:hidden p-4 border-b border-wood-200 bg-sand-50 flex items-center justify-between cursor-pointer"
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
        >
          <div className="flex items-center gap-2 text-wood-900 font-medium">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm">Mostrar resumen del pedido</span>
            {isSummaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
          <span className="font-bold text-lg text-wood-900">${total.toLocaleString()}</span>
        </div>

        {/* Content */}
        <div className={`
          ${isSummaryOpen ? 'block' : 'hidden'} lg:block 
          lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto
          p-6 md:p-12 space-y-8
        `}>
           {/* Cart Header */}
           <div className="flex items-center justify-between border-b border-wood-200 pb-5">
             <h3 className="font-serif text-xl text-wood-900">Tu Carrito</h3>
             <span className="text-xs font-medium text-wood-500 bg-white px-2.5 py-1 rounded-full border border-wood-100">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} ítems
             </span>
           </div>

           <div className="space-y-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-10 text-wood-500 text-sm">
                  Tu carrito está vacío.
                </div>
              ) : cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center group">
                  <div className="w-16 h-16 bg-white rounded-lg border border-wood-100 p-1 relative shrink-0">
                    {item.merchandise.image ? (
                      <img src={item.merchandise.image.url} alt={item.merchandise.productTitle} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-wood-300"><ShoppingBag className="w-6 h-6" /></div>
                    )}
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-wood-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-wood-900 text-sm truncate">{item.merchandise.productTitle}</h4>
                    <p className="text-xs text-wood-500 mb-2">${item.merchandise.price.amount.toLocaleString()} {currencyCode}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-wood-200 rounded-md bg-white">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-wood-50 text-wood-600 transition-colors" disabled={item.quantity <= 1 || cartUpdating}><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-wood-50 text-wood-600 transition-colors" disabled={cartUpdating}><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-wood-400 hover:text-red-500 transition-colors" disabled={cartUpdating}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <span className="font-medium text-wood-900 text-sm">${(item.merchandise.price.amount * item.quantity).toLocaleString()}</span>
                </div>
              ))}
           </div>
           
           {/* Coupon */}
           <div className="pt-6 border-t border-wood-200">
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Código de descuento" className="w-full bg-white border border-wood-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-wood-900 transition-colors" disabled={!!appliedCoupon} />
                 <Tag className="absolute right-3 top-2.5 w-4 h-4 text-wood-400" />
               </div>
               <button onClick={handleApplyCoupon} disabled={!!appliedCoupon || !couponCode.trim()} className="bg-wood-200 text-wood-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-wood-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Aplicar</button>
             </div>
             {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
             {appliedCoupon && (
               <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-100 p-2 rounded-md">
                 <div className="flex items-center gap-2"><Tag className="w-3 h-3 text-green-700" /><span className="text-xs font-bold text-green-700">{appliedCoupon.code}</span></div>
                 <button onClick={removeCoupon} className="text-green-700 hover:text-green-900"><X className="w-3 h-3" /></button>
               </div>
             )}
           </div>

           {/* Totals */}
           <div className="space-y-3 pt-6 border-t border-wood-200 text-sm">
              <div className="flex justify-between text-wood-600"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-wood-600"><span>Envío</span><span>{shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}</span></div>
              {appliedCoupon && <div className="flex justify-between text-green-700 font-medium"><span>Descuento ({(appliedCoupon.discount * 100).toFixed(0)}%)</span><span>-${discountAmount.toLocaleString()}</span></div>}
              <div className="flex justify-between text-xl font-serif text-wood-900 pt-4 border-t border-wood-200 items-baseline"><span>Total</span><span className="font-bold">${total.toLocaleString()}</span></div>
           </div>
        </div>
      </aside>

      {/* LEFT COLUMN: MAIN CONTENT */}
      <main className="flex-1 lg:w-[55%] flex flex-col min-h-screen">
        <div className="w-full max-w-2xl mx-auto px-6 md:px-12 py-8 flex flex-col flex-1">
          
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
             <button onClick={() => router.push('/')} className="flex items-center text-wood-500 hover:text-wood-900 transition-colors">
               <ArrowLeft className="w-5 h-5" />
             </button>
             <img src={logoDSD} alt="DavidSon's Design" className="h-12 w-auto cursor-pointer" onClick={() => router.push('/')} />
             <div className="w-5" />
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-3 text-xs font-medium uppercase tracking-widest mb-10 text-wood-400">
            <span onClick={() => router.push('/cart')} className="cursor-pointer hover:text-wood-900 transition-colors">Carrito</span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className={step === 1 ? "text-wood-900 font-bold border-b border-wood-900 pb-0.5" : "cursor-pointer hover:text-wood-900"} onClick={() => step === 2 && setStep(1)}>Envío</span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className={step === 2 ? "text-wood-900 font-bold border-b border-wood-900 pb-0.5" : ""}>Pago</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 flex-1">
            
            {/* STEP 1: CONTACT & SHIPPING */}
            {step === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <section className="space-y-6">
                    <div className="flex items-baseline justify-between">
                        <h2 className="text-xl font-serif text-wood-900">Contacto</h2>
                        <div className="text-xs text-wood-500">
                        ¿Ya tienes cuenta? <span className="text-wood-900 underline cursor-pointer">Iniciar Sesión</span>
                        </div>
                    </div>
                    <InputField label="Email" name="email" placeholder="tu@email.com" type="email" register={register} errors={errors} />
                    <InputField label="Teléfono" name="phone" placeholder="+52 55 1234 5678" register={register} errors={errors} />
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-xl font-serif text-wood-900">Dirección de Envío</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Nombre" name="firstName" placeholder="Juan" register={register} errors={errors} />
                        <InputField label="Apellido" name="lastName" placeholder="Pérez" register={register} errors={errors} />
                    </div>
                    
                    <div className="grid grid-cols-12 gap-4">
                        <InputField label="Calle" name="street" placeholder="Av. Principal" className="col-span-12 md:col-span-6" register={register} errors={errors} />
                        <InputField label="No. Ext." name="exteriorNumber" placeholder="123" className="col-span-6 md:col-span-3" register={register} errors={errors} />
                        <InputField label="No. Int." name="interiorNumber" placeholder="2B" required={false} className="col-span-6 md:col-span-3" register={register} errors={errors} />
                    </div>

                    <InputField label="Referencia" name="reference" placeholder="Entre calles, color de fachada, etc." register={register} errors={errors} required={false} />
                    
                    <SelectField 
                        label="País" 
                        name="country" 
                        register={register} 
                        errors={errors} 
                        options={[
                            { value: 'MX', label: 'México' },
                            { value: 'US', label: 'Estados Unidos' },
                            { value: 'ES', label: 'España' },
                            { value: 'AR', label: 'Argentina' },
                            { value: 'CO', label: 'Colombia' },
                            { value: 'CL', label: 'Chile' },
                            { value: 'PE', label: 'Perú' },
                            { value: 'EC', label: 'Ecuador' },
                            { value: 'VE', label: 'Venezuela' },
                            { value: 'UY', label: 'Uruguay' },
                            { value: 'PY', label: 'Paraguay' },
                            { value: 'BO', label: 'Bolivia' },
                            { value: 'CR', label: 'Costa Rica' },
                            { value: 'PA', label: 'Panamá' },
                            { value: 'DO', label: 'República Dominicana' },
                            { value: 'GT', label: 'Guatemala' },
                            { value: 'SV', label: 'El Salvador' },
                            { value: 'HN', label: 'Honduras' },
                            { value: 'NI', label: 'Nicaragua' },
                            { value: 'PR', label: 'Puerto Rico' },
                            { value: 'BR', label: 'Brasil' }
                        ]}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        {availableStates.length > 0 ? (
                            <SelectField label="Estado" name="state" className="col-span-1" register={register} errors={errors} options={availableStates} />
                        ) : (
                            <InputField label="Estado" name="state" className="col-span-1" register={register} errors={errors} />
                        )}
                        
                        {availableCities.length > 0 ? (
                            <SelectField label="Ciudad" name="city" className="col-span-1" register={register} errors={errors} options={availableCities} />
                        ) : (
                            <InputField label="Ciudad" name="city" className="col-span-1" register={register} errors={errors} />
                        )}
                        
                        <InputField label="C.P." name="zip" className="col-span-1" register={register} errors={errors} />
                    </div>

                    <TextAreaField label="Notas de envío (Opcional)" name="shippingNotes" placeholder="Instrucciones especiales para el repartidor (ej. timbre descompuesto, dejar en recepción...)" register={register} errors={errors} />
                  </section>

                  {/* Shipping Method Section */}
                  <section className="space-y-4">
                     <h2 className="text-xl font-serif text-wood-900">Método de Envío</h2>
                     <div className="border-2 border-wood-900 bg-sand-50 rounded-lg p-4 flex items-center justify-between cursor-pointer relative">
                        <div className="flex items-center gap-4">
                           <div className="w-5 h-5 rounded-full border-2 border-wood-900 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-wood-900" />
                           </div>
                           <div>
                              <p className="font-bold text-wood-900 flex items-center gap-2">
                                 <Truck className="w-4 h-4" />
                                 Envío Estándar
                              </p>
                              <p className="text-xs text-wood-600 mt-0.5">3-5 días hábiles</p>
                           </div>
                        </div>
                        <span className="font-bold text-wood-900">
                           {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString()}`}
                        </span>
                     </div>
                  </section>

                  {checkoutError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{checkoutError}</p>
                    </div>
                  )}

                  <div className="pt-6">
                    <button 
                        type="button"
                        onClick={handleContinue}
                        className="w-full bg-wood-900 text-white py-5 rounded-lg font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl shadow-wood-900/10 flex items-center justify-center gap-2 group"
                    >
                        <span>Continuar a Pago</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <section className="space-y-6">
                    <h2 className="text-xl font-serif text-wood-900 mb-4">Método de Pago</h2>
                    
                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Mercado Pago */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-20 ${paymentMethod === 'mercadopago' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="mercadopago" className="sr-only" />
                            <img src={mercadoPagoLogo} alt="Mercado Pago" className="h-8 w-auto object-contain" />
                        </label>

                        {/* Stripe */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-20 ${paymentMethod === 'stripe' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="stripe" className="sr-only" />
                            <img src={stripeLogo} alt="Stripe" className="h-8 w-auto object-contain" />
                        </label>

                        {/* PayPal */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-20 ${paymentMethod === 'paypal' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="paypal" className="sr-only" />
                            <img src={paypalLogo} alt="PayPal" className="h-7 w-auto object-contain" />
                        </label>
                        
                        {/* SPEI */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-20 ${paymentMethod === 'spei' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="spei" className="sr-only" />
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-wood-900 text-sm">SPEI</span>
                              <span className="text-[10px] text-wood-600 font-medium">Transferencia</span>
                            </div>
                        </label>
                    </div>

                    {/* Conditional Content based on Payment Method */}
                    <div className="mt-6">
                        {paymentMethod === 'mercadopago' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <MercadoPagoBrick
                                  amount={total}
                                  cartId={cart?.id || ''}
                                  payerEmail={watchedEmail || ''}
                                  payerFirstName={watchedFirstName || ''}
                                  payerLastName={watchedLastName || ''}
                                  shippingAddress={{
                                    first_name: watchedFirstName || '',
                                    last_name: watchedLastName || '',
                                    address_1: `${watchedStreet || ''} ${watchedExterior || ''}`.trim(),
                                    address_2: watchedInterior || '',
                                    city: watchedCity || '',
                                    province: watchedState || '',
                                    postal_code: watchedZip || '',
                                    country_code: 'mx',
                                    phone: watchedPhone || '',
                                  }}
                                  onPaymentSuccess={(data) => {
                                    console.log('Payment success:', data);
                                    clearCart();
                                    const orderId = data.order_display_id || 'pending';
                                    router.push(`/checkout/success?order=${orderId}&mp_id=${data.id}`);
                                  }}
                                  onPaymentError={(error) => {
                                    console.error('Payment error:', error);
                                  }}
                                />
                            </motion.div>
                        )}

                        {paymentMethod === 'stripe' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <StripeCheckout
                                  ref={stripeRef}
                                  amount={total}
                                  cartId={cart?.id || ''}
                                  payerEmail={watchedEmail || ''}
                                  payerFirstName={watchedFirstName || ''}
                                  payerLastName={watchedLastName || ''}
                                  shippingAddress={{
                                    first_name: watchedFirstName || '',
                                    last_name: watchedLastName || '',
                                    address_1: `${watchedStreet || ''} ${watchedExterior || ''}`.trim(),
                                    address_2: watchedInterior || '',
                                    city: watchedCity || '',
                                    province: watchedState || '',
                                    postal_code: watchedZip || '',
                                    country_code: 'mx',
                                    phone: watchedPhone || '',
                                  }}
                                  onPaymentSuccess={(data) => {
                                    console.log('Stripe payment success:', data);
                                    clearCart();
                                    const orderId = data.order_display_id || 'pending';
                                    router.push(`/checkout/success?order=${orderId}&provider=stripe&pi=${data.payment_intent_id || ''}`);
                                  }}
                                  onPaymentError={(error) => {
                                    console.error('Stripe payment error:', error);
                                  }}
                                />
                            </motion.div>
                        )}

                        {paymentMethod === 'paypal' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-100 p-6 rounded-lg text-center space-y-4">
                                <img src={paypalLogo} alt="PayPal" className="h-8 w-auto mx-auto object-contain" />
                                <p className="text-blue-900 font-medium">Serás redirigido a PayPal para completar tu compra de forma segura.</p>
                            </motion.div>
                        )}

                        {paymentMethod === 'spei' && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-sand-50 border border-wood-200 p-6 rounded-lg space-y-4">
                                <div className="flex items-start gap-4">
                                    <Banknote className="w-6 h-6 text-wood-900 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-wood-900 mb-1">Instrucciones para Transferencia</h4>
                                        <p className="text-sm text-wood-600">Al finalizar el pedido, recibirás un correo con la CLABE interbancaria única para realizar tu pago. Tu pedido se procesará una vez confirmado el depósito.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                  </section>


                  {/* Terms and Conditions Checkbox */}
                  <div className="pt-4 space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-1">
                        <input 
                          type="checkbox" 
                          {...register('termsAccepted', { required: true })}
                          className="peer h-4 w-4 appearance-none border border-wood-300 rounded bg-white checked:bg-wood-900 checked:border-wood-900 focus:ring-1 focus:ring-wood-900/20 transition-all cursor-pointer"
                        />
                        <CheckCircle2 className="w-3 h-3 text-white absolute top-0.5 left-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="text-sm text-wood-600">
                        He leído y acepto los <Link href="/sales-conditions" target="_blank" className="underline hover:text-wood-900 font-medium">Términos y Condiciones de Venta</Link>.
                      </span>
                    </label>
                    {errors.termsAccepted && <span className="text-xs text-red-500 ml-7 block">Debe aceptar los términos para continuar.</span>}
                    
                    <div className="text-xs text-wood-500 ml-7">
                      Ver también: <Link href="/shipping-policy" target="_blank" className="underline hover:text-wood-800">Política de Envíos</Link>, <Link href="/returns-policy" target="_blank" className="underline hover:text-wood-800">Política de Devoluciones</Link> y <Link href="/warranty-policy" target="_blank" className="underline hover:text-wood-800">Política de Garantía</Link>.
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button 
                        type="submit" 
                        className="w-full bg-wood-900 text-white py-5 rounded-lg font-bold text-lg hover:bg-black transition-all duration-300 shadow-xl shadow-wood-900/10 flex items-center justify-center gap-2 group"
                    >
                        <span>Pagar ${total.toLocaleString()}</span>
                        <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-3 text-wood-600 font-medium hover:text-wood-900 transition-colors text-sm"
                    >
                        Volver a Envío
                    </button>
                  </div>
                </motion.div>
            )}

          </form>

          <CheckoutFooter />
        </div>
      </main>

    </div>
  );
};