"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  getStoredCartId,
  setStoredCartId,
  type ShopifyCart,
} from "@/lib/shopify";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  description?: string;
}

function mapCartToItems(cart: ShopifyCart | null): CartItem[] {
  if (!cart?.lines?.nodes?.length) return [];
  return cart.lines.nodes.map((line) => {
    const merch = line.merchandise;
    const product = "product" in merch ? merch.product : null;
    const title = product?.title ?? "Product";
    const price = merch.price?.amount ? parseFloat(merch.price.amount) : 0;
    const image =
      merch.image?.url ?? "https://via.placeholder.com/120?text=Product";
    return {
      id: line.id,
      name: title,
      price,
      quantity: line.quantity,
      image,
      variantId: merch.id,
      description: undefined,
    };
  });
}

function getSubtotal(cart: ShopifyCart | null): number {
  if (!cart?.cost?.subtotalAmount?.amount) return 0;
  return parseFloat(cart.cost.subtotalAmount.amount);
}

export function useCart() {
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const cartId = getStoredCartId();
  const cartItems = mapCartToItems(cart);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = getSubtotal(cart);
  const checkoutUrl = cart?.checkoutUrl ?? null;

  const loadCart = useCallback(async (id: string) => {
    try {
      const data = await getCart(id);
      setCart(data);
      if (!data) {
        setStoredCartId(null);
      }
    } catch {
      setStoredCartId(null);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = getStoredCartId();
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
        let id = getStoredCartId();
        if (!id) {
          id = await createCart();
          setStoredCartId(id);
        }
        const updated = await addToCart(id, variantId, quantity);
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
      const id = getStoredCartId();
      if (!id) return;
      setActionLoading(true);
      try {
        const updated = await updateCartLine(id, lineId, quantity);
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
    const id = getStoredCartId();
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await removeFromCart(id, lineId);
      setCart(updated);
      if (!updated.lines?.nodes?.length) {
        setStoredCartId(null);
      }
    } catch (e) {
      console.error("removeFromCart failed", e);
      throw e;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const clearCart = useCallback(() => {
    setStoredCartId(null);
    setCart(null);
  }, []);

  return {
    cartItems,
    cartCount,
    subtotal,
    checkoutUrl,
    isLoading,
    actionLoading: actionLoading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart: () => {
      const id = getStoredCartId();
      if (id) {
        setIsLoading(true);
        loadCart(id);
      }
    },
  };
}
