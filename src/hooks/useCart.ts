"use client";

// ═══════════════════════════════════════════════════════════════
// useCart — Hook definitivo para carrito de MedusaJS
//
// Maneja todo el ciclo del carrito: crear, leer, agregar,
// actualizar, eliminar items. Persiste el cartId en localStorage.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { commerce } from "@/lib/commerce";
import type { CommerceCart } from "@/lib/commerce";

export function useCart() {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
        console.error("useCart init error:", err);
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
      } catch (err) {
        console.error("addItem error:", err);
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
        console.error("updateItem error:", err);
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
        console.error("removeItem error:", err);
      } finally {
        setUpdating(false);
      }
    },
    [cart]
  );

  const itemCount = cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  return {
    cart,
    loading,
    updating,
    itemCount,
    addItem,
    updateItem,
    removeItem,
  };
}
