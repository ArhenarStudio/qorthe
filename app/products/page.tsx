"use client";

import { useState } from "react";
import { ProductCatalog, type CatalogProduct } from "@/modules/product";

// Mock products - luego conectar con Shopify
const mockProducts: CatalogProduct[] = [
  {
    id: "tabla-para-picar-y-charcuteria",
    name: "Tabla para Picar y Charcutería",
    category: "tables",
    price: 850,
    images: [
      "https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=600&h=600&fit=crop",
    ],
    description:
      "Tabla artesanal elaborada con maderas nobles mexicanas. Perfecta para picar, servir o decorar.",
  },
  {
    id: "mesa-nogal",
    name: "Mesa de Nogal",
    category: "tables",
    price: 12000,
    images: [
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&h=600&fit=crop",
    ],
    description: "Mesa de comedor en nogal macizo, diseño atemporal.",
  },
  {
    id: "silla-artesanal",
    name: "Silla Artesanal",
    category: "chairs",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1604988082740-e0d6a0ad7c6f?w=600&h=600&fit=crop",
    ],
    description: "Silla de respaldo alto, hecha a mano con maderas mexicanas.",
  },
];

export default function ProductsPage() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartItemsCount] = useState(0);

  return (
    <ProductCatalog
      products={mockProducts}
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
