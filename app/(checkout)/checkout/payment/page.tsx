"use client";

import { PaymentPage } from "@/modules/checkout";
import { useCart } from "@/modules/cart";

export default function PaymentRoute() {
  const { cartItems, subtotal, checkoutUrl } = useCart();

  const shipping = 0;
  const total = subtotal + shipping;

  const handlePlaceOrder = async (_paymentData: unknown) => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }
    console.warn("No checkout URL available (empty cart or not loaded). Redirecting to cart.");
    window.location.href = "/cart";
  };

  return (
    <PaymentPage
      onNavigateCheckout={() => (window.location.href = "/checkout")}
      onPlaceOrder={handlePlaceOrder}
      cartItems={cartItems}
      subtotal={subtotal}
      shipping={shipping}
      total={total}
    />
  );
}
