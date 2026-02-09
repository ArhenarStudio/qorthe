"use client";

import { useState } from "react";
import { OrdersPage } from "@/modules/customer-account";

const mockOrders = [
  {
    id: "ORD-001",
    date: "2025-02-05",
    status: "shipped" as const,
    total: 2500,
    products: [
      { id: "1", name: "Tabla Premium", image: "https://via.placeholder.com/80" },
    ],
  },
  {
    id: "ORD-002",
    date: "2025-01-28",
    status: "delivered" as const,
    total: 1800,
    products: [
      { id: "2", name: "Set Cubiertos", image: "https://via.placeholder.com/80" },
    ],
  },
];

export default function OrdersRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <OrdersPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateDashboard={() => (window.location.href = "/account")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      onNavigateOrderDetail={(orderId) =>
        (window.location.href = `/account/orders/${orderId}`)
      }
      onLogout={() => (window.location.href = "/")}
      userName="David Pérez"
      userEmail="david@example.com"
      orders={mockOrders}
    />
  );
}
