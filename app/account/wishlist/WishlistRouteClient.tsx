"use client";

import { useState } from "react";
import { WishlistPage } from "@/modules/customer-account";
import { useAuth } from "@/modules/auth";

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

export default function WishlistRouteClient() {
  const { user } = useAuth();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName ?? user?.email ?? "Usuario";
  const displayEmail = user?.email ?? "";
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
      userName={displayName}
      userEmail={displayEmail}
      wishlistProducts={wishlistProducts}
      onRemoveFromWishlist={(productId) =>
        setWishlistProducts((p) => p.filter((x) => x.id !== productId))
      }
      onAddToCart={(productId) => (window.location.href = `/products?add=${productId}`)}
    />
  );
}
