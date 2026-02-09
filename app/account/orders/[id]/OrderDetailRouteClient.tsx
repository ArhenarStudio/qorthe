"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { OrderDetailPage } from "@/modules/customer-account";

const mockOrderDetail = {
  id: "ORD-001",
  date: "2025-02-05",
  status: "shipped" as const,
  products: [
    {
      id: "1",
      name: "Tabla Premium",
      image: "https://via.placeholder.com/80",
      price: 850,
      quantity: 2,
    },
  ],
  subtotal: 1700,
  shipping: 0,
  total: 1700,
  shippingAddress: {
    name: "Casa",
    street: "Calle Principal 123",
    city: "Hermosillo",
    state: "Sonora",
    zipCode: "83000",
    phone: "662 123 4567",
  },
  paymentMethod: "Tarjeta de Crédito",
  tracking: [
    { status: "order-placed", date: "2025-02-05", description: "Pedido realizado", completed: true },
    { status: "processing", date: "2025-02-06", description: "En proceso", completed: true },
    { status: "shipped", date: "2025-02-07", description: "Enviado", completed: true },
    { status: "delivered", date: "", description: "Entregado", completed: false },
  ],
};

export default function OrderDetailRouteClient() {
  const params = useParams();
  const orderId = (params?.id as string) ?? "ORD-001";
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const detail = { ...mockOrderDetail, id: orderId };

  return (
    <OrderDetailPage
      language={language}
      isDarkMode={isDarkMode}
      onToggleLanguage={() => setLanguage((l) => (l === "es" ? "en" : "es"))}
      onToggleDarkMode={() => setIsDarkMode((m) => !m)}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      orderDetail={detail}
    />
  );
}
