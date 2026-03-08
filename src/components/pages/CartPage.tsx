"use client";

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag, Loader2, Tag, X } from 'lucide-react';
import { useCartContext } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getShippingEstimate, formatPrice, FREE_SHIPPING_THRESHOLD } from '@/config/shipping';
import type { CommercePromotion } from '@/lib/commerce';

const mercadoPagoLogo = '/images/mercado-pago-logo.png';
const stripeLogo = '/images/stripe-logo.png';
const paypalLogo = '/images/paypal-logo.png';

export const CartPage = () => {
  const router = useRouter();
  const {
    cart, loading, updating, itemCount, subtotal, discountTotal,
    currencyCode, promotions, updateItem, removeItem, applyPromo, removePromo,
  } = useCartContext();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // ─── Shipping estimate from centralized config ───
  const { qualifiesFreeShipping, estimatedShipping, progressPercent } = getShippingEstimate(subtotal);
  const displayTotal = subtotal + estimatedShipping - discountTotal;

  // ─── Debounce for quantity updates ───
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedUpdate = useCallback(
    (lineId: string, newQty: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateItem(lineId, newQty);
      }, 400);
    },
    [updateItem]
  );

  // ─── Coupon: calls Medusa Promotion Module via CartContext ───
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    const result = await applyPromo(code);
    setCouponLoading(false);
    if (result.success) {
      toast.success(`Cupón ${code} aplicado`);
      setCouponCode('');
    } else {
      toast.error(result.error ?? "Cupón inválido");
    }
  };

  const handleRemovePromo = async (code: string) => {
    await removePromo(code);
    toast.success("Cupón removido");
  };

  const handleRemoveItem = async (lineId: string) => {
    await removeItem(lineId);
    toast.success("Producto eliminado");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-wood-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-wood-400" />
        <p className="mt-4 text-wood-500 dark:text-sand-400">Cargando carrito...</p>
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-wood-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="w-16 h-16 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mb-6 text-wood-600 dark:text-sand-300">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-2">Tu carrito está vacío</h2>
        <p className="text-wood-500 dark:text-sand-400 mb-8 text-center max-w-md">Parece que aún no has añadido ninguna de nuestras selecciones exclusivas.</p>
        <button 
          onClick={() => router.push('/shop')}
          className="px-8 py-3 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 rounded-full hover:bg-wood-800 dark:hover:bg-sand-200 transition-colors flex items-center gap-2 font-medium"
        >
          <ArrowLeft size={18} />
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-wood-950 text-wood-900 dark:text-sand-100 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-serif font-light text-wood-900 dark:text-sand-100">
            Tu Selección <span className="text-wood-400 dark:text-sand-500 block md:inline text-lg md:text-3xl ml-0 md:ml-4 font-sans font-normal">({itemCount} artículos)</span>
          </h1>
          <button 
            onClick={() => router.push('/shop')}
            className="text-wood-600 dark:text-sand-400 hover:text-wood-900 dark:hover:text-sand-100 flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Continuar comprando
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-wood-900 rounded-xl shadow-sm border border-wood-100 dark:border-wood-800 overflow-hidden transition-colors duration-300">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-wood-100 dark:border-wood-800 bg-wood-50/50 dark:bg-wood-950/30 text-xs font-medium text-wood-500 dark:text-sand-400 uppercase tracking-wider">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-wood-100 dark:divide-wood-800">
                {cart.lines.map((line) => {
                  const unitPrice = line.merchandise.price.amount;
                  const lineTotal = unitPrice * line.quantity;

                  return (
                    <motion.div 
                      layout
                      key={line.id} 
                      className={`p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center group ${updating ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      <div className="col-span-1 md:col-span-6 flex gap-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-wood-100 dark:bg-wood-800 rounded-lg overflow-hidden flex-shrink-0">
                          {line.merchandise.image ? (
                            <img src={line.merchandise.image.url} alt={line.merchandise.image.altText || line.merchandise.productTitle} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wood-400"><ShoppingBag size={24} /></div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-1">{line.merchandise.productTitle}</h3>
                          <p className="text-sm text-wood-500 dark:text-sand-400 mb-2">{formatPrice(unitPrice, currencyCode)}</p>
                          <button onClick={() => handleRemoveItem(line.id)} disabled={updating} className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 mt-auto w-fit transition-colors">
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                        <div className="flex items-center border border-wood-200 dark:border-wood-700 rounded-lg overflow-hidden">
                          <button onClick={() => debouncedUpdate(line.id, Math.max(1, line.quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-wood-50 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors" disabled={line.quantity <= 1 || updating}>
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-medium text-wood-900 dark:text-sand-100">{line.quantity}</span>
                          <button onClick={() => debouncedUpdate(line.id, line.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-wood-50 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors" disabled={updating}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="hidden md:block col-span-2 text-right font-medium text-wood-600 dark:text-sand-300">{formatPrice(unitPrice, currencyCode)}</div>
                      <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center md:block">
                        <span className="md:hidden text-sm text-wood-500 dark:text-sand-400">Total:</span>
                        <span className="font-bold text-wood-900 dark:text-sand-100">{formatPrice(lineTotal, currencyCode)}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {/* Free shipping progress bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-wood-50/30 dark:bg-wood-800/30 p-6 rounded-xl border border-wood-100 dark:border-wood-800 border-dashed">
              <div className="flex items-center gap-3 text-wood-600 dark:text-sand-300 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-wood-800 border border-wood-100 dark:border-wood-700 flex items-center justify-center text-wood-400 dark:text-sand-400">
                  <ShoppingBag size={18} />
                </div>
                <div className="text-sm flex-1">
                  {qualifiesFreeShipping ? (
                    <p className="font-medium text-green-700 dark:text-green-400">¡Felicidades! Tienes envío gratis</p>
                  ) : (
                    <>
                      <p className="font-medium text-wood-900 dark:text-sand-100">Envío gratuito</p>
                      <p>En pedidos superiores a {formatPrice(FREE_SHIPPING_THRESHOLD)} — te faltan {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal, currencyCode)}</p>
                    </>
                  )}
                  <div className="mt-2 h-1.5 bg-wood-100 dark:bg-wood-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${qualifiesFreeShipping ? 'bg-green-500' : 'bg-wood-900 dark:bg-sand-100'}`}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-wood-400 dark:text-sand-500 w-full sm:w-auto">
                * Tiempos de entrega estimados en checkout
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-wood-900 rounded-xl shadow-sm border border-wood-100 dark:border-wood-800 p-6 md:p-8 sticky top-24 transition-colors duration-300">
              <h2 className="text-xl font-serif text-wood-900 dark:text-sand-100 mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-wood-600 dark:text-sand-300">
                  <span>Subtotal</span>
                  <span className="font-medium text-wood-900 dark:text-sand-100">{formatPrice(subtotal, currencyCode)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-green-700 dark:text-green-400">
                    <span>Descuento</span>
                    <span>-{formatPrice(discountTotal, currencyCode)}</span>
                  </div>
                )}
                <div className="flex justify-between text-wood-600 dark:text-sand-300">
                  <span>Envío estimado</span>
                  <span className="font-medium text-wood-900 dark:text-sand-100">{estimatedShipping === 0 ? 'Gratis' : formatPrice(estimatedShipping, currencyCode)}</span>
                </div>
                <div className="pt-4 border-t border-wood-100 dark:border-wood-800 flex justify-between items-end">
                  <span className="text-lg font-serif text-wood-900 dark:text-sand-100">Total</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-wood-900 dark:text-sand-100">{formatPrice(displayTotal, currencyCode)}</span>
                    <span className="text-xs text-wood-400 dark:text-sand-500">Incluye IVA</span>
                  </div>
                </div>
              </div>

              {/* Applied Promotions — pills */}
              {promotions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {promotions.map((promo) => (
                    <PromoPill key={promo.id} promo={promo} onRemove={handleRemovePromo} disabled={updating} />
                  ))}
                </div>
              )}

              {/* Coupon Code Input — calls Medusa Promotion Module */}
              <div className="mb-8">
                <label className="block text-xs font-medium text-wood-500 dark:text-sand-400 uppercase tracking-wide mb-2">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ej. DAVIDSON10"
                    disabled={couponLoading}
                    className="flex-1 px-4 py-2 bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-900 dark:text-sand-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-200 dark:focus:ring-wood-600 focus:border-wood-400 dark:focus:border-wood-500 text-sm placeholder:text-wood-400 dark:placeholder:text-wood-600 uppercase disabled:opacity-50"
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || couponLoading}
                    className="px-4 py-2 bg-wood-100 dark:bg-wood-800 text-wood-700 dark:text-sand-200 font-medium rounded-lg hover:bg-wood-200 dark:hover:bg-wood-700 transition-colors text-sm border border-transparent dark:border-wood-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Aplicar
                  </button>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                disabled={updating}
                className="w-full py-4 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 rounded-lg hover:bg-wood-800 dark:hover:bg-sand-200 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 font-medium shadow-md shadow-wood-900/10 dark:shadow-none disabled:opacity-50"
              >
                Proceder al Pago
                <ArrowRight size={18} />
              </button>
              
              <div className="mt-8 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-8 w-12 p-1 flex items-center justify-center bg-white dark:bg-wood-800 rounded border border-wood-200 dark:border-wood-700" title="Mercado Pago">
                  <img src={mercadoPagoLogo} alt="Mercado Pago" className="h-full w-auto object-contain" />
                </div>
                <div className="h-8 w-12 p-1.5 flex items-center justify-center bg-white dark:bg-wood-800 rounded border border-wood-200 dark:border-wood-700" title="Stripe">
                  <img src={stripeLogo} alt="Stripe" className="h-full w-auto object-contain" />
                </div>
                <div className="h-8 w-12 p-1.5 flex items-center justify-center bg-white dark:bg-wood-800 rounded border border-wood-200 dark:border-wood-700" title="PayPal">
                  <img src={paypalLogo} alt="PayPal" className="h-full w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Promo Pill (removable badge) ───

function PromoPill({ promo, onRemove, disabled }: {
  promo: CommercePromotion;
  onRemove: (code: string) => void;
  disabled: boolean;
}) {
  if (!promo.code) return null;

  const label = promo.application_method
    ? promo.application_method.type === 'percentage'
      ? `${promo.code} (-${promo.application_method.value}%)`
      : `${promo.code}`
    : promo.code;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
      <Tag className="w-3 h-3" />
      {label}
      <button
        onClick={() => onRemove(promo.code!)}
        disabled={disabled}
        className="ml-0.5 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50"
        aria-label={`Remover cupón ${promo.code}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
