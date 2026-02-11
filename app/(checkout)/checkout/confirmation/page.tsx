"use client";

import { useEffect } from "react";
import { useAuth } from "@/modules/auth";
import { useAppState } from "@/modules/app-state";
import { useCart } from "@/modules/cart";
import { CheckCircle } from "lucide-react";

const translations = {
  es: {
    title: "Gracias",
    subtitle: "Pago procesado en Shopify",
    message:
      "Tu pago fue procesado correctamente en Shopify. Recibirás un correo de confirmación con los detalles de tu pedido.",
    viewOrders: "Ver mis pedidos",
    signIn: "Iniciar sesión",
    continueShopping: "Seguir comprando",
  },
  en: {
    title: "Thank you",
    subtitle: "Payment processed on Shopify",
    message:
      "Your payment was successfully processed on Shopify. You will receive a confirmation email with your order details.",
    viewOrders: "View my orders",
    signIn: "Sign in",
    continueShopping: "Continue shopping",
  },
};

export default function CheckoutConfirmationPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { language, isDarkMode } = useAppState();
  const { clearCart } = useCart();
  const t = translations[language];

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const navTo = (path: string) => () => {
    window.location.href = path;
  };

  if (authLoading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        }`}
      >
        <p className={isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}>
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0806]" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-lg px-4 py-16 text-center md:py-24">
        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full md:mb-8 md:h-24 md:w-24 ${
            isDarkMode ? "bg-green-900/30" : "bg-green-100"
          }`}
        >
          <CheckCircle
            className={`h-12 w-12 md:h-14 md:w-14 ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          />
        </div>
        <h1
          className={`mb-2 text-3xl font-medium tracking-tight md:text-4xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.title}
        </h1>
        <p
          className={`mb-4 text-base font-medium md:text-lg ${
            isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
          }`}
        >
          {t.subtitle}
        </p>
        <p
          className={`mb-10 text-sm md:mb-12 md:text-base ${
            isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
          }`}
        >
          {t.message}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          {isAuthenticated ? (
            <button
              onClick={navTo("/account/orders")}
              className={`px-6 py-3.5 font-medium tracking-wide transition-opacity ${
                isDarkMode
                  ? "bg-[#8b6f47] text-white hover:opacity-90"
                  : "bg-[#3d2f23] text-white hover:opacity-90"
              }`}
            >
              {t.viewOrders}
            </button>
          ) : (
            <button
              onClick={navTo("/login")}
              className={`px-6 py-3.5 font-medium tracking-wide transition-opacity ${
                isDarkMode
                  ? "bg-[#8b6f47] text-white hover:opacity-90"
                  : "bg-[#3d2f23] text-white hover:opacity-90"
              }`}
            >
              {t.signIn}
            </button>
          )}
          <button
            onClick={navTo("/products")}
            className={`border px-6 py-3.5 font-medium tracking-wide transition-colors ${
              isDarkMode
                ? "border-[#3d2f23] text-[#b8a99a] hover:border-[#8b6f47] hover:text-white"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            {t.continueShopping}
          </button>
        </div>
      </div>
    </div>
  );
}
