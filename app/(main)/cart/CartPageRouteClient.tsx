"use client";

import { CartPage } from "@/modules/cart";

export default function CartPageRouteClient() {
  return (
    <CartPage onContinueShopping={() => (window.location.href = "/products")} />
  );
}
