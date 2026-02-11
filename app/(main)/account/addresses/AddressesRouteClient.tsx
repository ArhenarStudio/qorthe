"use client";

import { useState } from "react";
import { AddressesPage } from "@/modules/customer-account";
import { useAuth } from "@/modules/auth";

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

export default function AddressesRouteClient() {
  const { user } = useAuth();
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName ?? user?.email ?? "Usuario";
  const displayEmail = user?.email ?? "";
  const [addresses, setAddresses] = useState(mockAddresses);

  return (
    <AddressesPage
      onNavigateDashboard={() => (window.location.href = "/account")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateWishlist={() => (window.location.href = "/account/wishlist")}
      onLogout={() => (window.location.href = "/")}
      userName={displayName}
      userEmail={displayEmail}
      addresses={addresses}
      onAddAddress={() => (window.location.href = "/account")}
      onEditAddress={(id) => (window.location.href = `/account?edit=${id}`)}
      onDeleteAddress={(id) => setAddresses((a) => a.filter((x) => x.id !== id))}
      onSetDefaultAddress={(id) =>
        setAddresses((a) =>
          a.map((x) => ({ ...x, isDefault: x.id === id }))
        )
      }
    />
  );
}
