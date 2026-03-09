"use client";
// ═══════════════════════════════════════════════════════════════
// app/(admin)/layout.tsx
// Admin Layout — ThemeProvider único, nunca se remonta
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { adminNavigation } from "@/src/admin/navigation";
import { AdminErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";

// Layouts por tema
import { ClassicSidebar } from "@/src/theme/layouts/ClassicLayout";
import { ClassicHeader } from "@/src/theme/layouts/ClassicHeader";

import type { AdminPage } from "@/src/admin/navigation";

const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

type SidebarComponent = React.ComponentType<{
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: typeof adminNavigation;
}>;

type HeaderComponent = React.ComponentType<{
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}>;

const SIDEBARS: Record<string, SidebarComponent> = {
  "dsd-classic": ClassicSidebar,
};

const HEADERS: Record<string, HeaderComponent> = {
  "dsd-classic": ClassicHeader,
};

// ── AdminShell — usa ThemeContext ─────────────────────────────
function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, themeId } = useTheme();
  const { currentPage, navigate, period, setPeriod } = useAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const Sidebar = SIDEBARS[themeId] ?? ClassicSidebar;
  const Header  = HEADERS[themeId]  ?? ClassicHeader;

  const activeSidebarWidth =
    t.sidebarStyle === "rail"
      ? t.sidebarWidth
      : sidebarCollapsed
        ? t.sidebarCollapsedWidth
        : t.sidebarWidth;

  const handleNavigate = (page: AdminPage) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div
      id="admin-root"
      data-theme={themeId}
      data-mode={t.mode}
      className="min-h-screen"
      style={{ backgroundColor: t.bg, fontFamily: t.fontBody, fontSize: t.fontSizeBase }}
    >
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          navigation={adminNavigation}
        />
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
                navigation={adminNavigation}
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full"
                style={{ backgroundColor: t.sidebarBg, color: t.sidebarTextMuted }}
              >
                <X size={14} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className="transition-all duration-250 ease-in-out"
        style={{ marginLeft: isDesktop ? activeSidebarWidth : 0 }}
      >
        <Header
          period={period}
          onPeriodChange={setPeriod}
          onNavigate={handleNavigate}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          <AdminErrorBoundary context="panel de administración">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}

// ── AdminLayoutInner — lógica de auth con ThemeProvider ya activo ─
// ThemeProvider vive AFUERA de la condición — nunca se remonta
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useTheme();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const email = user.email?.toLowerCase() || "";
      setAuthorized(ADMIN_EMAILS.includes(email));
    }
    if (!loading && !user) {
      setAuthorized(false);
    }
  }, [user, loading]);

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: t.accent, borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Sin sesión
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="rounded-xl p-8 max-w-md text-center bg-white border border-[#E8E0D4] shadow-sm">
          <Shield size={40} className="mx-auto mb-4 text-[#B09878]" />
          <h1 className="text-2xl font-bold mb-2 text-[#2D2419]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Acceso Restringido
          </h1>
          <p className="text-sm text-[#7A6148] mb-6">
            Necesitas iniciar sesión con una cuenta de administrador.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 text-sm font-semibold rounded-lg bg-[#2D2419] text-white hover:bg-[#3D3222] transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // Sin autorización
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="rounded-xl p-8 max-w-md text-center bg-white border border-[#E8E0D4] shadow-sm">
          <Shield size={40} className="mx-auto mb-4 text-[#DC2626]" />
          <h1 className="text-2xl font-bold mb-2 text-[#2D2419]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sin Autorización
          </h1>
          <p className="text-sm text-[#7A6148] mb-2">
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 text-sm font-semibold rounded-lg bg-[#2D2419] text-white hover:bg-[#3D3222] transition-colors"
          >
            Volver al Sitio
          </Link>
        </div>
      </div>
    );
  }

  // Admin autorizado — AdminShell consume useTheme() del ThemeProvider padre
  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

// ── Root export — ThemeProvider único que NUNCA se remonta ────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </ThemeProvider>
  );
}
