"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronDown, X, Menu, ShoppingCart, Star, FileText, Package, DollarSign, ArrowRight } from 'lucide-react';
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
    iconCls: 'bg-blue-50 text-blue-600',
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
    iconCls: 'bg-purple-50 text-purple-600',
    title: 'Cotización COT-145',
    detail: '$52,000 — B2B',
    time: 'Hace 45 min',
    read: false,
    target: 'quotes' as AdminPage,
  },
  {
    id: 'hn4',
    icon: Package,
    iconCls: 'bg-red-50 text-red-500',
    title: 'Stock bajo — Rosa Morada',
    detail: '2 unidades restantes',
    time: 'Hace 1h',
    read: true,
    target: 'products' as AdminPage,
  },
  {
    id: 'hn5',
    icon: DollarSign,
    iconCls: 'bg-green-50 text-green-600',
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

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
    <header className="bg-white border-b border-wood-100 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Greeting + mobile menu */}
        <div className="flex items-center gap-3 min-w-0">
          {onMobileMenuToggle && (
            <button onClick={onMobileMenuToggle} className="lg:hidden p-2 -ml-2 text-wood-600 hover:text-wood-900">
              <Menu size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-serif text-wood-900 truncate">{greeting}, David</h2>
            <p className="text-xs text-wood-400 capitalize hidden sm:block">{dateStr}</p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center bg-sand-50 border border-wood-200 rounded-lg overflow-hidden">
                <Search size={16} className="ml-3 text-wood-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar pedidos, productos..."
                  className="bg-transparent px-2 py-2 text-sm w-40 sm:w-64 outline-none text-wood-900 placeholder:text-wood-400"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 text-wood-400 hover:text-wood-600">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-wood-500 hover:text-wood-900 hover:bg-sand-50 rounded-lg transition-colors">
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Period Selector */}
          <div className="relative hidden sm:block" ref={periodRef}>
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-wood-600 bg-sand-50 border border-wood-200 rounded-lg hover:border-wood-300 transition-colors"
            >
              <Calendar size={14} />
              <span>{periodLabels[period]}</span>
              <ChevronDown size={12} />
            </button>
            {periodOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-wood-200 rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                {(Object.keys(periodLabels) as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { onPeriodChange(p); setPeriodOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-sand-50 transition-colors ${p === period ? 'text-accent-gold font-medium' : 'text-wood-600'}`}
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
              className="relative p-2 text-wood-500 hover:text-wood-900 hover:bg-sand-50 rounded-lg transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-[340px] bg-white border border-wood-200 rounded-xl shadow-xl z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-wood-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-wood-900">Notificaciones</h4>
                    {unreadCount > 0 && (
                      <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="text-[10px] text-accent-gold font-medium hover:underline flex items-center gap-0.5"
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
                        className={`w-full text-left px-4 py-3 border-b border-wood-50 hover:bg-sand-50/80 transition-colors flex items-start gap-3 ${!n.read ? 'bg-accent-gold/5' : ''}`}
                      >
                        <div className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ' + n.iconCls}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                            <p className={'text-xs text-wood-900 truncate ' + (!n.read ? 'font-medium' : '')}>{n.title}</p>
                            {n.priority && <span className="text-[8px] font-bold bg-red-50 text-red-500 px-1 py-0.5 rounded shrink-0">!</span>}
                          </div>
                          <p className="text-[11px] text-wood-500 truncate">{n.detail}</p>
                          <p className="text-[10px] text-wood-400 mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 bg-sand-50/50 border-t border-wood-100">
                  <button
                    onClick={() => { setNotifOpen(false); onNavigate('notifications'); }}
                    className="w-full text-center text-[11px] text-accent-gold font-medium hover:underline flex items-center justify-center gap-1"
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
