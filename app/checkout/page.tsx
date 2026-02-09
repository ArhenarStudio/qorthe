"use client";

import { useState } from "react";
import { CheckoutPage } from "@/modules/checkout";

const mockCartItems = [
  {
    id: "1",
    name: "Tabla de Cortar Artesanal",
    price: 850,
    quantity: 2,
    image: "https://via.placeholder.com/120",
  },
];

const mockAddresses = [
  {
    id: "addr-1",
    name: "Casa",
    street: "Calle Principal 123",
    city: "Hermosillo",
    state: "Sonora",
    zipCode: "83000",
    phone: "662 123 4567",
    isDefault: true,
  },
];

export default function CheckoutRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("addr-1");

  return (
    <CheckoutPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateCart={() => (window.location.href = "/cart")}
      onNavigatePayment={() => (window.location.href = "/checkout/payment")}
      onAddAddress={() => (window.location.href = "/account")}
      onEditAddress={(id) => (window.location.href = `/account?edit=${id}`)}
      cartItems={mockCartItems}
      savedAddresses={mockAddresses}
      selectedAddressId={selectedAddressId}
      onSelectAddress={setSelectedAddressId}
    />
  );
}
