"use client";
// ═══════════════════════════════════════════════════════════════
// RockSage OS — Sidebar (OS-style menubar top + dock bottom)
// Sin sidebar lateral. Concepto: "sistema operativo propio".
// Fuente de verdad visual: rocksage-os-v3.html
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import type { AdminSidebarProps } from '@/src/admin/types';
import type { AdminPage } from '@/src/admin/navigation';
import {
  LayoutDashboard, ShoppingBag, Truck, Package, FolderTree, Boxes,
  Users, Star, FileText, Megaphone, DollarSign,
  BarChart3, FileEdit, Bell, Settings,
  Zap, Plug, Palette, RotateCcw, Headphones, ArrowUpDown,
  Target, MessageSquare, Monitor, Crown, ExternalLink,
  type LucideIcon,
} from 'lucide-react';

// ── Tipos internos ─────────────────────────────────────────────
interface AppGroup {
  id: string;
  label: string;
  color: string;
  colorSubtle: string;
  items: Array<{ id: AdminPage; label: string; icon: LucideIcon }>;
}

// ── Grupos de apps (coinciden con navegación) ──────────────────
const APP_GROUPS: AppGroup[] = [
  {
    id: 'ventas', label: 'Ventas',
    color: '#0D9488', colorSubtle: 'rgba(13,148,136,0.15)',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'pos', label: 'POS', icon: Zap },
      { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
      { id: 'shipping', label: 'Envíos', icon: Truck },
      { id: 'quotes', label: 'Cotizaciones', icon: FileText },
      { id: 'returns', label: 'Devoluciones', icon: RotateCcw },
    ],
  },
  {
    id: 'catalogo', label: 'Catálogo',
    color: '#22C55E', colorSubtle: 'rgba(34,197,94,0.15)',
    items: [
      { id: 'products', label: 'Productos', icon: Package },
      { id: 'inventory', label: 'Inventario', icon: Boxes },
      { id: 'categories', label: 'Categorías', icon: FolderTree },
    ],
  },
  {
    id: 'clientes', label: 'Clientes',
    color: '#3B82F6', colorSubtle: 'rgba(59,130,246,0.15)',
    items: [
      { id: 'customers', label: 'Clientes', icon: Users },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'loyalty', label: 'Membresías', icon: Crown },
      { id: 'chat', label: 'Chat', icon: MessageSquare },
      { id: 'helpdesk', label: 'Soporte', icon: Headphones },
    ],
  },
  {
    id: 'crecimiento', label: 'Crecimiento',
    color: '#EC4899', colorSubtle: 'rgba(236,72,153,0.15)',
    items: [
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'goals', label: 'Metas', icon: Target },
    ],
  },
  {
    id: 'finanzas', label: 'Finanzas',
    color: '#F59E0B', colorSubtle: 'rgba(245,158,11,0.15)',
    items: [
      { id: 'finances', label: 'Finanzas', icon: DollarSign },
      { id: 'reports', label: 'Reportes', icon: BarChart3 },
    ],
  },
  {
    id: 'contenido', label: 'Contenido',
    color: '#A78BFA', colorSubtle: 'rgba(167,139,250,0.15)',
    items: [
      { id: 'cms', label: 'CMS', icon: FileEdit },
      { id: 'theme', label: 'Editor Tema', icon: Palette },
      { id: 'appearance', label: 'Apariencia', icon: Monitor },
    ],
  },
  {
    id: 'sistema', label: 'Sistema',
    color: '#64748B', colorSubtle: 'rgba(100,116,139,0.15)',
    items: [
      { id: 'automations', label: 'Automaciones', icon: Zap },
      { id: 'integrations', label: 'Integraciones', icon: Plug },
      { id: 'importexport', label: 'Import/Export', icon: ArrowUpDown },
      { id: 'notifications', label: 'Notificaciones', icon: Bell },
      { id: 'users', label: 'Equipo', icon: Users },
      { id: 'settings', label: 'Configuración', icon: Settings },
    ],
  },
];

// ── Dock: accesos rápidos siempre visibles ─────────────────────
const DOCK_ITEMS: Array<{ id: AdminPage; label: string; icon: LucideIcon }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'pos', label: 'POS', icon: Zap },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'settings', label: 'Config', icon: Settings },
];

