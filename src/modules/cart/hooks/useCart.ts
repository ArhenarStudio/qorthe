"use client";

import { useState, useEffect, useCallback } from "react";
import { commerce, type CommerceCart } from "@/lib/commerce";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  description?: string;
}

function mapCartToItems(cart: CommerceCart | null): CartItem[] {
  if (!cart?.lines?.length) return [];
  return cart.lines.map((line) => ({
    id: line.id,
    name: line.merchandise.productTitle,
    price: line.merchandise.price.amount,
    quantity: line.quantity,
    image: line.merchandise.image?.url ?? "https://via.placeholder.com/120?text=Product",
    variantId: line.merchandise.id,
    description: undefined,
  }));
}

export function useCart() {
  const [cart, setCart] = useState<CommerceCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const cartItems = mapCartToItems(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart?.subtotal?.amount ?? 0;
  const checkoutUrl = cart?.checkoutUrl ?? null;

  const loadCart = useCallback(async (id: string) => {
    try {
      const data = await commerce.getCart(id);
      setCart(data);
      if (!data) {
        commerce.setStoredCartId(null);
      }
    } catch {
      commerce.setStoredCartId(null);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = commerce.getStoredCartId();
    if (id) {
      loadCart(id);
    } else {
      setIsLoading(false);
    }
  }, [loadCart]);

  const addItem = useCallback(
    async (variantId: string, quantity: number) => {
      setActionLoading(true);
      try {
        let id = commerce.getStoredCartId();
        if (!id) {
          id = await commerce.createCart();
          commerce.setStoredCartId(id);
        }
        const updated = await commerce.addToCart(id, variantId, quantity);
        setCart(updated);
      } catch (e) {
        console.error("addToCart failed", e);
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      const id = commerce.getStoredCartId();
      if (!id) return;
      setActionLoading(true);
      try {
        const updated = await commerce.updateCartLine(id, lineId, quantity);
        setCart(updated);
      } catch (e) {
        console.error("updateCartLine failed", e);
        throw e;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (lineId: string) => {
    const id = commerce.getStoredCartId();
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await commerce.removeFromCart(id, lineId);
      setCart(updated);
      if (!updated.lines?.length) {
        commerce.setStoredCartId(null);
      }
    } catch (e) {
      console.error("removeFromCart failed", e);
      throw e;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    commerce.setStoredCartId(null);
    setCart(null);
  }, []);

  return {
    cartItems,
    cartCount,
    subtotal,
    checkoutUrl,
    isLoading,
    actionLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart: () => {
      const id = commerce.getStoredCartId();
      if (id) {
        setIsLoading(true);
        loadCart(id);
      }
    },
  };
}
