"use client";

// ═══════════════════════════════════════════════════════════════
// useProducts — Hook definitivo para productos de MedusaJS
//
// Expone CommerceProduct directamente. Los componentes consumen
// la interfaz del commerce layer, no datos mock.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { commerce } from "@/lib/commerce";
import type { CommerceProduct } from "@/lib/commerce";

export function useProducts(limit = 50) {
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        setLoading(true);
        const data = await commerce.getProducts(limit);
        if (!cancelled) {
          setProducts(data);
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

  return { products, loading, error };
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
