"use client";

import { useState } from "react";
import { CheckoutPage } from "@/modules/checkout";

// Mock data - replace with real cart/address data when integrating Shopify/Supabase
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>("addr-1");

  return (
    <CheckoutPage
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
