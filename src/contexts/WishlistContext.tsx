"use client";

// ═══════════════════════════════════════════════════════════════
// WishlistContext — Global wishlist state (Supabase table)
//
// Provides: wishlist items, toggle, isInWishlist, loading
// Syncs with /api/account/wishlist (Supabase wishlists table)
// Optimistic updates for instant UI feedback.
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_title: string;
  product_thumbnail: string | null;
  product_price: number;
  created_at: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggle: (product: {
    id: string;
    variant_id?: string;
    title?: string;
    thumbnail?: string;
    price?: number;
  }) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  loading: false,
  toggle: async () => {},
  isInWishlist: () => false,
  count: 0,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!session?.access_token) {
      setWishlist([]);
      return;
    }
    try {
      const resp = await fetch("/api/account/wishlist", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        setWishlist(data.items || []);
      }
    } catch (err) {
      console.warn("[Wishlist] Fetch error:", err);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((w) => w.product_id === productId),
    [wishlist]
  );

  const toggle = useCallback(
    async (product: {
      id: string;
      variant_id?: string;
      title?: string;
      thumbnail?: string;
      price?: number;
    }) => {
      if (!session?.access_token) return;

      const inList = isInWishlist(product.id);
      setLoading(true);

      try {
        if (inList) {
          // Optimistic remove
          setWishlist((prev) => prev.filter((w) => w.product_id !== product.id));
          await fetch(`/api/account/wishlist?product_id=${product.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        } else {
          // Optimistic add
          const optimistic: WishlistItem = {
            id: `temp_${Date.now()}`,
            product_id: product.id,
            variant_id: product.variant_id || null,
            product_title: product.title || "",
            product_thumbnail: product.thumbnail || null,
            product_price: product.price || 0,
            created_at: new Date().toISOString(),
          };
          setWishlist((prev) => [optimistic, ...prev]);

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
        }
        // Refresh to get real data
        await fetchWishlist();
      } catch (err) {
        console.warn("[Wishlist] Toggle error:", err);
        fetchWishlist(); // Revert
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token, isInWishlist, fetchWishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggle, isInWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => useContext(WishlistContext);

// Backwards compat alias
export const useWishlist = useWishlistContext;
