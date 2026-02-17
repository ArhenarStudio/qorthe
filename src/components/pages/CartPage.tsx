import React, { useState } from 'react';
"use client";

import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { MOCK_CART_ITEMS } from '@/data/mockData';
import { motion } from 'motion/react';
const mercadoPagoLogo = '/images/mercado-pago-logo.png';
const stripeLogo = '/images/stripe-logo.png';
const paypalLogo = '/images/paypal-logo.png';

export const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [couponCode, setCouponCode] = useState('');

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 150; // Flat rate shipping for example
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 dark:bg-wood-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="w-16 h-16 bg-wood-100 dark:bg-wood-800 rounded-full flex items-center justify-center mb-6 text-wood-600 dark:text-sand-300">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-serif text-wood-900 dark:text-sand-100 mb-2">Tu carrito está vacío</h2>
        <p className="text-wood-500 dark:text-sand-400 mb-8 text-center max-w-md">Parece que aún no has añadido ninguna de nuestras selecciones exclusivas.</p>
        <button 
          onClick={() => router.push('/')}
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
            Tu Selección <span className="text-wood-400 dark:text-sand-500 block md:inline text-lg md:text-3xl ml-0 md:ml-4 font-sans font-normal">({cartItems.length} artículos)</span>
          </h1>
          <button 
            onClick={() => router.push('/')}
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
                {cartItems.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center group"
                  >
                    {/* Product Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-4">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-wood-100 dark:bg-wood-800 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="font-serif text-lg text-wood-900 dark:text-sand-100 mb-1">{item.name}</h3>
                        <p className="text-sm text-wood-500 dark:text-sand-400 mb-2">{item.variant}</p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 mt-auto w-fit transition-colors"
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-start md:justify-center">
                      <div className="flex items-center border border-wood-200 dark:border-wood-700 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-wood-50 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium text-wood-900 dark:text-sand-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-wood-50 dark:hover:bg-wood-800 text-wood-600 dark:text-sand-300 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Price - Mobile: Hidden, Desktop: Visible */}
                    <div className="hidden md:block col-span-2 text-right font-medium text-wood-600 dark:text-sand-300">
                      ${item.price.toLocaleString()}
                    </div>

                    {/* Total */}
                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-end items-center md:block">
                      <span className="md:hidden text-sm text-wood-500 dark:text-sand-400">Total:</span>
                      <span className="font-bold text-wood-900 dark:text-sand-100">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-wood-50/30 dark:bg-wood-800/30 p-6 rounded-xl border border-wood-100 dark:border-wood-800 border-dashed">
              <div className="flex items-center gap-3 text-wood-600 dark:text-sand-300 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-wood-800 border border-wood-100 dark:border-wood-700 flex items-center justify-center text-wood-400 dark:text-sand-400">
                  <ShoppingBag size={18} />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-wood-900 dark:text-sand-100">Envío gratuito</p>
                  <p>En pedidos superiores a $3,500</p>
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
                  <span className="font-medium text-wood-900 dark:text-sand-100">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-wood-600 dark:text-sand-300">
                  <span>Envío estimado</span>
                  <span className="font-medium text-wood-900 dark:text-sand-100">${shipping.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-wood-100 dark:border-wood-800 flex justify-between items-end">
                  <span className="text-lg font-serif text-wood-900 dark:text-sand-100">Total</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-wood-900 dark:text-sand-100">${total.toLocaleString()}</span>
                    <span className="text-xs text-wood-400 dark:text-sand-500">Incluye IVA</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-8">
                <label className="block text-xs font-medium text-wood-500 dark:text-sand-400 uppercase tracking-wide mb-2">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ej. WELCOME10"
                    className="flex-1 px-4 py-2 bg-white dark:bg-wood-800 border border-wood-200 dark:border-wood-700 text-wood-900 dark:text-sand-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-wood-200 dark:focus:ring-wood-600 focus:border-wood-400 dark:focus:border-wood-500 text-sm placeholder:text-wood-400 dark:placeholder:text-wood-600"
                  />
                  <button className="px-4 py-2 bg-wood-100 dark:bg-wood-800 text-wood-700 dark:text-sand-200 font-medium rounded-lg hover:bg-wood-200 dark:hover:bg-wood-700 transition-colors text-sm border border-transparent dark:border-wood-700">
                    Aplicar
                  </button>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-wood-900 dark:bg-sand-100 text-white dark:text-wood-900 rounded-lg hover:bg-wood-800 dark:hover:bg-sand-200 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2 font-medium shadow-md shadow-wood-900/10 dark:shadow-none"
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