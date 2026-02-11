"use client";

import { AccountDashboard } from "@/modules/customer-account";

const recentOrders: { id: string; date: string; status: string; total: number; items: number }[] = [];
const favoriteProducts: { id: string; name: string; price: number; image: string }[] = [];

export function AccountPageClient() {
  return (
    <AccountDashboard
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      recentOrders={recentOrders}
      favoriteProducts={favoriteProducts}
      stats={{ activeOrders: 0, totalOrders: 0, favorites: 0 }}
    />
  );
}
