"use client";

import React, { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Loader2, Scissors } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/contexts/CartContext';
import { getShippingEstimate, formatPrice } from '@/config/shipping';
import { LASER_SERVICE_VARIANT_ID } from '@/config/laser-engraving';
import type { CommercePromotion } from '@/lib/commerce';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart, loading, updating, itemCount, subtotal, discountTotal,
    promotions, updateItem, removeItem, removePromo,
  } = useCartContext();
  const router = useRouter();

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

  const lines = cart?.lines ?? [];
  const { qualifiesFreeShipping, estimatedShipping, remainingForFree, progressPercent } = getShippingEstimate(subtotal);
  const displayTotal = subtotal + estimatedShipping - discountTotal;

  const handleUpdateQuantity = (lineId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    debouncedUpdate(lineId, newQty);
  };

  const handleRemoveItem = async (lineId: string) => {
    await removeItem(lineId);
    toast.info("Producto eliminado del carrito");
  };

  const handleRemovePromo = async (code: string) => {
    await removePromo(code);
    toast.info("Cupón removido");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-wood-900/60 dark:bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-md bg-sand-100 dark:bg-wood-900 shadow-2xl flex flex-col border-l border-wood-900/10 dark:border-sand-100/10 transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-wood-900/5 dark:border-wood-800 bg-white dark:bg-wood-900 transition-colors duration-300">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 font-['Playfair_Display'] flex items-center gap-3">
                  Tu Compra 
                  <span className="text-sm font-sans text-wood-400 dark:text-sand-400 font-normal bg-wood-100 dark:bg-wood-800 px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-wood-50 dark:hover:bg-wood-800 rounded-full transition-colors">
                  <X className="w-5 h-5 text-wood-500 dark:text-sand-400" />
                </button>
              </div>
              
              {lines.length > 0 && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-wood-600 dark:text-sand-300 mb-2">
                    {remainingForFree > 0 
                      ? <span>Agrega <span className="font-bold text-wood-900 dark:text-sand-100">{formatPrice(remainingForFree)}</span> para envío gratis</span>
                      : <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1">¡Felicidades! Tienes envío gratis</span>
                    }
                  </p>
                  <div className="h-1 bg-wood-100 dark:bg-wood-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-wood-900 dark:bg-sand-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-wood-400 animate-spin" />
                </div>
              ) : lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-wood-400 dark:text-sand-500 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-medium text-wood-900 dark:text-sand-100">Tu carrito está vacío</p>
                  <button onClick={onClose} className="text-sm text-wood-900 dark:text-sand-100 underline hover:text-accent-gold dark:hover:text-accent-gold transition-colors">
                    Continuar comprando
                  </button>
                </div>
              ) : (
                lines.map((line) => {
                  const isLaserService = line.merchandise.id === LASER_SERVICE_VARIANT_ID;
                  return (
                  <motion.div 
                    layout
                    key={line.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={`flex gap-4 group ${isLaserService ? 'opacity-80 pl-4 border-l-2 border-amber-300 dark:border-amber-700' : ''}`}
                  >
                    <div className={`${isLaserService ? 'w-16 h-16' : 'w-24 h-24'} shrink-0 overflow-hidden rounded-md bg-wood-100 dark:bg-wood-800 relative`}>
                      {isLaserService ? (
                        <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
                          <Scissors className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                      ) : line.merchandise.image ? (
                        <img src={line.merchandise.image.url} alt={line.merchandise.productTitle} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-wood-300 dark:text-wood-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                      <div className="flex justify-between items-start">
                      <h3 className={`font-serif text-wood-900 dark:text-sand-100 leading-tight ${isLaserService ? 'text-sm' : 'text-lg'}`}>{line.merchandise.productTitle}</h3>
                      <button onClick={() => handleRemoveItem(line.id)} disabled={updating} className="text-wood-300 dark:text-wood-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 -mr-2 disabled:opacity-50">
                      <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                        {/* Laser personalization badge on the main product */}
                        {!isLaserService && ((line.metadata as any)?.custom_design || (line.metadata as any)?.custom_designs) && (() => {
                          const designs = (line.metadata as any)?.custom_designs;
                          const extraCount = (line.metadata as any)?.extra_design_count ?? 0;
                          const totalDesigns = designs?.length ?? 1;
                          return (
                            <>
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200 dark:border-green-800">
                                <Scissors className="w-3 h-3" /> Grabado láser incluido
                              </span>
                              {extraCount > 0 && (
                                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                                  +{extraCount} diseño{extraCount > 1 ? 's' : ''} extra
                                </span>
                              )}
                            </>
                          );
                        })()}
                        {/* Service label for laser engraving extra designs */}
                        {isLaserService && (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            Diseño{line.quantity > 1 ? 's' : ''} adicional{line.quantity > 1 ? 'es' : ''} de grabado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {isLaserService ? (
                          <span className="text-xs text-wood-500 dark:text-sand-400">×{line.quantity}</span>
                        ) : (
                        <div className="flex items-center border border-wood-200 dark:border-wood-700 rounded-md">
                          <button onClick={() => handleUpdateQuantity(line.id, line.quantity, -1)} disabled={updating || line.quantity <= 1} className="p-1 hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors disabled:opacity-30">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-wood-900 dark:text-sand-100">{line.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(line.id, line.quantity, 1)} disabled={updating} className="p-1 hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors disabled:opacity-30">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        )}
                        <span className={`font-medium ${isLaserService ? 'text-sm text-amber-700 dark:text-amber-400' : 'text-wood-900 dark:text-sand-100'}`}>
                          {formatPrice(line.merchandise.price.amount * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary — NO coupon input (that's in CartPage/Checkout). 
                Only shows applied promos as removable pills. */}
            {lines.length > 0 && (
              <div className="bg-white dark:bg-wood-900 border-t border-wood-900/5 dark:border-wood-800 p-6 space-y-4 transition-colors duration-300">
                
                {/* Applied Promotions — pills */}
                {promotions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {promotions.map((promo) => (
                      <PromoPill key={promo.id} promo={promo} onRemove={handleRemovePromo} disabled={updating} />
                    ))}
                  </div>
                )}

                <div className="space-y-2 pt-2 text-sm text-wood-600 dark:text-sand-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span>Descuento</span>
                      <span>-{formatPrice(discountTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío estimado</span>
                    <span>{estimatedShipping === 0 ? 'Gratis' : formatPrice(estimatedShipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif text-wood-900 dark:text-sand-100 font-bold pt-2 border-t border-dashed border-wood-200 dark:border-wood-700">
                    <span>Total</span>
                    <span>{formatPrice(displayTotal)}</span>
                  </div>
                </div>

                {updating && (
                  <div className="flex items-center justify-center gap-2 text-xs text-wood-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Actualizando...
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={() => { onClose(); router.push('/cart'); }}
                    className="w-full py-3 text-sm font-medium text-wood-600 dark:text-sand-300 hover:text-wood-900 dark:hover:text-sand-100 underline decoration-1 underline-offset-4 transition-colors"
                  >
                    Ver Carrito Completo
                  </button>
                  <button 
                    onClick={() => { onClose(); router.push('/checkout'); }}
                    className="w-full bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900 py-4 rounded-sm font-medium hover:bg-wood-800 dark:hover:bg-sand-200 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-wood-900/10 dark:shadow-none group"
                  >
                    Proceder al Pago
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
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
