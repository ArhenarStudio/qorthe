"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderConfirmationPage } from "@/modules/checkout";

const mockItems = [
  {
    id: "1",
    name: "Tabla de Cortar Artesanal",
    price: 850,
    quantity: 2,
    image: "https://via.placeholder.com/120",
  },
];

const mockShippingAddress = {
  name: "Casa",
  street: "Calle Principal 123",
  city: "Hermosillo",
  state: "Sonora",
  zipCode: "83000",
  phone: "662 123 4567",
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "ORD-demo";

  const orderDate = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <OrderConfirmationPage
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateOrders={() => (window.location.href = "/account/orders")}
      onNavigateOrderDetail={(id) => (window.location.href = `/account/orders/${id}`)}
      orderId={orderId}
      orderDate={orderDate}
      items={mockItems}
      subtotal={1700}
      shipping={0}
      total={1700}
      shippingAddress={mockShippingAddress}
      paymentMethod="Tarjeta de Crédito"
      estimatedDelivery={estimatedDelivery}
      userEmail="cliente@ejemplo.com"
    />
  );
}

export default function OrderConfirmationRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
