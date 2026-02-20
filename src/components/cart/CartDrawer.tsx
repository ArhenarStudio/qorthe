"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, Tag, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCartContext } from '@/contexts/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, loading, updating, itemCount, subtotal, currencyCode, updateItem, removeItem } = useCartContext();
  const [coupon, setCoupon] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const router = useRouter();

  const lines = cart?.lines ?? [];

  // Calculations
  const discount = isCouponApplied ? subtotal * 0.10 : 0;
  const shipping = subtotal > 3000 ? 0 : 250;
  const total = subtotal - discount + shipping;
  const freeShippingThreshold = 3000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleUpdateQuantity = async (lineId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    await updateItem(lineId, newQty);
  };

  const handleRemoveItem = async (lineId: string) => {
    await removeItem(lineId);
    toast.info("Producto eliminado del carrito");
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'DAVIDSON10') {
      setIsCouponApplied(true);
      toast.success("Cupón aplicado correctamente");
    } else {
      toast.error("Cupón inválido");
    }
  };

  const formatPrice = (amount: number) => {
    return `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
                    {remainingForFreeShipping > 0 
                      ? <span>Agrega <span className="font-bold text-wood-900 dark:text-sand-100">{formatPrice(remainingForFreeShipping)}</span> para envío gratis</span>
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
                lines.map((line) => (
                  <motion.div 
                    layout
                    key={line.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex gap-4 group"
                  >
                    <div className="w-24 h-24 shrink-0 overflow-hidden rounded-md bg-wood-100 dark:bg-wood-800 relative">
                      {line.merchandise.image ? (
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
                          <h3 className="font-serif text-wood-900 dark:text-sand-100 text-lg leading-tight">{line.merchandise.productTitle}</h3>
                          <button onClick={() => handleRemoveItem(line.id)} disabled={updating} className="text-wood-300 dark:text-wood-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 -mr-2 disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-wood-200 dark:border-wood-700 rounded-md">
                          <button onClick={() => handleUpdateQuantity(line.id, line.quantity, -1)} disabled={updating || line.quantity <= 1} className="p-1 hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors disabled:opacity-30">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-wood-900 dark:text-sand-100">{line.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(line.id, line.quantity, 1)} disabled={updating} className="p-1 hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors disabled:opacity-30">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-medium text-wood-900 dark:text-sand-100">
                          {formatPrice(line.merchandise.price.amount * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {lines.length > 0 && (
              <div className="bg-white dark:bg-wood-900 border-t border-wood-900/5 dark:border-wood-800 p-6 space-y-4 transition-colors duration-300">
                
                <form onSubmit={handleApplyCoupon} className="relative">
                  <input 
                    type="text" 
                    placeholder="Código de descuento"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    disabled={isCouponApplied}
                    className="w-full bg-sand-100 dark:bg-wood-800 border border-wood-200 dark:border-wood-700 rounded-lg py-3 pl-10 pr-20 text-sm text-wood-900 dark:text-sand-100 outline-none focus:border-wood-900 dark:focus:border-sand-100 transition-colors uppercase placeholder:normal-case placeholder:text-wood-400 dark:placeholder:text-wood-500 disabled:opacity-50"
                  />
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-400 dark:text-wood-500" />
                  <button 
                    type="submit"
                    disabled={!coupon || isCouponApplied}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-wood-900 dark:text-sand-100 hover:text-accent-gold dark:hover:text-accent-gold disabled:text-wood-300 dark:disabled:text-wood-600 transition-colors px-2 py-1"
                  >
                    {isCouponApplied ? 'APLICADO' : 'APLICAR'}
                  </button>
                </form>

                <div className="space-y-2 pt-2 text-sm text-wood-600 dark:text-sand-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {isCouponApplied && (
                    <div className="flex justify-between text-green-700 dark:text-green-400">
                      <span>Descuento (10%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif text-wood-900 dark:text-sand-100 font-bold pt-2 border-t border-dashed border-wood-200 dark:border-wood-700">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
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
