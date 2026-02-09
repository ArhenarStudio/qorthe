"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { Plus, Minus, Trash2, ShoppingBag, Tag, Truck } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string;
}

interface CartPageProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onContinueShopping?: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

const translations = {
  es: {
    nav: {
      products: "Productos",
      about: "About",
      contact: "Contact",
    },
    title: "Carrito de Compras",
    empty: "Tu carrito está vacío",
    emptyDescription:
      "Parece que aún no has agregado productos a tu carrito",
    exploreProducts: "Explorar Productos",
    continueShopping: "← Continuar Comprando",
    product: "Producto",
    price: "Precio",
    quantity: "Cantidad",
    subtotalItem: "Subtotal",
    remove: "Eliminar",
    orderSummary: "Resumen de Orden",
    subtotal: "Subtotal",
    couponCode: "Código de Descuento",
    applyCoupon: "Aplicar",
    couponPlaceholder: "Ingresa tu código",
    shipping: "Envío",
    shippingOptions: {
      standard: "Estándar (5-7 días)",
      express: "Express (2-3 días)",
      free: "Gratis",
    },
    total: "Total",
    checkout: "Proceder al Pago",
    paymentMethods: "Métodos de pago aceptados",
    footer: {
      description:
        "Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.",
      navigation: "Navegación",
      catalog: "Catálogo",
      contactTitle: "Contacto",
      location: "Hermosillo, Sonora.",
      copyright:
        "© 2026 Davidsons Design. Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
    },
  },
  en: {
    nav: {
      products: "Products",
      about: "About",
      contact: "Contact",
    },
    title: "Shopping Cart",
    empty: "Your cart is empty",
    emptyDescription:
      "Looks like you haven't added any products to your cart yet",
    exploreProducts: "Explore Products",
    continueShopping: "← Continue Shopping",
    product: "Product",
    price: "Price",
    quantity: "Quantity",
    subtotalItem: "Subtotal",
    remove: "Remove",
    orderSummary: "Order Summary",
    subtotal: "Subtotal",
    couponCode: "Discount Code",
    applyCoupon: "Apply",
    couponPlaceholder: "Enter your code",
    shipping: "Shipping",
    shippingOptions: {
      standard: "Standard (5-7 days)",
      express: "Express (2-3 days)",
      free: "Free",
    },
    total: "Total",
    checkout: "Proceed to Checkout",
    paymentMethods: "Accepted payment methods",
    footer: {
      description:
        "Premium handcrafted furniture made with passion and dedication by Mexican master artisans since 1998.",
      navigation: "Navigation",
      catalog: "Catalog",
      contactTitle: "Contact",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
    },
  },
};

