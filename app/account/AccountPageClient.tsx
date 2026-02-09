"use client";

import { useState } from "react";
import { AccountDashboard } from "@/modules/customer-account";

const recentOrders: { id: string; date: string; status: string; total: number; items: number }[] = [];
const favoriteProducts: { id: string; name: string; price: number; image: string }[] = [];

export function AccountPageClient() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <AccountDashboard
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/account")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      recentOrders={recentOrders}
      favoriteProducts={favoriteProducts}
      stats={{ activeOrders: 0, totalOrders: 0, favorites: 0 }}
    />
  );
}
