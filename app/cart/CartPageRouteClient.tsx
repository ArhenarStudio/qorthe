"use client";

import { CartPage } from "@/modules/cart";

export default function CartPageRouteClient() {
  return (
    <CartPage
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/login")}
      onContinueShopping={() => (window.location.href = "/products")}
    />
  );
}
