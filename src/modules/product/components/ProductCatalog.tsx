"use client";

import { useState, useEffect } from "react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";

export interface CatalogProduct {
  id: string;
  name: string;
  category: "chairs" | "tables" | "bedrooms" | string;
  price: number;
  images: string[];
  description: string;
}

interface ProductCatalogProps {
  products: CatalogProduct[];
  onViewProduct: (productId: string) => void;
  onBackToHome: () => void;
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  cartItemsCount?: number;
  isAuthenticated?: boolean;
  userName?: string;
  onNavigateCart: () => void;
  onNavigateAccount: () => void;
  onNavigateLogin?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateOrders?: () => void;
  onNavigateWishlist?: () => void;
  onNavigateAddresses?: () => void;
  onLogout?: () => void;
}

type CategoryFilter = "all" | "chairs" | "tables" | "bedrooms";

const translations = {
  es: {
    nav: {
      products: "Productos",
      about: "About",
      contact: "Contact",
    },
    title: "Catálogo de Productos",
    subtitle: "Explora nuestra colección completa de muebles artesanales",
    all: "Todos",
    chairs: "Sillas & Sillones",
    tables: "Mesas",
    bedrooms: "Recámaras",
    viewDetails: "Ver Detalles",
    noProducts: "No hay productos en esta categoría",
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
    title: "Product Catalog",
    subtitle: "Explore our complete collection of handcrafted furniture",
    all: "All",
    chairs: "Chairs & Armchairs",
    tables: "Tables",
    bedrooms: "Bedrooms",
    viewDetails: "View Details",
    noProducts: "No products in this category",
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

export function ProductCatalog({
  products,
  onViewProduct,
  onBackToHome,
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  cartItemsCount,
  isAuthenticated,
  userName,
  onNavigateCart,
  onNavigateAccount,
  onNavigateLogin,
  onNavigateDashboard,
  onNavigateOrders,
  onNavigateWishlist,
  onNavigateAddresses,
  onLogout,
}: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("all");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: t.all },
    { id: "chairs", label: t.chairs },
    { id: "tables", label: t.tables },
    { id: "bedrooms", label: t.bedrooms },
  ];

  const handleNavigateProducts = () => {
    window.scrollTo(0, 0);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        onNavigateProducts={handleNavigateProducts}
        onNavigateHome={onBackToHome}
        onNavigateCart={onNavigateCart}
        onNavigateAccount={onNavigateAccount}
        translations={t}
        cartItemsCount={cartItemsCount}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onNavigateLogin={onNavigateLogin}
        onNavigateDashboard={onNavigateDashboard}
        onNavigateOrders={onNavigateOrders}
        onNavigateWishlist={onNavigateWishlist}
        onNavigateAddresses={onNavigateAddresses}
        onLogout={onLogout}
      />

      <div className="pb-12 pt-20 md:pb-16 md:pt-24 lg:pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          {/* Header */}
          <div className="mb-10 text-center md:mb-12 lg:mb-16 md:space-y-4 space-y-3">
            <h1
              className={`text-3xl tracking-tight md:text-4xl lg:text-5xl ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {t.title}
            </h1>
            <p
              className={`mx-auto max-w-2xl text-base md:text-lg lg:text-xl ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.subtitle}
            </p>
          </div>

          {/* Category Filters */}
          <div className="mb-10 flex flex-wrap justify-center gap-3 md:mb-12 md:gap-4 lg:mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-5 py-2 tracking-wide transition-all md:px-6 md:py-2.5 ${
                  activeCategory === category.id
                    ? isDarkMode
                      ? "bg-[#8b6f47] text-white"
                      : "bg-[#3d2f23] text-white"
                    : isDarkMode
                      ? "border border-[#3d2f23] bg-[#1a1512] text-[#b8a99a] hover:bg-[#2d2419]"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    isDarkMode ? "hover:shadow-2xl" : "hover:shadow-xl"
                  }`}
                  onClick={() => onViewProduct(product.id)}
                >
                  {/* Product Image */}
                  <div className="mb-4 aspect-square overflow-hidden">
                    <ImageWithFallback
                      src={product.images[0] ?? ""}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3
                      className={`text-xl tracking-tight md:text-2xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {product.name}
                    </h3>

                    <p
                      className={`text-lg md:text-xl ${
                        isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
                      }`}
                    >
                      {formatPrice(product.price)}
                    </p>

                    <p
                      className={`line-clamp-2 text-sm md:text-base ${
                        isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                      }`}
                    >
                      {product.description}
                    </p>

                    <button
                      className={`mt-2 inline-flex items-center border-b pb-1 text-sm tracking-wide transition-all ${
                        isDarkMode
                          ? "border-[#b8a99a] text-[#b8a99a] hover:border-[#f5f0e8] hover:text-[#f5f0e8]"
                          : "border-gray-600 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                      }`}
                    >
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`py-16 text-center ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              <p className="text-lg">{t.noProducts}</p>
            </div>
          )}
        </div>
      </div>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onNavigateCookies={() => (window.location.href = "/cookies")}
        onNavigateCatalog={() => (window.location.href = "/products")}
        translations={t}
      />
    </div>
  );
}
