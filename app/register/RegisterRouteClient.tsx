"use client";

import { RegisterPage } from "@/modules/customer-account";

export default function RegisterRouteClient() {
  return (
    <RegisterPage
      onNavigateLogin={() => (window.location.href = "/login")}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/account")}
    />
  );
}
