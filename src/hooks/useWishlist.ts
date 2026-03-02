"use client";

// ═══════════════════════════════════════════════════════════════
// useWishlist — Hook for managing wishlist state
//
// Provides: items, isInWishlist, toggle, loading
// Auto-fetches on mount, optimistic updates for instant UI.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_title: string;
  product_thumbnail: string | null;
  product_price: number;
  created_at: string;
}

export function useWishlist() {
  const { session, user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    try {
      const resp = await fetch("/api/account/wishlist", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.warn("[useWishlist] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.product_id === productId),
    [items]
  );

  // Toggle wishlist (add/remove)
  const toggle = useCallback(
    async (product: {
      id: string;
      variant_id?: string;
      title?: string;
      thumbnail?: string;
      price?: number;
    }) => {
      if (!session?.access_token || !user) return;

      const inList = items.some((i) => i.product_id === product.id);

      if (inList) {
        // Optimistic remove
        setItems((prev) => prev.filter((i) => i.product_id !== product.id));
        try {
          await fetch(`/api/account/wishlist?product_id=${product.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        } catch {
          // Revert on error
          fetchWishlist();
        }
      } else {
        // Optimistic add
        const newItem: WishlistItem = {
          id: `temp_${Date.now()}`,
          product_id: product.id,
          variant_id: product.variant_id || null,
          product_title: product.title || "",
          product_thumbnail: product.thumbnail || null,
          product_price: product.price || 0,
          created_at: new Date().toISOString(),
        };
        setItems((prev) => [newItem, ...prev]);
        try {
          await fetch("/api/account/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              product_id: product.id,
              variant_id: product.variant_id,
              product_title: product.title,
              product_thumbnail: product.thumbnail,
              product_price: product.price,
            }),
          });
          fetchWishlist(); // Refresh to get real ID
        } catch {
          fetchWishlist();
        }
      }
    },
    [session?.access_token, user, items, fetchWishlist]
  );

  return { items, loading, isInWishlist, toggle, refetch: fetchWishlist, count: items.length };
}
