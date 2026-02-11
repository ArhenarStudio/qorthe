"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { ProductComparison } from "./ProductComparison";
import type { ComparisonProduct } from "../types";
import type { CatalogProduct } from "@/modules/product";
import { useAppState } from "@/modules/app-state";

interface ProductComparisonPageClientProps {
  products: CatalogProduct[];
}

function catalogToComparison(p: CatalogProduct): ComparisonProduct {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.images ?? [],
  };
}

export function ProductComparisonPageClient({
  products,
}: ProductComparisonPageClientProps) {
  const { language, isDarkMode } = useAppState();
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>(
    []
  );
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const translations = {
    es: {
      nav: { products: "Productos", about: "Acerca de", contact: "Contacto" },
      title: "Comparar Productos",
      subtitle: "Selecciona hasta 3 productos para comparar sus características",
      selectProducts: "Seleccionar Productos",
      compare: "Comparar",
      selectedCount: (n: number) =>
        n === 1 ? "1 producto seleccionado" : `${n} productos seleccionados`,
      noProducts: "No hay productos seleccionados",
      selectPrompt: "Selecciona productos para comenzar a comparar",
    },
    en: {
      nav: { products: "Products", about: "About", contact: "Contact" },
      title: "Compare Products",
      subtitle: "Select up to 3 products to compare their features",
      selectProducts: "Select Products",
      compare: "Compare",
      selectedCount: (n: number) =>
        n === 1 ? "1 product selected" : `${n} products selected`,
      noProducts: "No products selected",
      selectPrompt: "Select products to start comparing",
    },
  };

  const t = translations[language];

  const addProduct = (product: CatalogProduct) => {
    const comp = catalogToComparison(product);
    if (
      selectedProducts.length < 3 &&
      !selectedProducts.find((p) => p.id === comp.id)
    ) {
      setSelectedProducts([...selectedProducts, comp]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
  };

  const displayProducts = products.slice(0, 12);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0806] text-[#f5f0e8]" : "bg-white text-gray-900"
      }`}
    >
      <main className="mx-auto max-w-[1440px] px-4 pb-24 pt-0 md:px-8 lg:px-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-medium md:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <p
            className={`text-lg ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.subtitle}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl">{t.selectProducts}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {displayProducts.map((product) => {
              const isSelected = selectedProducts.find((p) => p.id === product.id);
              const canAdd = selectedProducts.length < 3;

              return (
                <button
                  key={product.id}
                  onClick={() =>
                    isSelected
                      ? removeProduct(product.id)
                      : addProduct(product)
                  }
                  disabled={!canAdd && !isSelected}
                  className={`relative rounded-lg border p-4 transition-all ${
                    isSelected
                      ? "border-[#8b6f47] bg-[#8b6f47]/10"
                      : isDarkMode
                        ? "border-[#3d2f23] bg-[#0a0806] hover:border-[#8b6f47]"
                        : "border-gray-200 bg-white hover:border-[#8b6f47]"
                  } ${!canAdd && !isSelected ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <ImageWithFallback
                    src={product.images?.[0] ?? ""}
                    alt={product.name}
                    className="mb-2 h-32 w-full rounded object-cover"
                  />
                  <p className="line-clamp-2 text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-[#8b6f47]">
                    ${product.price.toLocaleString("es-MX")}
                  </p>
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#8b6f47]">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="flex flex-col items-center gap-6">
            <p className="text-center text-sand-600 dark:text-sand-400">
              {t.selectedCount(selectedProducts.length)}
            </p>
            <button
              onClick={() => setShowComparisonModal(true)}
              className="rounded-lg bg-[#8b6f47] px-8 py-3 font-medium text-white transition-colors hover:bg-[#6d5638]"
            >
              {t.compare}
            </button>
            {showComparisonModal && (
              <ProductComparison
                products={selectedProducts}
                isDarkMode={isDarkMode}
                language={language}
                onRemoveProduct={removeProduct}
                onClose={() => setShowComparisonModal(false)}
              />
            )}
          </div>
        ) : (
          <div
            className={`rounded-lg border py-16 text-center ${
              isDarkMode
                ? "border-[#3d2f23] bg-[#2d2419]"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <p className="mb-2 text-xl">{t.noProducts}</p>
            <p
              className={
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }
            >
              {t.selectPrompt}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
