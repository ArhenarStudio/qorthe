"use client";

import { useState } from "react";
import { PaymentPage } from "@/modules/checkout";

const mockCartItems = [
  {
    id: "1",
    name: "Tabla de Cortar Artesanal",
    price: 850,
    quantity: 2,
    image: "https://via.placeholder.com/120",
  },
];

const subtotal = 1700;
const shipping = 0;
const total = 1700;

export default function PaymentRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handlePlaceOrder = async (_paymentData: unknown) => {
    // Simular procesamiento y redirigir a confirmación con orderId
    const orderId = "ORD-" + Date.now();
    window.location.href = `/checkout/confirmation?orderId=${orderId}`;
  };

  return (
    <PaymentPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateCheckout={() => (window.location.href = "/checkout")}
      onPlaceOrder={handlePlaceOrder}
      cartItems={mockCartItems}
      subtotal={subtotal}
      shipping={shipping}
      total={total}
    />
  );
}