// ── Componente principal ───────────────────────────────────────
export const RockSageOSSidebar: React.FC<AdminSidebarProps> = ({
  currentPage, onNavigate,
}) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [dashRes, quotesRes] = await Promise.allSettled([
          fetch('/api/admin/dashboard?period=30d').then(r => r.ok ? r.json() : null),
          fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null),
        ]);
        const badges: Record<string, number> = {};
        const dash = dashRes.status === 'fulfilled' ? dashRes.value : null;
        if (dash?.kpis?.pending_orders > 0) badges.orders = dash.kpis.pending_orders;
        const quotes = quotesRes.status === 'fulfilled' ? quotesRes.value : null;
        const newQ = (quotes?.quotes || []).filter((q: { status: string }) => q.status === 'nueva').length;
        if (newQ > 0) badges.quotes = newQ;
        setLiveBadges(badges);
      } catch { /* silent */ }
    };
    fetchBadges();
    const id = setInterval(fetchBadges, 120_000);
    return () => clearInterval(id);
  }, []);

  const currentGroup = APP_GROUPS.find(g => g.items.some(i => i.id === currentPage));

  return (
    <>
      {/* ── TOP MENUBAR ─────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center h-10 px-4 gap-1"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 mr-3 shrink-0"
        >
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.9"/>
              <rect x="5.5" y="1" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.7"/>
              <rect x="1" y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.7"/>
              <rect x="5.5" y="5.5" width="3.5" height="3.5" rx="0.8" fill="white" opacity="0.5"/>
            </svg>
          </div>
          <span
            className="text-[12px] font-semibold hidden sm:block"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}
          >
            RockSage
          </span>
        </button>

        {/* Group tabs */}
        <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {APP_GROUPS.map(group => {
            const isHighlighted = activeGroup === group.id ||
              (!activeGroup && currentGroup?.id === group.id);
            return (
              <div key={group.id} className="relative shrink-0">
                <button
                  onMouseEnter={() => setActiveGroup(group.id)}
                  onClick={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md transition-all"
                  style={{
                    color: isHighlighted ? group.color : 'var(--text-secondary)',
                    background: isHighlighted ? group.colorSubtle : 'transparent',
                  }}
                >
                  {group.label}
                </button>

                {/* Dropdown panel */}
                {activeGroup === group.id && (
                  <div
                    className="absolute top-full left-0 mt-1 min-w-[176px] rounded-xl overflow-hidden z-50"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                    onMouseLeave={() => setActiveGroup(null)}
                  >
                    <div
                      className="px-3 py-2 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span
                        className="text-[9px] font-bold uppercase tracking-widest"
                        style={{ color: group.color }}
                      >
                        {group.label}
                      </span>
                    </div>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isItemActive = currentPage === item.id;
                      const badge = liveBadges[item.id] || 0;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { onNavigate(item.id); setActiveGroup(null); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-all"
                          style={{
                            background: isItemActive ? group.colorSubtle : 'transparent',
                            color: isItemActive ? group.color : 'var(--text-secondary)',
                          }}
                        >
                          <Icon size={13} strokeWidth={isItemActive ? 2 : 1.5} />
                          <span className="flex-1">{item.label}</span>
                          {badge > 0 && (
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                              style={{ background: group.colorSubtle, color: group.color }}
                            >
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Tienda link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] shrink-0 transition-all"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ExternalLink size={11} />
          <span className="hidden sm:inline">Tienda</span>
        </a>
      </header>

      {/* Overlay para cerrar dropdown */}
      {activeGroup && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveGroup(null)} />
      )}

      {/* ── BOTTOM DOCK ─────────────────────────────────────── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-2xl"
        style={{
          background: 'rgba(15,17,20,0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {DOCK_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const badge = liveBadges[item.id] || 0;
          return (
            <div key={item.id} className="relative group/dock">
              <button
                onClick={() => onNavigate(item.id)}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all"
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)'
                    : '#161A1F',
                  boxShadow: isActive ? '0 0 12px rgba(13,148,136,0.4)' : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2 : 1.5}
                  color={isActive ? '#fff' : 'var(--text-secondary)'}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold"
                    style={{ background: '#EF4444', color: '#fff' }}
                  >
                    {badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/dock:opacity-100 transition-opacity"
                style={{
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#0D9488' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
