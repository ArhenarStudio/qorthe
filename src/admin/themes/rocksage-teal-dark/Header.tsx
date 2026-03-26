"use client";
// ═══════════════════════════════════════════════════════════════
// Komerzly OS — Header (barra de contexto de ventana activa)
// Muestra: página activa, período, búsqueda, notificaciones
// ═══════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronDown, X, Menu,
  ShoppingCart, Star, FileText, Package, DollarSign, ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';
import type { AdminHeaderProps } from '@/src/admin/types';

type Period = 'today' | '7days' | '30days' | 'custom';
const periodLabels: Record<Period, string> = {
  today: 'Hoy', '7days': '7 días', '30days': '30 días', custom: 'Personalizado',
};

// Notificaciones demo (mismas que DSD classic para coherencia)
const NOTIFS = [
  { id: 'n1', icon: ShoppingCart, iconBg: 'rgba(59,130,246,0.15)', iconColor: '#3B82F6',
    title: 'Nuevo pedido #165', detail: 'David Perez — $3,280 MXN', time: 'Hace 5 min',
    read: false, target: 'orders' as AdminPage },
  { id: 'n2', icon: Star, iconBg: 'rgba(245,158,11,0.15)', iconColor: '#F59E0B',
    title: 'Review 2★ pendiente', detail: 'Roberto S. — Prioridad', time: 'Hace 20 min',
    read: false, target: 'reviews' as AdminPage },
  { id: 'n3', icon: FileText, iconBg: 'rgba(167,139,250,0.15)', iconColor: '#A78BFA',
    title: 'Cotización COT-145', detail: '$52,000 — B2B', time: 'Hace 45 min',
    read: false, target: 'quotes' as AdminPage },
  { id: 'n4', icon: Package, iconBg: 'rgba(239,68,68,0.15)', iconColor: '#EF4444',
    title: 'Stock bajo — Rosa Morada', detail: '2 unidades restantes', time: 'Hace 1h',
    read: true, target: 'products' as AdminPage },
  { id: 'n5', icon: DollarSign, iconBg: 'rgba(34,197,94,0.15)', iconColor: '#22C55E',
    title: 'Anticipo recibido COT-142', detail: '$15,428 MXN', time: 'Hace 2h',
    read: true, target: 'finances' as AdminPage },
];

export const RockSageOSHeader: React.FC<AdminHeaderProps> = ({
  period: periodRaw, onPeriodChange, onNavigate, onMobileMenuToggle,
}) => {
  const period = (periodRaw as Period) in periodLabels ? (periodRaw as Period) : 'today';
  const { user, medusaCustomer } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const displayName = medusaCustomer?.first_name
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Admin';

  const unreadCount = NOTIFS.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3"
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        // El layout OS añade margin-top:40px para compensar el menubar fijo
      }}
    >
      {/* Left: mobile menu + greeting */}
      <div className="flex items-center gap-3 min-w-0">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu size={18} />
          </button>
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
            {displayName}
          </p>
          <p className="text-[10px] hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Search */}
        <div className="relative">
          {searchOpen ? (
            <div
              className="flex items-center rounded-lg overflow-hidden"
              style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', boxShadow: '0 0 0 3px rgba(13,148,136,0.15)' }}
            >
              <Search size={14} className="ml-2.5" style={{ color: 'var(--text-secondary)' }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="bg-transparent px-2 py-1.5 text-[12px] w-40 sm:w-56 outline-none"
                style={{ color: 'var(--text)', fontFamily: 'var(--font-body)' }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-1.5 mr-0.5 rounded transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)', background: 'transparent' }}
            >
              <Search size={16} />
            </button>
          )}
        </div>

        {/* Period selector */}
        <div className="relative hidden sm:block" ref={periodRef}>
          <button
            onClick={() => setPeriodOpen(!periodOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] rounded-lg transition-all"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
            }}
          >
            <Calendar size={12} style={{ color: 'var(--accent)' }} />
            <span>{periodLabels[period]}</span>
            <ChevronDown size={10} />
          </button>
          {periodOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl overflow-hidden z-20 min-w-[140px]"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              {(Object.keys(periodLabels) as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => { onPeriodChange(p); setPeriodOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[11px] transition-colors"
                  style={{
                    color: p === period ? 'var(--accent)' : 'var(--text-secondary)',
                    background: p === period ? 'rgba(13,148,136,0.1)' : 'transparent',
                    fontWeight: p === period ? 600 : 400,
                  }}
                >
                  {periodLabels[p]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold"
                style={{ background: '#EF4444', color: '#fff' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-[320px] rounded-xl overflow-hidden z-30"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
              }}
            >
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>Notificaciones</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#EF4444', color: '#fff' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                  className="flex items-center gap-0.5 text-[10px] font-medium transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Ver todas <ArrowRight size={9} />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {NOTIFS.map(n => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => { setNotifOpen(false); onNavigate(n.target); }}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 transition-all"
                      style={{
                        background: !n.read ? 'rgba(13,148,136,0.05)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: n.iconBg }}
                      >
                        <Icon size={13} color={n.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} />}
                          <p className="text-[12px] truncate" style={{ color: 'var(--text)', fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                        </div>
                        <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.detail}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
