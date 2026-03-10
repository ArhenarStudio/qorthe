"use client";
// ═══════════════════════════════════════════════════════════════
// app/(admin)/layout.tsx
// RockSage Commerce — Layout raíz del panel admin
// Un solo ThemeProvider: AdminThemeProvider
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Shield, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { AdminThemeProvider, useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { AdminErrorBoundary } from '@/components/ErrorBoundary';

const ADMIN_EMAILS = [
  'admin@davidsonsdesign.com',
  'designdavidsons@gmail.com',
  'studiorockstage@gmail.com',
];

// ── AdminShell — consume useAdminTheme() ──────────────────────
function AdminShell({ children }: { children: React.ReactNode }) {
  const { theme } = useAdminTheme();
  const { currentPage, navigate, period, setPeriod } = useAdmin();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const t = theme.tokens;

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { Sidebar, Header } = theme;

  const activeSidebarWidth = sidebarCollapsed
    ? 64
    : parseInt(t.sidebarWidth, 10) || 260;

  const handleNavigate = (page: Parameters<typeof navigate>[0]) => {
    navigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div
      id="admin-root"
      data-theme={theme.id}
      data-mode={theme.mode}
      className="min-h-screen"
      style={{ backgroundColor: t.bg, fontFamily: t.fontBody, fontSize: t.fontSizeBase }}
    >
      {/* Sidebar desktop */}
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          navigation={[]}
        />
      </div>

      {/* Sidebar mobile */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
                navigation={[]}
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

      {/* Contenido principal */}
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

// ── AdminLayoutInner — auth con AdminThemeProvider ya activo ──
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { theme } = useAdminTheme();
  const t = theme.tokens;
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setAuthorized(ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? ''));
    }
    if (!loading && !user) setAuthorized(false);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <div
          className="animate-spin w-8 h-8 rounded-full border-2"
          style={{ borderColor: t.accent, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <div className="p-8 max-w-md text-center" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: t.cardRadius }}>
          <Shield size={40} className="mx-auto mb-4" style={{ color: t.muted }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: t.text, fontFamily: t.fontHeading }}>
            Acceso Restringido
          </h1>
          <p className="text-sm mb-6" style={{ color: t.textSecondary }}>
            Necesitas iniciar sesión con una cuenta de administrador.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: t.sidebarBg, color: t.sidebarText, borderRadius: t.buttonRadius }}
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: t.bg }}>
        <div className="p-8 max-w-md text-center" style={{ backgroundColor: t.surface, border: `1px solid ${t.border}`, borderRadius: t.cardRadius }}>
          <Shield size={40} className="mx-auto mb-4" style={{ color: t.error }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: t.text, fontFamily: t.fontHeading }}>
            Sin Autorización
          </h1>
          <p className="text-sm mb-2" style={{ color: t.textSecondary }}>
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 text-sm font-semibold"
            style={{ backgroundColor: t.sidebarBg, color: t.sidebarText, borderRadius: t.buttonRadius }}
          >
            Volver al Sitio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AdminProvider>
      <AdminShell>{children}</AdminShell>
    </AdminProvider>
  );
}

// ── Root export — AdminThemeProvider único ────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminThemeProvider>
  );
}
