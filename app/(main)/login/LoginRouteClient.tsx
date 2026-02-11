"use client";

import { LoginPage } from "@/modules/customer-account";

export default function LoginRouteClient() {
  return (
    <LoginPage onNavigateRegister={() => (window.location.href = "/register")} />
  );
}
