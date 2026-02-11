"use client";

import { ProductCatalog, type CatalogProduct } from "@/modules/product";

interface ProductsCatalogClientProps {
  products: CatalogProduct[];
}

export function ProductsCatalogClient({ products }: ProductsCatalogClientProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-sand-50 px-4 text-center">
        <p className="text-lg text-taupe-600">
          No hay productos en el catálogo por el momento. Vuelve pronto.
        </p>
        <a
          href="/"
          className="mt-4 text-walnut-600 underline hover:text-walnut-700"
        >
          Volver al inicio
        </a>
      </div>
    );
  }

  return (
    <ProductCatalog
      products={products}
      onViewProduct={(productId) =>
        (window.location.href = `/products/${productId}`)
      }
    />
  );
}
