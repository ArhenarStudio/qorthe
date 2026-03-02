"use client";

// ═══════════════════════════════════════════════════════════════
// WishlistContext — Global wishlist state
//
// Provides: wishlist items, toggle, isInWishlist, loading
// Syncs with /api/wishlist (Supabase user_metadata)
// ═══════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface WishlistItem {
  product_id: string;
  variant_id?: string;
  added_at: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  loading: boolean;
  toggle: (productId: string, variantId?: string) => Promise<void>;
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

  // Fetch wishlist on auth
  useEffect(() => {
    if (!session?.access_token) {
      setWishlist([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const resp = await fetch("/api/wishlist", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setWishlist(data.wishlist || []);
        }
      } catch (err) {
        console.warn("[Wishlist] Fetch error:", err);
      }
    };

    fetchWishlist();
  }, [session?.access_token]);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((w) => w.product_id === productId),
    [wishlist]
  );

  const toggle = useCallback(
    async (productId: string, variantId?: string) => {
      if (!session?.access_token) return;

      const inList = isInWishlist(productId);
      setLoading(true);

      try {
        if (inList) {
          // Remove
          const resp = await fetch(`/api/wishlist?product_id=${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            setWishlist(data.wishlist || []);
          }
        } else {
          // Add
          const resp = await fetch("/api/wishlist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ product_id: productId, variant_id: variantId }),
          });
          if (resp.ok) {
            const data = await resp.json();
            setWishlist(data.wishlist || []);
          }
        }
      } catch (err) {
        console.warn("[Wishlist] Toggle error:", err);
      } finally {
        setLoading(false);
      }
    },
    [session?.access_token, isInWishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggle, isInWishlist, count: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
