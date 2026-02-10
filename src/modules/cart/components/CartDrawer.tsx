"use client";

import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { useCart } from "../hooks/useCart";
import { useAppState } from "@/modules/app-state";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueShopping?: () => void;
}

const translations = {
  es: {
    title: "Tu Carrito",
    empty: "Tu carrito está vacío",
    emptyDescription: "Agrega productos para comenzar tu compra",
    exploreProducts: "Explorar Productos",
    subtotal: "Subtotal",
    checkout: "Proceder al Pago",
    continueShopping: "Continuar Comprando",
    remove: "Eliminar",
  },
  en: {
    title: "Your Cart",
    empty: "Your cart is empty",
    emptyDescription: "Add products to start shopping",
    exploreProducts: "Explore Products",
    subtotal: "Subtotal",
    checkout: "Proceed to Checkout",
    continueShopping: "Continue Shopping",
    remove: "Remove",
  },
};

export function CartDrawer({
  isOpen,
  onClose,
  onContinueShopping,
}: CartDrawerProps) {
  const { isDarkMode, language } = useAppState();
  const {
    cartItems,
    subtotal,
    checkoutUrl,
    actionLoading,
    updateItem,
    removeItem,
  } = useCart();

  const t = translations[language];

  const handleContinue = () => {
    (onContinueShopping ?? (() => (window.location.href = "/products")))();
    onClose();
  };

  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      window.location.href = "/cart";
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[400px] transition-transform duration-300 ease-out ${
          isDarkMode ? "bg-[#0a0806]" : "bg-white"
        } ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          <div
            className={`flex items-center justify-between px-6 py-5 border-b ${
              isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl tracking-tight ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode ? "hover:bg-[#2d2419]" : "hover:bg-gray-100"
              }`}
              aria-label="Close cart"
            >
              <X
                className={`w-5 h-5 ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                    isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
                  }`}
                >
                  <ShoppingBag
                    className={`w-10 h-10 ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
                    }`}
                  />
                </div>
                <h3
                  className={`text-lg mb-2 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t.empty}
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {t.emptyDescription}
                </p>
                <button
                  onClick={handleContinue}
                  className={`px-6 py-3 transition-opacity tracking-wide ${
                    isDarkMode
                      ? "bg-[#8b6f47] text-white hover:opacity-90"
                      : "bg-[#3d2f23] text-white hover:opacity-90"
                  }`}
                >
                  {t.exploreProducts}
                </button>
              </div>
            ) : (
              <div className="px-6 py-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 pb-4 border-b ${
                      isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                    }`}
                  >
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h4
                        className={`text-sm mb-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.name}
                      </h4>
                      <p
                        className={`text-sm mb-3 ${
                          isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                        }`}
                      >
                        ${item.price.toLocaleString("es-MX")} MXN
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div
                          className={`flex items-center border rounded ${
                            isDarkMode
                              ? "border-[#3d2f23]"
                              : "border-gray-200"
                          }`}
                        >
                          <button
                            onClick={() =>
                              updateItem(item.id, Math.max(1, item.quantity - 1))
                            }
                            disabled={actionLoading}
                            className={`p-1.5 transition-colors ${
                              isDarkMode
                                ? "hover:bg-[#2d2419]"
                                : "hover:bg-gray-100"
                            }`}
                            aria-label="Decrease quantity"
                          >
                            <Minus
                              className={`w-3.5 h-3.5 ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                          <span
                            className={`px-3 text-sm ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={actionLoading}
                            className={`p-1.5 transition-colors ${
                              isDarkMode
                                ? "hover:bg-[#2d2419]"
                                : "hover:bg-gray-100"
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus
                              className={`w-3.5 h-3.5 ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={actionLoading}
                          className={`p-1.5 rounded transition-colors ${
                            isDarkMode
                              ? "hover:bg-[#2d2419]"
                              : "hover:bg-gray-100"
                          }`}
                          aria-label={t.remove}
                        >
                          <Trash2
                            className={`w-4 h-4 ${
                              isDarkMode
                                ? "text-[#b8a99a]"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`text-sm ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${(item.price * item.quantity).toLocaleString("es-MX")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div
              className={`border-t px-6 py-5 space-y-4 ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#0a0806]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-base ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                  }`}
                >
                  {t.subtotal}
                </span>
                <span
                  className={`text-xl tracking-tight ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  ${subtotal.toLocaleString("es-MX")} MXN
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={actionLoading}
                className={`w-full px-6 py-3.5 transition-opacity tracking-wide text-center ${
                  isDarkMode
                    ? "bg-[#8b6f47] text-white hover:opacity-90"
                    : "bg-[#3d2f23] text-white hover:opacity-90"
                }`}
              >
                {t.checkout}
              </button>

              <button
                onClick={handleContinue}
                className={`w-full text-center text-sm transition-colors ${
                  isDarkMode
                    ? "text-[#b8a99a] hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.continueShopping}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
