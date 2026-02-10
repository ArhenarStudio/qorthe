"use client";

import { X, Check, Minus } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import type { ComparisonProduct } from "../types";

interface ProductComparisonProps {
  products: ComparisonProduct[];
  isDarkMode: boolean;
  language: "es" | "en";
  onRemoveProduct: (productId: string) => void;
  onClose: () => void;
}

export function ProductComparison({
  products,
  isDarkMode,
  language,
  onRemoveProduct,
  onClose,
}: ProductComparisonProps) {
  const translations = {
    es: {
      title: "Comparar Productos",
      price: "Precio",
      materials: "Materiales",
      dimensions: "Dimensiones",
      width: "Ancho",
      height: "Alto",
      depth: "Profundidad",
      features: "Características",
      craftTime: "Tiempo de Elaboración",
      addToCart: "Agregar al Carrito",
      close: "Cerrar",
      emptySlot: "Espacio vacío",
    },
    en: {
      title: "Compare Products",
      price: "Price",
      materials: "Materials",
      dimensions: "Dimensions",
      width: "Width",
      height: "Height",
      depth: "Depth",
      features: "Features",
      craftTime: "Craft Time",
      addToCart: "Add to Cart",
      close: "Close",
      emptySlot: "Empty slot",
    },
  };

  const t = translations[language];

  const displayProducts: (ComparisonProduct | null)[] = [...products];
  while (displayProducts.length < 3) {
    displayProducts.push(null);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90">
      <div className="min-h-screen p-4 md:p-8">
        <div
          className={`mx-auto max-w-7xl rounded-lg ${
            isDarkMode ? "bg-[#0a0806]" : "bg-white"
          }`}
        >
          <div
            className={`sticky top-0 z-10 flex items-center justify-between border-b p-6 backdrop-blur-sm ${
              isDarkMode
                ? "border-[#3d2f23] bg-[#0a0806]/95"
                : "border-gray-200 bg-white/95"
            }`}
          >
            <h2
              className={`text-2xl font-medium md:text-3xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h2>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isDarkMode
                  ? "text-[#b8a99a] hover:bg-[#2d2419]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                <tr>
                  <td
                    className={`p-6 align-top font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  />
                  {displayProducts.map((product, index) => (
                    <td
                      key={index}
                      className="min-w-[280px] p-6 align-top"
                    >
                      {product ? (
                        <div className="space-y-4">
                          <div className="relative aspect-square overflow-hidden rounded-lg">
                            <ImageWithFallback
                              src={product.images?.[0] ?? ""}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                            <button
                              onClick={() => onRemoveProduct(product.id)}
                              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <h3
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {product.name}
                          </h3>
                        </div>
                      ) : (
                        <div
                          className={`flex aspect-square items-center justify-center rounded-lg border-2 border-dashed ${
                            isDarkMode
                              ? "border-[#3d2f23] text-[#b8a99a]"
                              : "border-gray-300 text-gray-400"
                          }`}
                        >
                          <span className="text-sm">{t.emptySlot}</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td
                    className={`p-6 font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.price}
                  </td>
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product ? (
                        <span
                          className={`text-2xl font-bold ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          ${product.price.toLocaleString()} MXN
                        </span>
                      ) : (
                        <Minus
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td
                    className={`p-6 font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.dimensions}
                  </td>
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product ? (
                        product.dimensions ? (
                          <div
                            className={`space-y-1 text-sm ${
                              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                            }`}
                          >
                            <div>
                              {t.width}: {product.dimensions.width}
                            </div>
                            <div>
                              {t.height}: {product.dimensions.height}
                            </div>
                            <div>
                              {t.depth}: {product.dimensions.depth}
                            </div>
                          </div>
                        ) : (
                          <Minus
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                            }`}
                          />
                        )
                      ) : (
                        <Minus
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td
                    className={`p-6 font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.materials}
                  </td>
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product ? (
                        product.materials && product.materials.length > 0 ? (
                          <ul
                            className={`space-y-1 text-sm ${
                              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                            }`}
                          >
                            {product.materials.map((material, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8b6f47]" />
                                {material}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Minus
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                            }`}
                          />
                        )
                      ) : (
                        <Minus
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td
                    className={`p-6 font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.features}
                  </td>
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product ? (
                        product.features && product.features.length > 0 ? (
                          <ul
                            className={`space-y-2 text-sm ${
                              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                            }`}
                          >
                            {product.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8b6f47]" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Minus
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                            }`}
                          />
                        )
                      ) : (
                        <Minus
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td
                    className={`p-6 font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.craftTime}
                  </td>
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product ? (
                        product.craftTime ? (
                          <span
                            className={`text-sm ${
                              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                            }`}
                          >
                            {product.craftTime}
                          </span>
                        ) : (
                          <Minus
                            className={`h-5 w-5 ${
                              isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                            }`}
                          />
                        )
                      ) : (
                        <Minus
                          className={`h-5 w-5 ${
                            isDarkMode ? "text-[#3d2f23]" : "text-gray-300"
                          }`}
                        />
                      )}
                    </td>
                  ))}
                </tr>

                <tr
                  className={`border-t ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <td className="p-6" />
                  {displayProducts.map((product, index) => (
                    <td key={index} className="p-6">
                      {product && (
                        <button className="w-full rounded-lg bg-[#8b6f47] px-6 py-3 font-medium text-white transition-colors hover:bg-[#6d5638]">
                          {t.addToCart}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
