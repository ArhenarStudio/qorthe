"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, ShieldCheck, Lock, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2, Trash2, Plus, Minus, Tag, X, AlertCircle } from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/config/shipping';
import { commerce } from '@/lib/commerce';
import { fbEvent, FB_EVENTS } from '@/lib/meta-pixel';
import { MercadoPagoBrick } from '@/components/checkout/MercadoPagoBrick';
import { StripeCheckout, StripeCheckoutHandle } from '@/components/checkout/StripeCheckout';
import { PayPalCheckout } from '@/components/checkout/PayPalCheckout';
import { LoyaltyRedemption } from '@/components/checkout/LoyaltyRedemption';
import { useLoyalty } from '@/hooks/useLoyalty';
import { getTierConfig, normalizeTierId, getTierName } from '@/data/loyalty';
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
  const { session } = useAuth();
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
  const watchedTerms = useWatch({ control, name: 'termsAccepted' });

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
  const paymentCompletedRef = useRef(false);

  // Cart State (from CartContext)
  const { cart, loading: cartLoading, updating: cartUpdating, subtotal: cartSubtotal, shippingTotal: cartShipping, discountTotal, total: cartTotal, currencyCode, updateItem: cartUpdateItem, removeItem: cartRemoveItem, clearCart, promotions, applyPromo, removePromo } = useCartContext();

  // Guard: redirect to cart if empty (after loading finishes)
  // Skip guard if payment was just completed (cart cleared intentionally)
  useEffect(() => {
    if (paymentCompletedRef.current) return;
    if (!cartLoading && (!cart || (cart.lines?.length ?? 0) === 0)) {
      router.replace('/cart');
    }
  }, [cartLoading, cart, router]);

  // ─── Dynamic Shipping Options ───
  type ShippingOption = { id: string; name: string; amount: number; currency_code: string; price_type: string; data: Record<string, unknown> | null };
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<string>('');
  const [shippingOptionsLoading, setShippingOptionsLoading] = useState(false);
  const [shippingOptionsError, setShippingOptionsError] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Loyalty redemption state
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0); // in centavos

  const handleLoyaltyRedemptionChange = React.useCallback((points: number, discountCentavos: number) => {
    setLoyaltyPointsToRedeem(points);
    setLoyaltyDiscount(discountCentavos);
  }, []);

  // Tier discount — automatic permanent discount based on membership level
  const { profile: loyaltyProfile } = useLoyalty();
  const userTierId = normalizeTierId(loyaltyProfile?.current_tier || 'pino');
  const userTierConfig = getTierConfig(userTierId);
  const tierDiscountPercent = userTierConfig?.discount_percent || 0;
  const tierDiscountAmount = tierDiscountPercent > 0 ? Math.round(cartSubtotal * tierDiscountPercent / 100) : 0;

  // Debounce for quantity updates
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch shipping options from Medusa when cart is ready ───
  const [allShippingOptions, setAllShippingOptions] = useState<ShippingOption[]>([]);
  useEffect(() => {
    if (!cart?.id) return;
    let cancelled = false;
    const fetchOptions = async () => {
      setShippingOptionsLoading(true);
      setShippingOptionsError('');
      try {
        const options = await commerce.getShippingOptions(cart.id);
        if (cancelled) return;
        setAllShippingOptions(options);
      } catch (err) {
        if (cancelled) return;
        console.error('[Checkout] Error fetching shipping options:', err);
        setShippingOptionsError('No pudimos cargar las opciones de envío. Intenta de nuevo.');
      } finally {
        if (!cancelled) setShippingOptionsLoading(false);
      }
    };
    fetchOptions();
    return () => { cancelled = true; };
  }, [cart?.id]);

  // ─── Envia Rate Quotes — fetch real prices when CP is entered ───
  const [quoteLoading, setQuoteLoading] = useState(false);
  const quoteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuotedZipRef = useRef('');

  useEffect(() => {
    const zip = watchedZip?.trim() || '';
    // Only quote when we have a 5-digit Mexican postal code
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) return;
    // Don't re-quote the same CP
    if (zip === lastQuotedZipRef.current) return;
    // Must have options loaded from Medusa first
    if (allShippingOptions.length === 0) return;

    // Debounce 600ms to avoid spamming while typing
    if (quoteDebounceRef.current) clearTimeout(quoteDebounceRef.current);
    quoteDebounceRef.current = setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const resp = await fetch('/api/shipping/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postalCode: zip,
            city: watchedCity || '',
            state: watchedState || '',
            country: 'MX',
            weight: 3, // TODO: calculate from cart items
            declaredValue: cartSubtotal || 1000,
          }),
        });
        const data = await resp.json();
        if (data.quotes && data.quotes.length > 0) {
          lastQuotedZipRef.current = zip;
          // Merge Envia quotes into allShippingOptions
          setAllShippingOptions(prev => prev.map(option => {
            if (option.price_type !== 'calculated') return option;
            const quote = data.quotes.find((q: any) => q.shippingOptionId === option.id);
            if (quote) {
              return { ...option, amount: Math.round(quote.totalPrice) };
            }
            return option;
          }));
        }
      } catch (err) {
        console.warn('[Checkout] Envia quote error:', err);
      } finally {
        setQuoteLoading(false);
      }
    }, 600);

    return () => { if (quoteDebounceRef.current) clearTimeout(quoteDebounceRef.current); };
  }, [watchedZip, watchedCity, watchedState, allShippingOptions.length, cartSubtotal]);

  // ─── Filter shipping options based on postal code + subtotal ───
  const HERMOSILLO_OPTION_ID = 'so_01KJGHMC9AD3SGSATMP5GZ0QCQ';
  const FREE_SHIPPING_OPTION_ID = 'so_01KJ61A3JQW6X3RXS186XT17R1';
  const FREE_SHIPPING_THRESHOLD = 2500;

  useEffect(() => {
    const zip = watchedZip?.trim() || '';
    const isHermosillo = /^839\d{2}$/.test(zip) || /^83[0-8]\d{2}$/.test(zip) || zip.startsWith('83');
    // More precise: Hermosillo CPs are 83000-83999
    const isHermosilloCP = zip.length === 5 && parseInt(zip) >= 83000 && parseInt(zip) <= 83999;

    const filtered = allShippingOptions.filter(option => {
      // Filter Hermosillo: only show if CP is 83000-83999
      if (option.id === HERMOSILLO_OPTION_ID && !isHermosilloCP) return false;
      // Filter Free Shipping: only show if subtotal qualifies
      if (option.id === FREE_SHIPPING_OPTION_ID && cartSubtotal < FREE_SHIPPING_THRESHOLD) return false;
      return true;
    });

    setShippingOptions(filtered);

    // Auto-select logic
    if (filtered.length > 0) {
      const currentStillValid = filtered.some(o => o.id === selectedShippingOption);
      if (!currentStillValid) {
        // Prefer flat-price options over calculated
        const flatOptions = filtered.filter(o => o.price_type === 'flat');
        if (flatOptions.length > 0) {
          // Prefer free, then cheapest flat
          const freeOpt = flatOptions.find(o => o.amount === 0);
          setSelectedShippingOption(freeOpt ? freeOpt.id : flatOptions[0].id);
        } else {
          setSelectedShippingOption(filtered[0].id);
        }
      }
    } else {
      setSelectedShippingOption('');
    }
  }, [allShippingOptions, watchedZip, cartSubtotal, selectedShippingOption]);

  // Cart Calculations — 100% Medusa, single source of truth
  const subtotal = cartSubtotal;
  // Shipping: use the selected shipping option's amount as estimate before
  // the method is actually added in Medusa (which happens in handleContinue).
  // For calculated options (Envia), amount is 0 until Medusa processes it.
  const selectedOption = shippingOptions.find(o => o.id === selectedShippingOption);
  const isCalculatedShipping = selectedOption?.price_type === 'calculated';
  const selectedOptionAmount = selectedOption?.amount ?? 0;
  const shipping = cartShipping > 0 ? cartShipping : selectedOptionAmount;
  const total = cartShipping > 0
    ? cartTotal - loyaltyDiscount - tierDiscountAmount
    : (subtotal - discountTotal - tierDiscountAmount + shipping - loyaltyDiscount);

  const cartItems = cart?.lines ?? [];

  // Cart Handlers (debounced)
  const updateQuantity = (lineId: string, delta: number) => {
    const line = cartItems.find(l => l.id === lineId);
    if (!line) return;
    const newQuantity = Math.max(1, line.quantity + delta);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cartUpdateItem(lineId, newQuantity), 400);
  };

  const removeItem = (lineId: string) => {
    cartRemoveItem(lineId);
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    try {
      const result = await applyPromo(code);
      if (result.success) {
        setCouponCode('');
      } else {
        setCouponError(result.error || 'Cupón inválido o expirado');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemovePromo = async (code: string) => {
    await removePromo(code);
  };

  // Redeem loyalty points after successful payment
  const redeemLoyaltyPoints = async (orderDisplayId?: string) => {
    if (loyaltyPointsToRedeem <= 0) return;
    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        console.warn('[Loyalty] No auth token available for redeeming points');
        return;
      }

      await fetch('/api/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'redeem',
          points: loyaltyPointsToRedeem,
          description: `Canje en pedido #${orderDisplayId || 'N/A'} — ${formatPrice(loyaltyDiscount, currencyCode)} de descuento`,
        }),
      });
    } catch (err) {
      console.error('[Loyalty] Error redeeming points:', err);
      // Non-blocking: payment already succeeded, log but don't break flow
    }
  };

  const onSubmit = (data: any) => {
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

      // ─── IDEMPOTENT SHIPPING METHOD MANAGEMENT ───
      // Medusa v2 ACCUMULATES shipping methods (doesn't replace).
      // We must ensure exactly ONE correct shipping method exists.
      if (!selectedShippingOption) {
        setCheckoutError('Selecciona un método de envío.');
        return;
      }
      const existingMethods = await commerce.getCartShippingMethods(cart.id);

      const hasCorrectMethod = existingMethods.some(
        (m) => m.shipping_option_id === selectedShippingOption
      );

      if (existingMethods.length > 1) {
        console.warn(`[Checkout] Cart has ${existingMethods.length} shipping methods (corrupted). Re-adding correct one.`);
        try {
          await commerce.addShippingMethod(cart.id, selectedShippingOption);
        } catch (shippingErr: unknown) {
          console.warn('[Checkout] Shipping method cleanup note:', (shippingErr as Error).message);
        }
      } else if (!hasCorrectMethod) {
        try {
          await commerce.addShippingMethod(cart.id, selectedShippingOption);
        } catch (shippingErr: unknown) {
          console.warn('[Checkout] Shipping method note:', (shippingErr as Error).message);
        }
      } else {
      }

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Meta Pixel: InitiateCheckout event
      fbEvent(FB_EVENTS.INITIATE_CHECKOUT, {
        content_ids: cartItems.map(item => item.merchandise.id),
        contents: cartItems.map(item => ({ id: item.merchandise.id, quantity: item.quantity, item_price: item.merchandise.price.amount })),
        content_type: 'product',
        value: total,
        currency: currencyCode,
        num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      });
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
          <span className="font-bold text-lg text-wood-900">{formatPrice(total, currencyCode)}</span>
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
                    {((item.metadata as any)?.custom_design || (item.metadata as any)?.custom_designs) && (
                      <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-bold uppercase tracking-wider border border-green-200">
                        ✂️ Grabado láser incluido
                      </span>
                    )}
                    {((item.metadata as any)?.extra_design_count ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 mt-0.5 ml-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                        +{(item.metadata as any).extra_design_count} diseño{(item.metadata as any).extra_design_count > 1 ? 's' : ''} extra
                      </span>
                    )}
                    <p className="text-xs text-wood-500 mb-2">{formatPrice(item.merchandise.price.amount, currencyCode)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-wood-200 rounded-md bg-white">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-wood-50 text-wood-600 transition-colors" disabled={item.quantity <= 1 || cartUpdating}><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-wood-50 text-wood-600 transition-colors" disabled={cartUpdating}><Plus className="w-3 h-3" /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-wood-400 hover:text-red-500 transition-colors" disabled={cartUpdating}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <span className="font-medium text-wood-900 text-sm">{formatPrice(item.merchandise.price.amount * item.quantity, currencyCode)}</span>
                </div>
              ))}
           </div>
           
           {/* Coupon — Medusa Promotion Module */}
           <div className="pt-6 border-t border-wood-200">
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <input
                   type="text"
                   value={couponCode}
                   onChange={(e) => setCouponCode(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                   placeholder="Código de descuento"
                   className="w-full bg-white border border-wood-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-wood-900 transition-colors"
                   disabled={couponLoading}
                 />
                 <Tag className="absolute right-3 top-2.5 w-4 h-4 text-wood-400" />
               </div>
               <button
                 type="button"
                 onClick={handleApplyCoupon}
                 disabled={couponLoading || !couponCode.trim()}
                 className="bg-wood-200 text-wood-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-wood-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 {couponLoading ? '...' : 'Aplicar'}
               </button>
             </div>
             {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
             {promotions.length > 0 && (
               <div className="mt-3 space-y-2">
                 {promotions.map((promo) => (
                   <div key={promo.id} className="flex items-center justify-between bg-green-50 border border-green-100 p-2 rounded-md">
                     <div className="flex items-center gap-2">
                       <Tag className="w-3 h-3 text-green-700" />
                       <span className="text-xs font-bold text-green-700">{promo.code ?? 'Automático'}</span>
                       {promo.application_method?.value && (
                         <span className="text-xs text-green-600">-{promo.application_method.value}%</span>
                       )}
                     </div>
                     <button type="button" onClick={() => handleRemovePromo(promo.code ?? '')} className="text-green-700 hover:text-green-900">
                       <X className="w-3 h-3" />
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Loyalty Points Redemption */}
           <LoyaltyRedemption
             cartTotal={subtotal - discountTotal - tierDiscountAmount + shipping}
             currencyCode={currencyCode}
             onRedemptionChange={handleLoyaltyRedemptionChange}
             disabled={cartUpdating}
           />

           {/* Totals */}
           <div className="space-y-3 pt-6 border-t border-wood-200 text-sm">
              <div className="flex justify-between text-wood-600"><span>Subtotal</span><span>{formatPrice(subtotal, currencyCode)}</span></div>
              <div className="flex justify-between text-wood-600"><span>Envío</span><span>{quoteLoading ? 'Cotizando...' : isCalculatedShipping && shipping === 0 ? 'Por cotizar' : shipping === 0 ? 'Gratis' : formatPrice(shipping, currencyCode)}</span></div>
              {discountTotal > 0 && <div className="flex justify-between text-green-700 font-medium"><span>Descuento</span><span>-{formatPrice(discountTotal, currencyCode)}</span></div>}
              {tierDiscountAmount > 0 && <div className="flex justify-between text-amber-700 font-medium"><span>Miembro {getTierName(userTierId)} ({tierDiscountPercent}%)</span><span>-{formatPrice(tierDiscountAmount, currencyCode)}</span></div>}
              {loyaltyDiscount > 0 && <div className="flex justify-between text-accent-gold font-medium"><span>Puntos de lealtad</span><span>-{formatPrice(loyaltyDiscount, currencyCode)}</span></div>}
              <div className="flex justify-between text-xl font-serif text-wood-900 pt-4 border-t border-wood-200 items-baseline"><span>Total</span><span className="font-bold">{formatPrice(Math.max(0, total), currencyCode)}</span></div>
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

                  {/* Shipping Method Section — Dynamic from Medusa */}
                  <section className="space-y-4">
                     <h2 className="text-xl font-serif text-wood-900">Método de Envío</h2>
                     
                     {shippingOptionsLoading ? (
                       <div className="border border-wood-200 rounded-lg p-6 text-center">
                         <div className="animate-pulse flex items-center justify-center gap-2 text-wood-500">
                           <Truck className="w-4 h-4" />
                           <span className="text-sm">Cargando opciones de envío...</span>
                         </div>
                       </div>
                     ) : shippingOptionsError ? (
                       <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                         <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                         <p className="text-sm text-red-700">{shippingOptionsError}</p>
                       </div>
                     ) : shippingOptions.length === 0 ? (
                       <div className="border border-wood-200 rounded-lg p-6 text-center text-wood-500 text-sm">
                         No hay opciones de envío disponibles para tu ubicación.
                       </div>
                     ) : (
                       <div className="space-y-3">
                         {shippingOptions.map((option) => {
                           const isSelected = selectedShippingOption === option.id;
                           const isCalculated = option.price_type === 'calculated';
                           return (
                             <div
                               key={option.id}
                               onClick={() => setSelectedShippingOption(option.id)}
                               className={`border-2 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                                 isSelected
                                   ? 'border-wood-900 bg-sand-50 shadow-md'
                                   : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'
                               }`}
                             >
                               <div className="flex items-center gap-4">
                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                   isSelected ? 'border-wood-900' : 'border-wood-300'
                                 }`}>
                                   {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-wood-900" />}
                                 </div>
                                 <div>
                                   <p className="font-bold text-wood-900 flex items-center gap-2">
                                     <Truck className="w-4 h-4" />
                                     {option.name}
                                   </p>
                                   <p className="text-xs text-wood-500 mt-0.5">
                                     {isCalculated
                                       ? option.amount > 0
                                         ? `${option.name.includes('DHL') ? 'Express' : 'Terrestre'} — precio estimado`
                                         : 'Ingresa tu C.P. para cotizar'
                                       : option.amount === 0
                                         ? 'Sin costo adicional'
                                         : 'Tarifa fija'}
                                   </p>
                                 </div>
                               </div>
                               <span className={`font-bold whitespace-nowrap ${isCalculated && option.amount === 0 ? 'text-wood-400 text-sm' : 'text-wood-900'}`}>
                                 {isCalculated
                                   ? quoteLoading
                                     ? 'Cotizando...'
                                     : option.amount > 0
                                       ? formatPrice(option.amount, option.currency_code)
                                       : 'Por cotizar'
                                   : option.amount === 0
                                     ? 'Gratis'
                                     : formatPrice(option.amount, option.currency_code)}
                               </span>
                             </div>
                           );
                         })}
                       </div>
                     )}
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
                    <div className="grid grid-cols-3 gap-3">
                        {/* Mercado Pago */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-16 ${paymentMethod === 'mercadopago' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="mercadopago" className="sr-only" />
                            <img src={mercadoPagoLogo} alt="Mercado Pago" className="h-7 w-auto object-contain" />
                        </label>

                        {/* Stripe */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-16 ${paymentMethod === 'stripe' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="stripe" className="sr-only" />
                            <img src={stripeLogo} alt="Stripe" className="h-7 w-auto object-contain" />
                        </label>

                        {/* PayPal */}
                        <label className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 h-16 ${paymentMethod === 'paypal' ? 'border-wood-900 bg-sand-50 shadow-md' : 'border-wood-200 hover:border-wood-400 hover:bg-wood-50'}`}>
                            <input {...register('paymentMethod')} type="radio" value="paypal" className="sr-only" />
                            <img src={paypalLogo} alt="PayPal" className="h-7 w-auto object-contain" />
                        </label>
                    </div>

                    {/* Terms and Conditions — BEFORE payment form */}
                    <div className="bg-sand-50 border border-wood-200 rounded-lg p-4 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center mt-0.5">
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
                        Ver también: <Link href="/shipping-policy" target="_blank" className="underline hover:text-wood-800">Envíos</Link>, <Link href="/returns-policy" target="_blank" className="underline hover:text-wood-800">Devoluciones</Link> y <Link href="/warranty-policy" target="_blank" className="underline hover:text-wood-800">Garantía</Link>.
                      </div>
                    </div>

                    {/* Payment Form — conditionally shown based on terms acceptance */}
                    {!watchedTerms ? (
                      <div className="bg-wood-50 border border-wood-200 rounded-lg p-8 text-center space-y-2">
                        <Lock className="w-6 h-6 text-wood-400 mx-auto" />
                        <p className="text-sm text-wood-500">Acepta los términos y condiciones para continuar con el pago.</p>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {paymentMethod === 'mercadopago' && (
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
                                // Meta Pixel: Purchase event
                                fbEvent(FB_EVENTS.PURCHASE, {
                                  content_ids: cartItems.map(item => item.merchandise.id),
                                  contents: cartItems.map(item => ({ id: item.merchandise.id, quantity: item.quantity, item_price: item.merchandise.price.amount })),
                                  content_type: 'product',
                                  value: total,
                                  currency: currencyCode,
                                  num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                                });
                                paymentCompletedRef.current = true;
                                const orderId = data.order_display_id || 'pending';
                                redeemLoyaltyPoints(orderId);
                                clearCart();
                                router.push(`/checkout/success?order=${orderId}&mp_id=${data.id}`);
                              }}
                              onPaymentError={(error) => {
                                console.error('Payment error:', error);
                              }}
                            />
                        )}

                        {paymentMethod === 'stripe' && (
                            <>
                              <StripeCheckout
                                ref={stripeRef}
                                amount={total}
                                cartId={cart?.id || ''}
                                payerEmail={watchedEmail || ''}
                                loyaltyDiscountCentavos={loyaltyDiscount}
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
                                  // Meta Pixel: Purchase event
                                  fbEvent(FB_EVENTS.PURCHASE, {
                                    content_ids: cartItems.map(item => item.merchandise.id),
                                    contents: cartItems.map(item => ({ id: item.merchandise.id, quantity: item.quantity, item_price: item.merchandise.price.amount })),
                                    content_type: 'product',
                                    value: total,
                                    currency: currencyCode,
                                    num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                                  });
                                  paymentCompletedRef.current = true;
                                  const orderId = data.order_display_id || 'pending';
                                  redeemLoyaltyPoints(orderId);
                                  clearCart();
                                  router.push(`/checkout/success?order=${orderId}&provider=stripe&pi=${data.payment_intent_id || ''}`);
                                }}
                                onPaymentError={(error) => {
                                  console.error('Stripe payment error:', error);
                                }}
                              />
                              <div className="pt-4">
                                <button 
                                    type="submit" 
                                    className="w-full bg-wood-900 text-white py-4 rounded-lg font-bold text-base hover:bg-black transition-all duration-300 shadow-lg shadow-wood-900/10 flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    <span>Pagar {formatPrice(total, currencyCode)}</span>
                                </button>
                              </div>
                            </>
                        )}

                        {paymentMethod === 'paypal' && (
                            <PayPalCheckout
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
                                // Meta Pixel: Purchase event
                                fbEvent(FB_EVENTS.PURCHASE, {
                                  content_ids: cartItems.map(item => item.merchandise.id),
                                  contents: cartItems.map(item => ({ id: item.merchandise.id, quantity: item.quantity, item_price: item.merchandise.price.amount })),
                                  content_type: 'product',
                                  value: total,
                                  currency: currencyCode,
                                  num_items: cartItems.reduce((sum, item) => sum + item.quantity, 0),
                                });
                                paymentCompletedRef.current = true;
                                const orderId = data.order_display_id || 'pending';
                                redeemLoyaltyPoints(orderId);
                                clearCart();
                                router.push(`/checkout/success?order=${orderId}&provider=paypal&pp=${data.paypal_order_id || ''}`);
                              }}
                              onPaymentError={(error) => {
                                console.error('PayPal payment error:', error);
                              }}
                            />
                        )}
                      </motion.div>
                    )}
                  </section>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 text-xs text-wood-400 pt-2">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Pago 100% seguro</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Datos encriptados</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full py-3 text-wood-600 font-medium hover:text-wood-900 transition-colors text-sm"
                    >
                        ← Volver a Envío
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