export function CartPage({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onContinueShopping,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [shippingOption, setShippingOption] = useState<
    "free" | "standard" | "express"
  >("free");

  const t = translations[language];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost =
    shippingOption === "free" ? 0 : shippingOption === "standard" ? 299 : 599;
  const total = subtotal + shippingCost;

  const handleContinueShopping = onContinueShopping ?? onNavigateProducts;

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-[#0a0806]" : "bg-white"
      }`}
    >
      <Header
        isScrolled={isScrolled}
        language={language}
        isDarkMode={isDarkMode}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleLanguage={onToggleLanguage}
        onToggleDarkMode={onToggleDarkMode}
        onToggleMobileMenu={handleToggleMobileMenu}
        onNavigateProducts={onNavigateProducts}
        onNavigateHome={onNavigateHome}
        onNavigateCart={() => (window.location.href = "/cart")}
        translations={t}
      />

      <div className="pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <h1
              className={`mb-4 text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h1>
            <button
              onClick={handleContinueShopping}
              className={`text-sm transition-colors md:text-base ${
                isDarkMode
                  ? "text-[#b8a99a] hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t.continueShopping}
            </button>
          </div>

          {items.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-16 text-center md:py-24">
              <div
                className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  isDarkMode ? "bg-[#2d2419]" : "bg-gray-100"
                }`}
              >
                <ShoppingBag
                  className={`h-12 w-12 ${
                    isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
                  }`}
                />
              </div>
              <h2
                className={`mb-3 text-2xl md:text-3xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.empty}
              </h2>
              <p
                className={`mb-8 max-w-md text-base md:text-lg ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {t.emptyDescription}
              </p>
              <button
                onClick={handleContinueShopping}
                className={`px-8 py-3.5 tracking-wide transition-opacity ${
                  isDarkMode
                    ? "bg-[#8b6f47] text-white hover:opacity-90"
                    : "bg-[#3d2f23] text-white hover:opacity-90"
                }`}
              >
                {t.exploreProducts}
              </button>
            </div>
          ) : (
            // Cart with Items
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column - Cart Items */}
              <div className="lg:col-span-8">
                {/* Desktop Table Header */}
                <div
                  className={`mb-4 hidden grid-cols-12 gap-4 border-b pb-4 text-sm tracking-wide md:grid ${
                    isDarkMode
                      ? "border-[#3d2f23] text-[#b8a99a]"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  <div className="col-span-6">{t.product}</div>
                  <div className="col-span-2 text-center">{t.price}</div>
                  <div className="col-span-2 text-center">{t.quantity}</div>
                  <div className="col-span-2 text-right">{t.subtotalItem}</div>
                </div>

                {/* Cart Items */}
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`border-b pb-6 ${
                        isDarkMode
                          ? "border-[#3d2f23]"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
                        {/* Product Info */}
                        <div className="flex gap-4 md:col-span-6">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden md:h-28 md:w-28">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3
                              className={`mb-1 text-base md:text-lg ${
                                isDarkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {item.name}
                            </h3>
                            {item.description && (
                              <p
                                className={`text-sm ${
                                  isDarkMode
                                    ? "text-[#b8a99a]"
                                    : "text-gray-600"
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex md:col-span-2 md:justify-center">
                          <div className="flex items-center gap-2 md:flex-col md:items-center md:gap-0">
                            <span
                              className={`text-sm md:hidden ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            >
                              {t.price}:
                            </span>
                            <span
                              className={
                                isDarkMode ? "text-white" : "text-gray-900"
                              }
                            >
                              ${item.price.toLocaleString("es-MX")}
                            </span>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex md:col-span-2 md:justify-center">
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-sm md:hidden ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            >
                              {t.quantity}:
                            </span>
                            <div
                              className={`flex items-center rounded border ${
                                isDarkMode
                                  ? "border-[#3d2f23]"
                                  : "border-gray-200"
                              }`}
                            >
                              <button
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.id,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className={`p-2 transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-[#2d2419]"
                                    : "hover:bg-gray-100"
                                }`}
                                aria-label="Decrease quantity"
                              >
                                <Minus
                                  className={`h-4 w-4 ${
                                    isDarkMode
                                      ? "text-[#b8a99a]"
                                      : "text-gray-600"
                                  }`}
                                />
                              </button>
                              <span
                                className={`px-4 ${
                                  isDarkMode
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.id, item.quantity + 1)
                                }
                                className={`p-2 transition-colors ${
                                  isDarkMode
                                    ? "hover:bg-[#2d2419]"
                                    : "hover:bg-gray-100"
                                }`}
                                aria-label="Increase quantity"
                              >
                                <Plus
                                  className={`h-4 w-4 ${
                                    isDarkMode
                                      ? "text-[#b8a99a]"
                                      : "text-gray-600"
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal & Remove */}
                        <div className="flex items-center justify-between gap-3 md:col-span-2 md:flex-col md:items-end md:justify-end">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm md:hidden ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            >
                              {t.subtotalItem}:
                            </span>
                            <span
                              className={`text-lg ${
                                isDarkMode
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              ${(item.price * item.quantity).toLocaleString(
                                "es-MX"
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${
                              isDarkMode
                                ? "text-[#b8a99a] hover:text-white"
                                : "text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="md:hidden">{t.remove}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-4">
                <div
                  className={`sticky top-32 space-y-6 border p-6 md:p-8 ${
                    isDarkMode
                      ? "border-[#3d2f23] bg-[#1a1512]"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <h2
                    className={`text-xl tracking-tight md:text-2xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.orderSummary}
                  </h2>

                  {/* Subtotal */}
                  <div
                    className={`flex justify-between border-b pb-4 ${
                      isDarkMode
                        ? "border-[#3d2f23]"
                        : "border-gray-200"
                    }`}
                  >
                    <span
                      className={
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }
                    >
                      {t.subtotal}
                    </span>
                    <span
                      className={
                        isDarkMode ? "text-white" : "text-gray-900"
                      }
                    >
                      ${subtotal.toLocaleString("es-MX")} MXN
                    </span>
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label
                      className={`mb-3 flex items-center gap-2 text-sm ${
                        isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-600"
                      }`}
                    >
                      <Tag className="h-4 w-4" />
                      {t.couponCode}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder={t.couponPlaceholder}
                        className={`flex-1 border px-4 py-2.5 text-sm transition-colors focus:outline-none ${
                          isDarkMode
                            ? "border-[#3d2f23] bg-[#0a0806] text-white placeholder:text-[#b8a99a]/50 focus:border-[#8b6f47]"
                            : "border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                        }`}
                      />
                      <button
                        className={`px-4 py-2.5 text-sm transition-opacity ${
                          isDarkMode
                            ? "bg-[#8b6f47] text-white hover:opacity-90"
                            : "bg-[#3d2f23] text-white hover:opacity-90"
                        }`}
                      >
                        {t.applyCoupon}
                      </button>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div>
                    <label
                      className={`mb-3 flex items-center gap-2 text-sm ${
                        isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-600"
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                      {t.shipping}
                    </label>
                    <div className="space-y-2">
                      {(["free", "standard", "express"] as const).map(
                        (opt) => (
                          <label
                            key={opt}
                            className={`flex cursor-pointer items-center justify-between border p-3 transition-colors ${
                              isDarkMode
                                ? `border-[#3d2f23] ${
                                    shippingOption === opt
                                      ? "bg-[#2d2419]"
                                      : "hover:bg-[#1a1512]"
                                  }`
                                : `border-gray-200 ${
                                    shippingOption === opt
                                      ? "bg-gray-100"
                                      : "hover:bg-gray-50"
                                  }`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping"
                                value={opt}
                                checked={shippingOption === opt}
                                onChange={() => setShippingOption(opt)}
                                className="accent-[#8b6f47]"
                              />
                              <span
                                className={`text-sm ${
                                  isDarkMode
                                    ? "text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {t.shippingOptions[opt]}
                              </span>
                            </div>
                            <span
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-[#b8a99a]"
                                  : "text-gray-600"
                              }`}
                            >
                              $
                              {opt === "free"
                                ? "0"
                                : opt === "standard"
                                  ? "299"
                                  : "599"}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Total */}
                  <div
                    className={`flex justify-between border-t pt-6 ${
                      isDarkMode
                        ? "border-[#3d2f23]"
                        : "border-gray-200"
                    }`}
                  >
                    <span
                      className={`text-lg ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t.total}
                    </span>
                    <span
                      className={`text-2xl tracking-tight ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      ${total.toLocaleString("es-MX")} MXN
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={onCheckout}
                    className={`w-full px-6 py-3.5 tracking-wide transition-opacity ${
                      isDarkMode
                        ? "bg-[#8b6f47] text-white hover:opacity-90"
                        : "bg-[#3d2f23] text-white hover:opacity-90"
                    }`}
                  >
                    {t.checkout}
                  </button>

                  {/* Payment Methods */}
                  <div className="pt-4">
                    <p
                      className={`mb-3 text-center text-xs ${
                        isDarkMode
                          ? "text-[#b8a99a]"
                          : "text-gray-600"
                      }`}
                    >
                      {t.paymentMethods}
                    </p>
                    <div className="flex justify-center gap-3 opacity-50">
                      {["VISA", "MC", "AMEX", "PP"].map((label) => (
                        <div
                          key={label}
                          className={`flex h-6 w-10 items-center justify-center rounded border ${
                            isDarkMode
                              ? "border-[#3d2f23]"
                              : "border-gray-300"
                          }`}
                        >
                          <span className="text-[8px] font-bold">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        translations={t}
      />
    </div>
  );
}
