"use client";

import { LoginPage } from "@/modules/customer-account";

export default function LoginRouteClient() {
  return (
    <LoginPage
      onNavigateRegister={() => (window.location.href = "/register")}
      onNavigateHome={() => (window.location.href = "/")}
      onNavigateProducts={() => (window.location.href = "/products")}
      onNavigateAccount={() => (window.location.href = "/account")}
    />
  );
}
