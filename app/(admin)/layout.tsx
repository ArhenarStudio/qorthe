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

// Admin email whitelist — extend as needed
const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate, period, setPeriod } = useAdmin();
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
    <div className="min-h-screen bg-[#F5F3F0]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
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
              <AdminSidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggleCollapse={() => setMobileMenuOpen(false)}
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-3 right-3 p-1.5 bg-[#2d2419] rounded-full text-[#A1887F] hover:text-[#f5f0e8] z-50"
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
          marginLeft: isDesktop ? (sidebarCollapsed ? 68 : 256) : 0,
        }}
      >
        <AdminHeader
          period={period}
          onPeriodChange={setPeriod}
          onNavigate={handleNavigate}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
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
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#C5A065] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center">
        <div className="bg-white border border-[#EFEBE9] rounded-xl p-8 max-w-md text-center shadow-sm">
          <Shield size={40} className="mx-auto mb-4 text-[#A1887F]" />
          <h1 className="text-2xl text-[#2d2419] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
            Acceso Restringido
          </h1>
          <p className="text-[14px] text-[#795548] mb-6">
            Necesitas iniciar sesión con una cuenta de administrador.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-[#2d2419] text-white text-[13px] font-semibold rounded-lg hover:bg-[#3e3226] transition-colors"
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
      <div className="min-h-screen bg-[#F5F3F0] flex items-center justify-center">
        <div className="bg-white border border-[#EFEBE9] rounded-xl p-8 max-w-md text-center shadow-sm">
          <Shield size={40} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl text-[#2d2419] mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
            Sin Autorización
          </h1>
          <p className="text-[14px] text-[#795548] mb-2">
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-[#2d2419] text-white text-[13px] font-semibold rounded-lg hover:bg-[#3e3226] transition-colors"
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
