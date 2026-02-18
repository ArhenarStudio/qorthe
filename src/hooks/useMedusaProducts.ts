"use client";

// ═══════════════════════════════════════════════════════════════
// useMedusaProducts — Hook para consumir productos de MedusaJS
//
// Mapea CommerceProduct (del adapter) → Product (interfaz del UI)
// para que los componentes existentes funcionen sin cambios.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { commerce, type CommerceProduct } from "@/lib/commerce";
import { getMetafield } from "@/lib/commerce/types";
import type { Product } from "@/data/products";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1621868315576-90f772719277?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1626202029524-7667812f82c4?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599309600989-166f4e158652?q=80&w=1000&auto=format&fit=crop",
];

function mapToProduct(cp: CommerceProduct): Product {
  const length = getMetafield(cp, "dimensions", "length") ?? "";
  const width = getMetafield(cp, "dimensions", "width") ?? "";
  const height = getMetafield(cp, "dimensions", "height") ?? "";
  const dimensions = length && width ? `${length}cm x ${width}cm x ${height}cm` : "";

  const images = cp.featuredImage
    ? [cp.featuredImage.url, ...PLACEHOLDER_IMAGES.slice(1)]
    : [...PLACEHOLDER_IMAGES];

  return {
    id: cp.id,
    slug: cp.handle,
    name: cp.title,
    price: cp.priceRange.minVariantPrice.amount,
    category: "Tablas de Quesos" as Product["category"],
    description: cp.description,
    material: getMetafield(cp, "materials", "primary_wood") ?? "",
    dimensions,
    images,
    inStock: cp.variants.some((v) => v.availableForSale),
    isNew: false,
    rating: 4.8,
    reviews: 0,
  };
}

export function useMedusaProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        const medusaProducts = await commerce.getProducts(50);
        if (!cancelled) {
          setProducts(medusaProducts.map(mapToProduct));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load products");
          console.error("Failed to fetch Medusa products:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}

export function useMedusaProduct(handle: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [commerceProduct, setCommerceProduct] = useState<CommerceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        const cp = await commerce.getProductByHandle(handle);
        if (!cancelled) {
          if (cp) {
            setProduct(mapToProduct(cp));
            setCommerceProduct(cp);
          } else {
            setProduct(null);
            setCommerceProduct(null);
          }
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => { cancelled = true; };
  }, [handle]);

  return { product, commerceProduct, loading, error };
}
