"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";
import { ProductTabs } from "./ProductTabs";

export interface DetailProduct {
  id: string;
  name: string;
  category: "chairs" | "tables" | "bedrooms" | string;
  price: number;
  images: string[];
  description: string;
  materials: string[];
  dimensions: {
    width: string;
    height: string;
    depth: string;
  };
  features: string[];
  craftTime: string;
}

interface ProductDetailProps {
  product: DetailProduct;
  relatedProducts: DetailProduct[];
  onBack: () => void;
  onViewRelated: (productId: string) => void;
  onBackToHome: () => void;
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateCart?: () => void;
}

const translations = {
  es: {
    nav: {
      products: "Productos",
      about: "Nosotros",
      contact: "Contacto",
    },
    back: "Volver al Catálogo",
    related: "Productos Relacionados",
    viewProduct: "Ver Producto",
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
      about: "About Us",
      contact: "Contact",
    },
    back: "Back to Catalog",
    related: "Related Products",
    viewProduct: "View Product",
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

const categoryLabels: Record<string, string> = {
  chairs: "Sillas & Sillones",
  tables: "Mesas",
  bedrooms: "Recámaras",
};

export function ProductDetail({
  product,
  relatedProducts,
  onBack,
  onViewRelated,
  onBackToHome,
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateCart,
}: ProductDetailProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleNavigateProducts = () => {
    onBack();
    window.scrollTo(0, 0);
  };

  const galleryImages = product.images.map((url, i) => ({
    url: url.replace("200x200", "800x800"),
    alt: `${product.name} - ${i + 1}`,
  }));

  const productInfoDimensions = {
    length: product.dimensions.depth,
    width: product.dimensions.width,
    height: product.dimensions.height,
  };

  const tabsDescription = {
    title: product.name,
    paragraphs: [product.description],
  };

  const tabsSpecifications = {
    length: product.dimensions.depth,
    width: product.dimensions.width,
    height: product.dimensions.height,
    weight: "—",
    wood: product.materials[0] ?? "Madera noble",
    finish: product.materials[product.materials.length - 1] ?? "Natural",
  };

  const tabsCare = {
    cleaning: [
      "Pasar paño seco o ligeramente húmedo",
      "Usar productos específicos para madera",
    ],
    avoid: [
      "Exposición directa al sol prolongada",
      "Productos abrasivos o con amoníaco",
    ],
    maintenance: [
      "Aplicar aceite o cera cada 6-12 meses",
      "Revisar tornillos y ensamblajes periódicamente",
    ],
  };

  const tabsArtist = {
    name: "David Pérez Muro",
    imageUrl: "https://via.placeholder.com/300x400",
    bio: [
      "Maestro artesano con más de 25 años de experiencia en mueblería artesanal mexicana.",
      "Especializado en maderas nobles y técnicas tradicionales de acabado.",
    ],
    quote:
      "Cada pieza cuenta una historia. Trabajamos con respeto por el material y la tradición.",
    warrantyText:
      "Garantía de 1 año en estructura y acabado. Reparación o reemplazo según condiciones.",
  };

  const categoryLabel =
    categoryLabels[product.category] ?? product.category;

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
        onNavigateCart={onNavigateCart ?? (() => (window.location.href = "/cart"))}
        onNavigateAccount={() => (window.location.href = "/login")}
        translations={t}
      />

      <div className="pb-12 pt-20 md:pb-16 md:pt-24 lg:pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          {/* Back Button */}
          <button
            onClick={onBack}
            className={`mb-6 flex items-center gap-2 transition-colors md:mb-8 ${
              isDarkMode
                ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="tracking-wide">{t.back}</span>
          </button>

          {/* Breadcrumb */}
          <ProductBreadcrumb
            category={categoryLabel}
            categoryHref="/products"
            productName={product.name}
          />

          {/* Product Layout - Gallery + Info + Tabs */}
          <div className="mb-16 md:mb-20 lg:mb-24">
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Gallery */}
              <ProductGallery
                images={galleryImages}
                productTitle={product.name}
              />

              {/* Info */}
              <ProductInfo
                title={product.name}
                price={product.price}
                description={product.description}
                features={product.features}
                dimensions={productInfoDimensions}
                fabricationTime={product.craftTime}
              />
            </div>

            {/* Tabs */}
            <ProductTabs
              description={tabsDescription}
              specifications={tabsSpecifications}
              care={tabsCare}
              artist={tabsArtist}
            />
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2
                className={`mb-8 text-2xl tracking-tight md:mb-10 md:text-3xl lg:text-4xl ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.related}
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    className="group cursor-pointer"
                    onClick={() => onViewRelated(relatedProduct.id)}
                  >
                    <div className="mb-4 aspect-square overflow-hidden">
                      <ImageWithFallback
                        src={relatedProduct.images[0] ?? ""}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h4
                      className={`mb-2 text-xl md:text-2xl ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {relatedProduct.name}
                    </h4>
                    <p
                      className={`mb-3 ${
                        isDarkMode ? "text-[#8b6f47]" : "text-[#8b6f47]"
                      }`}
                    >
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        minimumFractionDigits: 0,
                      }).format(relatedProduct.price)}
                    </p>
                    <button
                      className={`border-b border-current pb-1 text-sm tracking-wide transition-opacity ${
                        isDarkMode
                          ? "text-[#b8a99a] hover:text-[#f5f0e8]"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {t.viewProduct}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer
        language={language}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateCookies={() => (window.location.href = "/cookies")}
        onNavigateCatalog={() => (window.location.href = "/products")}
        translations={t}
      />
    </div>
  );
}
