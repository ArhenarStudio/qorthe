"use client";

import { OrdersPage } from "@/modules/customer-account";
import { useAuth } from "@/modules/auth";

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

export default function OrdersRouteClient() {
  const { user } = useAuth();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName ?? user?.email ?? "Usuario";
  const displayEmail = user?.email ?? "";

  return (
    <OrdersPage
      onNavigateDashboard={() => (window.location.href = "/account")}
      onNavigateAddresses={() => (window.location.href = "/account/addresses")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      onNavigateOrderDetail={(orderId) =>
        (window.location.href = `/account/orders/${orderId}`)
      }
      onLogout={() => (window.location.href = "/")}
      userName={displayName}
      userEmail={displayEmail}
      orders={mockOrders}
    />
  );
}
