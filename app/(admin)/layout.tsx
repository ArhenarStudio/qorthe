"use client";

// ═══════════════════════════════════════════════════════════════
// Admin Layout — Full sidebar + header layout
// Migrated from Figma export — 2026-03-01 (Fase 12.0)
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { AdminThemeProvider, useAdminTheme } from "@/contexts/AdminThemeContext";
import { adminNavigation } from "@/src/admin/navigation";
import "@/src/styles/admin-theme.css";
import { AdminErrorBoundary } from '@/components/ErrorBoundary';

// Admin email whitelist — extend as needed
const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate, period, setPeriod } = useAdmin();
  const { theme, navigation } = useAdminTheme();
  const ThemeSidebar = theme.Sidebar;
  const ThemeHeader = theme.Header;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (page: Parameters<typeof navigate>[0]) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--admin-bg, #F5F3F0)' }}>
      {/* Desktop Sidebar — injected from theme */}
      <div className="hidden lg:block">
        <ThemeSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          navigation={navigation}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <ThemeSidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
                navigation={navigation}
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-full z-50 hover:opacity-80"
                style={{ backgroundColor: "var(--admin-sidebar-bg)", color: "var(--admin-muted)" }}
              >
                <X size={14} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className="transition-all duration-250 ease-in-out"
        style={{
          marginLeft: isDesktop ? (
            theme.id === 'coral-forge' ? 72 :
            theme.id === 'indigo-glass' ? 68 :
            sidebarCollapsed ? 72 : (parseInt(theme.tokens.sidebarWidth) || 256)
          ) : 0,
        }}
      >
        <ThemeHeader
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const email = user.email?.toLowerCase() || "";
      setAuthorized(ADMIN_EMAILS.includes(email));
    }
  }, [user, loading]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg, #F5F3F0)" }}>
        <div className="animate-spin w-8 h-8 rounded-full" style={{ border: "2px solid var(--admin-accent, #C5A065)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg, #F5F3F0)" }}>
        <div className="rounded-xl p-8 max-w-md text-center" style={{ backgroundColor: "var(--admin-surface, #FFFFFF)", border: "1px solid var(--admin-border, #EFEBE9)", boxShadow: "var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.06))" }}>
          <Shield size={40} className="mx-auto mb-4" style={{ color: "var(--admin-muted, #A1887F)" }} />
          <h1 className="text-2xl mb-2" style={{ color: "var(--admin-text, #2d2419)", fontFamily: "var(--admin-font-heading)" }}>
            Acceso Restringido
          </h1>
          <p className="text-[14px] mb-6" style={{ color: "var(--admin-text-secondary, #795548)" }}>
            Necesitas iniciar sesión con una cuenta de administrador.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 text-[13px] font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: "var(--admin-accent, #2d2419)", color: "var(--admin-accent-text, white)" }}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--admin-bg, #F5F3F0)" }}>
        <div className="rounded-xl p-8 max-w-md text-center" style={{ backgroundColor: "var(--admin-surface, #FFFFFF)", border: "1px solid var(--admin-border, #EFEBE9)", boxShadow: "var(--admin-shadow, 0 1px 3px rgba(0,0,0,0.06))" }}>
          <Shield size={40} className="mx-auto mb-4" style={{ color: "var(--admin-error, #DC2626)" }} />
          <h1 className="text-2xl mb-2" style={{ color: "var(--admin-text, #2d2419)", fontFamily: "var(--admin-font-heading)" }}>
            Sin Autorización
          </h1>
          <p className="text-[14px] mb-2" style={{ color: "var(--admin-text-secondary, #795548)" }}>
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 text-[13px] font-semibold rounded-lg transition-colors"
            style={{ backgroundColor: "var(--admin-accent, #2d2419)", color: "var(--admin-accent-text, white)" }}
          >
            Volver al Sitio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminThemeProvider>
    <AdminProvider>
      <div id="admin-root">
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminProvider>
    </AdminThemeProvider>
  );
}
