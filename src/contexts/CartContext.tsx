"use client";

// ═══════════════════════════════════════════════════════════════
// CartContext — Estado global del carrito (MedusaJS)
//
// Provee: cart, loading, updating, itemCount, addItem,
// updateItem, removeItem, isDrawerOpen, toggleDrawer
//
// Todos los componentes que necesiten el carrito consumen
// este context en vez de instanciar useCart directamente.
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { commerce } from "@/lib/commerce";
import type { CommerceCart } from "@/lib/commerce";

interface CartContextType {
  cart: CommerceCart | null;
  loading: boolean;
  updating: boolean;
  itemCount: number;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  loading: true,
  updating: false,
  itemCount: 0,
  subtotal: 0,
  shippingTotal: 0,
  discountTotal: 0,
  taxTotal: 0,
  total: 0,
  currencyCode: "MXN",
  addItem: async () => {},
  updateItem: async () => {},
  removeItem: async () => {},
  clearCart: () => {},
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load or create cart on mount
  useEffect(() => {
    let cancelled = false;

    async function initCart() {
      try {
        setLoading(true);
        const storedId = commerce.getStoredCartId();

        if (storedId) {
          const existing = await commerce.getCart(storedId);
          if (existing && !cancelled) {
            setCart(existing);
            setLoading(false);
            return;
          }
        }

        // No cart found or expired — create new
        const newId = await commerce.createCart();
        commerce.setStoredCartId(newId);
        const newCart = await commerce.getCart(newId);
        if (!cancelled) setCart(newCart);
      } catch (err) {
        console.error("[CartContext] init error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initCart();
    return () => { cancelled = true; };
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      if (!cart) return;
      try {
        setUpdating(true);
        const updated = await commerce.addToCart(cart.id, variantId, quantity);
        setCart(updated);
        setIsDrawerOpen(true); // Auto-open drawer on add
      } catch (err) {
        console.error("[CartContext] addItem error:", err);
      } finally {
        setUpdating(false);
      }
    },
    [cart]
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart) return;
      try {
        setUpdating(true);
        const updated = await commerce.updateCartLine(cart.id, lineId, quantity);
        setCart(updated);
      } catch (err) {
        console.error("[CartContext] updateItem error:", err);
      } finally {
        setUpdating(false);
      }
    },
    [cart]
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      if (!cart) return;
      try {
        setUpdating(true);
        const updated = await commerce.removeFromCart(cart.id, lineId);
        setCart(updated);
      } catch (err) {
        console.error("[CartContext] removeItem error:", err);
      } finally {
        setUpdating(false);
      }
    },
    [cart]
  );

  const itemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;
  const subtotal = cart?.subtotal.amount ?? 0;
  const shippingTotal = cart?.shippingTotal.amount ?? 0;
  const discountTotal = cart?.discountTotal.amount ?? 0;
  const taxTotal = cart?.taxTotal.amount ?? 0;
  const total = cart?.total.amount ?? 0;
  const currencyCode = cart?.subtotal.currencyCode ?? "MXN";

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen(prev => !prev), []);

  const clearCart = useCallback(() => {
    setCart(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medusa_cart_id');
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart, loading, updating, itemCount,
        subtotal, shippingTotal, discountTotal, taxTotal, total,
        currencyCode,
        addItem, updateItem, removeItem, clearCart,
        isDrawerOpen, openDrawer, closeDrawer, toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
};
