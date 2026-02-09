/**
 * Backup V1 - 2026-02-09. Componente activo en components/AccountDashboard.tsx
 */
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/modules/header";
import { Footer } from "@/modules/footer";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { ImageWithFallback } from "@/components/shared/ImageWithFallback";

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface AccountDashboardProps {
  language: "es" | "en";
  isDarkMode: boolean;
  onToggleLanguage: () => void;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  onNavigateProducts: () => void;
  onNavigateAccount?: () => void;
  onNavigateOrders: () => void;
  onNavigateAddresses: () => void;
  onNavigateWishlist: () => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
  recentOrders: Order[];
  favoriteProducts: FavoriteProduct[];
  stats: { activeOrders: number; totalOrders: number; favorites: number };
}

const translations = {
  es: {
    nav: { products: "Productos", about: "About", contact: "Contact" },
    welcome: "Bienvenido,",
    sidebar: {
      myProfile: "Mi Perfil",
      myOrders: "Mis Pedidos",
      addresses: "Direcciones",
      favorites: "Favoritos",
      settings: "Configuración",
      logout: "Cerrar Sesión",
    },
    stats: {
      activeOrders: "Pedidos Activos",
      totalOrders: "Pedidos Totales",
      favorites: "Favoritos",
    },
    recentOrders: {
      title: "Pedidos Recientes",
      viewAll: "Ver Todos",
      order: "Pedido",
      items: "artículos",
      status: { processing: "En Proceso", shipped: "Enviado", delivered: "Entregado" },
    },
    favoritesSection: {
      title: "Tus Favoritos",
      viewAll: "Ver Todos",
      addToCart: "Agregar al Carrito",
    },
    footer: {
      description:
        "Muebles artesanales premium elaborados con pasión y dedicación por maestros artesanos mexicanos desde 1998.",
      navigation: "Navegación",
      catalog: "Catálogo",
      contactTitle: "Contacto",
      location: "Hermosillo, Sonora.",
      copyright: "© 2026 Davidsons Design. Todos los derechos reservados.",
      privacy: "Política de Privacidad",
      terms: "Términos y Condiciones",
    },
  },
  en: {
    nav: { products: "Products", about: "About", contact: "Contact" },
    welcome: "Welcome,",
    sidebar: {
      myProfile: "My Profile",
      myOrders: "My Orders",
      addresses: "Addresses",
      favorites: "Favorites",
      settings: "Settings",
      logout: "Logout",
    },
    stats: {
      activeOrders: "Active Orders",
      totalOrders: "Total Orders",
      favorites: "Favorites",
    },
    recentOrders: {
      title: "Recent Orders",
      viewAll: "View All",
      order: "Order",
      items: "items",
      status: { processing: "Processing", shipped: "Shipped", delivered: "Delivered" },
    },
    favoritesSection: {
      title: "Your Favorites",
      viewAll: "View All",
      addToCart: "Add to Cart",
    },
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

export function AccountDashboard({
  language,
  isDarkMode,
  onToggleLanguage,
  onToggleDarkMode,
  onNavigateHome,
  onNavigateProducts,
  onNavigateAccount,
  onNavigateOrders,
  onNavigateAddresses,
  onNavigateWishlist,
  onLogout,
  userName,
  userEmail,
  recentOrders,
  favoriteProducts,
  stats,
}: AccountDashboardProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const t = translations[language];

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return isDarkMode ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-800";
      case "shipped":
        return isDarkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-800";
      case "delivered":
        return isDarkMode ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800";
      default:
        return isDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800";
    }
  };

  const menuItems = [
    { id: "profile", label: t.sidebar.myProfile, icon: User, onClick: () => setActiveSection("profile") },
    { id: "orders", label: t.sidebar.myOrders, icon: Package, onClick: onNavigateOrders },
    { id: "addresses", label: t.sidebar.addresses, icon: MapPin, onClick: onNavigateAddresses },
    { id: "favorites", label: t.sidebar.favorites, icon: Heart, onClick: onNavigateWishlist },
    { id: "settings", label: t.sidebar.settings, icon: Settings, onClick: () => setActiveSection("settings") },
  ];

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
        onNavigateAccount={onNavigateAccount ?? (() => (window.location.href = "/account"))}
        translations={t}
      />

      <div className="pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20 lg:pt-40">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            <aside className="lg:col-span-3">
              <div
                className={`sticky top-32 border p-6 ${
                  isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`mb-8 flex items-center gap-4 border-b pb-8 ${
                    isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      isDarkMode ? "bg-[#8b6f47]" : "bg-[#d4c4b0]"
                    }`}
                  >
                    <User className={`h-8 w-8 ${isDarkMode ? "text-white" : "text-[#3d2f23]"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className={`truncate text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {userName}
                    </h2>
                    <p className={`truncate text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                      {userEmail}
                    </p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`flex w-full items-center gap-3 rounded px-4 py-3 text-sm transition-colors ${
                        activeSection === item.id
                          ? isDarkMode
                            ? "bg-[#8b6f47] text-white"
                            : "bg-[#3d2f23] text-white"
                          : isDarkMode
                            ? "text-[#b8a99a] hover:bg-[#2d2419]"
                            : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={onLogout}
                    className={`flex w-full items-center gap-3 rounded px-4 py-3 text-sm transition-colors ${
                      isDarkMode
                        ? "text-[#b8a99a] hover:bg-red-900/20 hover:text-red-400"
                        : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    <LogOut className="h-5 w-5" />
                    {t.sidebar.logout}
                  </button>
                </nav>
              </div>
            </aside>

            <main className="lg:col-span-9">
              <div className="mb-8 md:mb-10">
                <h1
                  className={`text-3xl tracking-tight md:text-4xl ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {t.welcome} {userName.split(" ")[0]}
                </h1>
              </div>

              <div className="mb-10 grid grid-cols-1 gap-6 md:mb-12 md:grid-cols-3">
                <div
                  className={`border p-6 ${
                    isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isDarkMode ? "bg-[#8b6f47]/20" : "bg-[#d4c4b0]/30"
                      }`}
                    >
                      <ShoppingBag className={`h-6 w-6 ${isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"}`} />
                    </div>
                  </div>
                  <div className={`mb-2 text-3xl md:text-4xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {stats.activeOrders}
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                    {t.stats.activeOrders}
                  </div>
                </div>

                <div
                  className={`border p-6 ${
                    isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isDarkMode ? "bg-[#8b6f47]/20" : "bg-[#d4c4b0]/30"
                      }`}
                    >
                      <Package className={`h-6 w-6 ${isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"}`} />
                    </div>
                  </div>
                  <div className={`mb-2 text-3xl md:text-4xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {stats.totalOrders}
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                    {t.stats.totalOrders}
                  </div>
                </div>

                <div
                  className={`border p-6 ${
                    isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        isDarkMode ? "bg-[#8b6f47]/20" : "bg-[#d4c4b0]/30"
                      }`}
                    >
                      <Heart className={`h-6 w-6 ${isDarkMode ? "text-[#8b6f47]" : "text-[#3d2f23]"}`} />
                    </div>
                  </div>
                  <div className={`mb-2 text-3xl md:text-4xl ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {stats.favorites}
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                    {t.stats.favorites}
                  </div>
                </div>
              </div>

              <div className="mb-10 md:mb-12">
                <div className="mb-6 flex items-center justify-between">
                  <h2
                    className={`text-2xl tracking-tight md:text-3xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.recentOrders.title}
                  </h2>
                  <button
                    onClick={onNavigateOrders}
                    className={`text-sm transition-colors ${
                      isDarkMode ? "text-[#b8a99a] hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.recentOrders.viewAll} →
                  </button>
                </div>
                <div className="space-y-4">
                  {recentOrders.slice(0, 3).map((order) => (
                    <div
                      key={order.id}
                      onClick={onNavigateOrders}
                      className={`cursor-pointer border p-6 transition-colors ${
                        isDarkMode
                          ? "border-[#3d2f23] bg-[#1a1512] hover:border-[#8b6f47]"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <div className={`mb-1 text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                            {t.recentOrders.order} #{order.id}
                          </div>
                          <div className={`text-xs ${isDarkMode ? "text-[#b8a99a]/70" : "text-gray-500"}`}>
                            {order.date}
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusColor(order.status)}`}
                        >
                          {t.recentOrders.status[order.status as keyof typeof t.recentOrders.status]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                          {order.items} {t.recentOrders.items}
                        </span>
                        <span className={`text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          ${order.total.toLocaleString("es-MX")} MXN
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2
                    className={`text-2xl tracking-tight md:text-3xl ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t.favoritesSection.title}
                  </h2>
                  <button
                    onClick={onNavigateWishlist}
                    className={`text-sm transition-colors ${
                      isDarkMode ? "text-[#b8a99a] hover:text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t.favoritesSection.viewAll} →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                  {favoriteProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className={`group cursor-pointer border ${
                        isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="mb-3 aspect-square overflow-hidden">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-3 pb-3">
                        <h3
                          className={`mb-2 truncate text-sm ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {product.name}
                        </h3>
                        <p className={`mb-3 text-sm ${isDarkMode ? "text-[#b8a99a]" : "text-gray-600"}`}>
                          ${product.price.toLocaleString("es-MX")}
                        </p>
                        <button
                          className={`w-full px-3 py-2 text-xs transition-opacity ${
                            isDarkMode
                              ? "bg-[#8b6f47] text-white hover:opacity-90"
                              : "bg-[#3d2f23] text-white hover:opacity-90"
                          }`}
                        >
                          {t.favoritesSection.addToCart}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
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
