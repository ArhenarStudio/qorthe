"use client";

import { useState } from "react";
import { CartPage } from "@/modules/cart";

export default function CartPageRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock data - después conectar con Shopify
  const [items, setItems] = useState([
    {
      id: "1",
      name: "Tabla de Cortar Artesanal",
      price: 850,
      quantity: 2,
      image: "https://via.placeholder.com/120",
      description: "Tabla artesanal de madera de nogal",
    },
  ]);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <CartPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() =>
        setLanguage((lang) => (lang === "es" ? "en" : "es"))
      }
      onToggleDarkMode={() => setIsDarkMode((mode) => !mode)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/login")}
      onContinueShopping={() => (window.location.href = "/products")}
      items={items}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
      onCheckout={() => (window.location.href = "/checkout")}
    />
  );
}
