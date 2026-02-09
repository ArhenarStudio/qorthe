"use client";

import { useState } from "react";
import { WishlistPage } from "@/modules/customer-account";

const mockWishlist = [
  {
    id: "1",
    name: "Tabla Premium",
    price: 850,
    image: "https://via.placeholder.com/200",
    available: true,
    category: "tables",
  },
  {
    id: "2",
    name: "Set Cubiertos",
    price: 1200,
    image: "https://via.placeholder.com/200",
    available: true,
    category: "tables",
  },
];

export default function WishlistRoute() {
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState(mockWishlist);

  return (
    <WishlistPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateDashboard={() => (window.location.href = "/account")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onLogout={() => (window.location.href = "/")}
      userName="David Pérez"
      userEmail="david@example.com"
      wishlistProducts={wishlistProducts}
      onRemoveFromWishlist={(productId) =>
        setWishlistProducts((p) => p.filter((x) => x.id !== productId))
      }
      onAddToCart={(productId) => (window.location.href = `/products?add=${productId}`)}
    />
  );
}
