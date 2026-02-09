"use client";

import { useState } from "react";
import { ProductCatalog, type CatalogProduct } from "@/modules/product";

interface ProductsCatalogClientProps {
  products: CatalogProduct[];
}

export function ProductsCatalogClient({ products }: ProductsCatalogClientProps) {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartItemsCount] = useState(0);

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
      onBackToHome={() => (window.location.href = "/")}
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      cartItemsCount={cartItemsCount}
      onNavigateCart={() => (window.location.href = "/cart")}
      onNavigateAccount={() => (window.location.href = "/login")}
    />
  );
}
