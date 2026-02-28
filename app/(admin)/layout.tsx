"use client";

// ═══════════════════════════════════════════════════════════════
// Admin Layout — Minimal layout for admin pages
//
// No site header/footer. Simple admin navigation.
// Auth check: only admin emails can access.
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Package, LayoutDashboard, LogOut, Shield } from "lucide-react";

// Admin email whitelist — extend as needed
const ADMIN_EMAILS = [
  "admin@davidsonsdesign.com",
  "designdavidsons@gmail.com",
  "studiorockstage@gmail.com",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#795548] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="bg-white border border-[#EFEBE9] rounded-lg p-8 max-w-md text-center">
          <Shield size={40} className="mx-auto mb-4 text-[#A1887F]" />
          <h1 className="font-serif text-2xl text-[#2d2419] mb-2">Acceso Restringido</h1>
          <p className="text-[14px] text-[#795548] mb-6">
            Necesitas iniciar sesión con una cuenta de administrador.
          </p>
          <Link
            href="/auth"
            className="inline-block px-6 py-3 bg-[#2d2419] text-white text-[13px] font-semibold rounded hover:bg-[#3e3226] transition-colors"
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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="bg-white border border-[#EFEBE9] rounded-lg p-8 max-w-md text-center">
          <Shield size={40} className="mx-auto mb-4 text-red-400" />
          <h1 className="font-serif text-2xl text-[#2d2419] mb-2">Sin Autorización</h1>
          <p className="text-[14px] text-[#795548] mb-2">
            Tu cuenta ({user.email}) no tiene permisos de administrador.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-[#2d2419] text-white text-[13px] font-semibold rounded hover:bg-[#3e3226] transition-colors"
          >
            Volver al Sitio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      {/* Admin Topbar */}
      <header className="bg-[#2d2419] text-white h-14 flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin/shipping" className="font-serif text-lg tracking-wide">
            DSD Admin
          </Link>
          <nav className="flex items-center gap-1 ml-4">
            <Link
              href="/admin/shipping"
              className="flex items-center gap-2 px-3 py-1.5 rounded text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Package size={15} />
              Envíos
            </Link>
            {/* Future: more admin links */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-white/60">{user.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-[12px] text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
