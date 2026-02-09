"use client";

import { useState } from "react";
import { AccountDashboard } from "@/modules/customer-account";

export default function AccountRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const recentOrders = [
    { id: "ORD-001", date: "2025-02-05", status: "shipped", total: 2500, items: 3 },
    { id: "ORD-002", date: "2025-01-28", status: "delivered", total: 1800, items: 2 },
  ];

  const favoriteProducts = [
    { id: "1", name: "Tabla Premium", price: 850, image: "https://via.placeholder.com/200" },
    { id: "2", name: "Set Cubiertos", price: 1200, image: "https://via.placeholder.com/200" },
  ];

  return (
    <AccountDashboard
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      onLogout={() => (window.location.href = "/")}
      userName="David Pérez"
      userEmail="david@example.com"
      recentOrders={recentOrders}
      favoriteProducts={favoriteProducts}
      stats={{ activeOrders: 1, totalOrders: 12, favorites: 8 }}
    />
  );
}
