"use client";

// ═══════════════════════════════════════════════════════════════
// useProducts — Hook definitivo para productos de MedusaJS
//
// Expone CommerceProduct directamente. Los componentes consumen
// la interfaz del commerce layer, no datos mock.
//
// Fase 9.D: Soporta filtrado por acceso anticipado (early access).
// Productos con metadata "launch_date" futura solo son visibles
// para usuarios cuyo tier tenga early_access_hours suficiente.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo } from "react";
import { commerce } from "@/lib/commerce";
import type { CommerceProduct } from "@/lib/commerce";
import {
  filterProductsByAccess,
  annotateProductsWithAccess,
  type EarlyAccessInfo,
} from "@/lib/early-access";
import type { LoyaltyConfig } from "@/data/loyalty";

export interface ProductWithAccess {
  product: CommerceProduct;
  earlyAccess: EarlyAccessInfo;
}

export function useProducts(
  limit = 50,
  userTierId?: string | null,
  loyaltyConfig?: LoyaltyConfig
) {
  const [allProducts, setAllProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setLoading(true);
        const data = await commerce.getProducts(limit);
        if (!cancelled) {
          setAllProducts(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading products");
          console.error("useProducts error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [limit]);

  // Filter by early access tier
  const products = useMemo(
    () => filterProductsByAccess(allProducts, userTierId, loyaltyConfig),
    [allProducts, userTierId, loyaltyConfig]
  );

  // Annotated list with early access info (for badges)
  const productsWithAccess: ProductWithAccess[] = useMemo(
    () => annotateProductsWithAccess(allProducts, userTierId, loyaltyConfig),
    [allProducts, userTierId, loyaltyConfig]
  );

  return { products, productsWithAccess, loading, error };
}

export function useProduct(handle: string) {
  const [product, setProduct] = useState<CommerceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;

    async function fetch() {
      try {
        setLoading(true);
        const data = await commerce.getProductByHandle(handle);
        if (!cancelled) {
          setProduct(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [handle]);

  return { product, loading, error };
}
