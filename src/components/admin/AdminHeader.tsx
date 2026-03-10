"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronDown, X, Menu, ShoppingCart, Star, FileText, Package, DollarSign, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from './AdminSidebar';

type Period = 'today' | '7days' | '30days' | 'custom';
const periodLabels: Record<Period, string> = {
  today: 'Hoy',
  '7days': '7 días',
  '30days': '30 días',
  custom: 'Personalizado',
};

// Rich notification data matching the spec
const headerNotifs = [
  {
    id: 'hn1',
    icon: ShoppingCart,
    iconCls: 'bg-[var(--info-subtle)] text-[var(--info)]',
    title: 'Nuevo pedido #165',
    detail: 'David Perez — $3,280 MXN',
    time: 'Hace 5 min',
    read: false,
    target: 'orders' as AdminPage,
  },
  {
    id: 'hn2',
    icon: Star,
    iconCls: 'bg-amber-50 text-amber-600',
    title: 'Review 2★ pendiente',
    detail: 'Roberto S. — Prioridad',
    time: 'Hace 20 min',
    read: false,
    priority: true,
    target: 'reviews' as AdminPage,
  },
  {
    id: 'hn3',
    icon: FileText,
    iconCls: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
    title: 'Cotización COT-145',
    detail: '$52,000 — B2B',
    time: 'Hace 45 min',
    read: false,
    target: 'quotes' as AdminPage,
  },
  {
    id: 'hn4',
    icon: Package,
    iconCls: 'bg-[var(--error-subtle)] text-[var(--error)]',
    title: 'Stock bajo — Rosa Morada',
    detail: '2 unidades restantes',
    time: 'Hace 1h',
    read: true,
    target: 'products' as AdminPage,
  },
  {
    id: 'hn5',
    icon: DollarSign,
    iconCls: 'bg-[var(--success-subtle)] text-[var(--success)]',
    title: 'Anticipo recibido COT-142',
    detail: 'David Perez — $15,428',
    time: 'Hace 2h',
    read: true,
    target: 'finances' as AdminPage,
  },
];

interface AdminHeaderProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ period, onPeriodChange, onNavigate, onMobileMenuToggle }) => {
  const { user, medusaCustomer } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Derive display name: medusaCustomer > supabase metadata > email prefix
  const displayName = medusaCustomer?.first_name
    || user?.user_metadata?.full_name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || 'Admin';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr = now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const unreadCount = headerNotifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) setPeriodOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Greeting + mobile menu */}
        <div className="flex items-center gap-3 min-w-0">
          {onMobileMenuToggle && (
            <button onClick={onMobileMenuToggle} className="lg:hidden p-2 -ml-2 text-[var(--text-secondary)] hover:text-[var(--text)]">
              <Menu size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-serif text-[var(--text)] truncate">{greeting}, {displayName}</h2>
            <p className="text-xs text-[var(--text-muted)] capitalize hidden sm:block">{dateStr}</p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center bg-[var(--surface2)] border border-[var(--border)] rounded-[var(--radius-card)] overflow-hidden">
                <Search size={16} className="ml-3 text-[var(--text-muted)]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar pedidos, productos..."
                  className="bg-transparent px-2 py-2 text-sm w-40 sm:w-64 outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface2)] rounded-[var(--radius-card)] transition-colors">
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Period Selector */}
          <div className="relative hidden sm:block" ref={periodRef}>
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--surface2)] border border-[var(--border)] rounded-[var(--radius-card)] hover:border-wood-300 transition-colors"
            >
              <Calendar size={14} />
              <span>{periodLabels[period]}</span>
              <ChevronDown size={12} />
            </button>
            {periodOpen && (
              <div className="absolute right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-lg py-1 z-20 min-w-[140px]">
                {(Object.keys(periodLabels) as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { onPeriodChange(p); setPeriodOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[var(--surface2)] transition-colors ${p === period ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-secondary)]'}`}
                  >
                    {periodLabels[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface2)] rounded-[var(--radius-card)] transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-[var(--radius-badge)] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[340px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-card)] shadow-xl z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[var(--text)]">Notificaciones</h4>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-[var(--radius-badge)]">{unreadCount}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="text-[10px] text-[var(--accent)] font-medium hover:underline flex items-center gap-0.5"
                  >
                    Ver todas <ArrowRight size={8} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {headerNotifs.map(n => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.id}
                        onClick={() => { setNotifOpen(false); onNavigate(n.target); }}
                        className={`w-full text-left px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--surface2)]/80 transition-colors flex items-start gap-3 ${!n.read ? 'bg-[var(--accent)]/5' : ''}`}
                      >
                        <div className={'w-8 h-8 rounded-[var(--radius-card)] flex items-center justify-center shrink-0 mt-0.5 ' + n.iconCls}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-[var(--radius-badge)] bg-red-500 shrink-0" />}
                            <p className={'text-xs text-[var(--text)] truncate ' + (!n.read ? 'font-medium' : '')}>{n.title}</p>
                            {n.priority && <span className="text-[8px] font-bold bg-[var(--error-subtle)] text-[var(--error)] px-1 py-0.5 rounded shrink-0">!</span>}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">{n.detail}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 bg-[var(--surface2)]/50 border-t border-[var(--border)]">
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="w-full text-center text-[11px] text-[var(--accent)] font-medium hover:underline flex items-center justify-center gap-1"
                  >
                    Ver todas las notificaciones <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export type { Period };
