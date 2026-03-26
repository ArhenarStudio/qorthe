"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Truck, Package, FolderTree, Boxes,
  Users, Star, FileText, Megaphone, DollarSign,
  BarChart3, FileEdit, Bell, Settings,
  ExternalLink, LogOut, Zap, Plug, Palette,
  RotateCcw, Headphones, ArrowUpDown, Target, Search, ChevronDown, X,
  PanelLeftClose, PanelLeft, MessageSquare, Monitor
} from 'lucide-react';

export type AdminPage =
  | 'dashboard' | 'orders' | 'shipping' | 'products' | 'categories' | 'inventory'
  | 'customers' | 'reviews' | 'quotes' | 'marketing' | 'chat'
  | 'finances' | 'reports' | 'cms' | 'notifications' | 'automations'
  | 'integrations' | 'theme' | 'appearance' | 'returns' | 'helpdesk' | 'importexport' | 'goals' | 'settings'
  | 'pos' | 'users' | 'loyalty' | 'modules';

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: 'general',
    label: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    items: [
      { id: 'pos', label: 'Punto de Venta', icon: Zap },
      { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
      { id: 'shipping', label: 'Envios', icon: Truck },
      { id: 'quotes', label: 'Cotizaciones', icon: FileText },
      { id: 'returns', label: 'Devoluciones', icon: RotateCcw },
    ],
  },
  {
    id: 'catalogo',
    label: 'Catalogo',
    items: [
      { id: 'products', label: 'Productos', icon: Package },
      { id: 'inventory', label: 'Inventario', icon: Boxes },
      { id: 'categories', label: 'Categorias', icon: FolderTree },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      { id: 'customers', label: 'Clientes', icon: Users },
      { id: 'reviews', label: 'Reviews', icon: Star },
      { id: 'loyalty', label: 'Membresías', icon: Star },
      { id: 'chat', label: 'Chat en Vivo', icon: MessageSquare },
      { id: 'helpdesk', label: 'Soporte', icon: Headphones },
    ],
  },
  {
    id: 'crecimiento',
    label: 'Crecimiento',
    items: [
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'goals', label: 'Metas y OKRs', icon: Target },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    items: [
      { id: 'finances', label: 'Finanzas', icon: DollarSign },
      { id: 'reports', label: 'Reportes', icon: BarChart3 },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    items: [
      { id: 'cms', label: 'CMS', icon: FileEdit },
      { id: 'theme', label: 'Editor de Tema', icon: Palette },
      { id: 'appearance', label: 'Apariencia del Panel', icon: Monitor },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      { id: 'automations', label: 'Automatizaciones', icon: Zap },
      { id: 'integrations', label: 'Integraciones', icon: Plug },
      { id: 'importexport', label: 'Importar / Exportar', icon: ArrowUpDown },
      { id: 'notifications', label: 'Notificaciones', icon: Bell },
      { id: 'users', label: 'Equipo', icon: Users },
      { id: 'settings', label: 'Configuracion', icon: Settings },
    ],
  },
];

const allNavItems = navGroups.flatMap(g => g.items);

interface AdminSidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPage, onNavigate, collapsed, onToggleCollapse
}) => {
  const { user, medusaCustomer } = useAuth();
  const [siteOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});

  // Fetch real badge counts from APIs
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const [dashRes, quotesRes, reviewsRes, ticketsRes] = await Promise.allSettled([
          fetch('/api/admin/dashboard?period=30d').then(r => r.ok ? r.json() : null),
          fetch('/api/admin/quotes').then(r => r.ok ? r.json() : null),
          fetch('/api/admin/reviews?limit=1').then(r => r.ok ? r.json() : null),
          fetch('/api/admin/tickets').then(r => r.ok ? r.json() : null),
        ]);

        const badges: Record<string, number> = {};
        
        // Pending orders from dashboard KPIs
        const dash = dashRes.status === 'fulfilled' ? dashRes.value : null;
        if (dash?.kpis?.pending_orders > 0) badges.orders = dash.kpis.pending_orders;
        if (dash?.kpis?.canceled_count > 0) badges.returns = dash.kpis.canceled_count;

        // New quotes (status = nueva)
        const quotes = quotesRes.status === 'fulfilled' ? quotesRes.value : null;
        const newQuotes = (quotes?.quotes || []).filter((q: any) => q.status === 'nueva').length;
        if (newQuotes > 0) badges.quotes = newQuotes;

        // Pending reviews
        const reviews = reviewsRes.status === 'fulfilled' ? reviewsRes.value : null;
        if (reviews?.counts?.pending > 0) badges.reviews = reviews.counts.pending;

        // Open support tickets
        const tickets = ticketsRes.status === 'fulfilled' ? ticketsRes.value : null;
        const openTickets = (tickets?.stats?.open || 0) + (tickets?.stats?.inProgress || 0);
        if (openTickets > 0) badges.helpdesk = openTickets;

        setLiveBadges(badges);
      } catch { /* silent — badges are non-critical */ }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 120_000);
    return () => clearInterval(interval);
  }, []);

  const adminName = medusaCustomer
    ? `${medusaCustomer.first_name} ${medusaCustomer.last_name}`.trim()
    : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const searchActive = searchQuery.trim().length > 0;

  const filteredItems = useMemo(() => {
    if (!searchActive) return null;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter(item => item.label.toLowerCase().includes(q));
  }, [searchQuery, searchActive]);

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = currentPage === item.id;
    const ItemIcon = item.icon;
    const badgeCount = liveBadges[item.id] || 0;

    return (
      <button
        key={item.id}
        onClick={() => { onNavigate(item.id); setSearchQuery(''); }}
        title={collapsed ? item.label : undefined}
        className={`
          w-full flex items-center gap-2.5 text-[13px] transition-all relative group
          ${collapsed ? 'px-0 py-2 justify-center rounded-[var(--radius-card)]' : 'px-2.5 py-[7px] rounded-[var(--radius-card)]'}
          ${isActive
            ? ''
            : 'hover:bg-[var(--surface2)]/70'
          }
        `}
      >
        {/* Active pill background */}
        {isActive && (
          <motion.div
            layoutId="sidebar-pill"
            className="absolute inset-0 rounded-[var(--radius-card)]"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              boxShadow: 'var(--shadow-lg)',
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}

        <div className={`
          relative z-10 flex items-center justify-center w-5 h-5 transition-colors
          ${isActive ? 'text-[var(--sidebar-text)]' : 'text-[var(--text-muted)]'}
        `}>
          <ItemIcon size={16} strokeWidth={isActive ? 2 : 1.5} />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12 }}
              className={`
                relative z-10 truncate flex-1 text-left transition-colors
                ${isActive ? 'text-[var(--sidebar-text)] font-medium' : 'text-[var(--text-secondary)]'}
              `}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {badgeCount > 0 && (
          <span className={`
            relative z-10
            ${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
            min-w-[18px] h-[18px] flex items-center justify-center rounded-[var(--radius-badge)] px-1
            text-[9px] font-bold
            ${isActive
              ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-text)]'
              : 'bg-amber-50 text-amber-600 border border-amber-200/50'
            }
          `}>
            {badgeCount}
          </span>
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <span className="
            absolute left-full ml-2.5 bg-[var(--surface)] text-[var(--text)] text-[11px] px-2.5 py-1.5 rounded-[var(--radius-card)]
            opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]
            border border-[var(--border)] shadow-lg shadow-stone-200/50
          ">
            {item.label}
            {badgeCount > 0 && (
              <span className="ml-1.5 bg-amber-50 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded-[var(--radius-badge)] border border-amber-200/50">
                {badgeCount}
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed left-0 top-0 h-full flex flex-col z-50 overflow-hidden backdrop-blur-xl border-r"
        style={{ backgroundColor: "var(--sidebar-bg, rgba(255,255,255,0.8))", borderColor: "var(--sidebar-border, rgba(214,211,209,0.6))" }}
    >
      {/* ===== HEADER / BRAND ===== */}
      <div className={`px-3 pt-4 pb-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-0.5'}`}>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <h1 className="text-[13px] text-stone-800 tracking-wide truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Qorthe
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-[5px] h-[5px] rounded-[var(--radius-badge)] ring-2 ${siteOnline ? 'bg-emerald-400 ring-emerald-100' : 'bg-red-400 ring-red-100'}`} />
                  <span className="text-[10px] text-[var(--text-muted)]">{siteOnline ? 'Online' : 'Offline'}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ===== COLLAPSE TOGGLE ===== */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-[18px] -right-[13px] w-[26px] h-[26px] rounded-[var(--radius-badge)] flex items-center justify-center z-10 transition-all bg-[var(--surface)] border border-[var(--border)] shadow-sm hover:shadow-md hover:border-[var(--border)] group/toggle"
      >
        {collapsed
          ? <PanelLeft size={12} className="text-[var(--text-muted)] group-hover/toggle:text-[var(--accent)] transition-colors" />
          : <PanelLeftClose size={12} className="text-[var(--text-muted)] group-hover/toggle:text-[var(--accent)] transition-colors" />
        }
      </button>

      {/* ===== SEARCH ===== */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-1 overflow-hidden"
          >
            <div className="relative mt-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar seccion..."
                className="w-full pl-8 pr-7 py-[6px] rounded-[var(--radius-card)] bg-[var(--surface2)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] focus:bg-[var(--surface)] transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  <X size={12} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DIVIDER ===== */}
      <div className="mx-3 mt-1.5 mb-0.5 border-t border-stone-100" />

      {/* ===== NAVIGATION ===== */}
      <nav className="flex-1 py-1 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {searchActive && filteredItems ? (
          <div className="space-y-0.5 pt-1">
            {!collapsed && (
              <p className="px-2.5 py-1.5 text-[9px] text-[var(--text-muted)] uppercase tracking-[0.15em]">
                {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''}
              </p>
            )}
            {filteredItems.map(item => renderNavItem(item))}
            {filteredItems.length === 0 && !collapsed && (
              <p className="px-3 py-6 text-[11px] text-[var(--text-muted)] text-center">Sin resultados</p>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {navGroups.map((group) => {
              const isGroupCollapsed = collapsedGroups.has(group.id);
              const groupHasActive = group.items.some(i => i.id === currentPage);
              const groupBadgeCount = group.items.reduce((acc, item) => acc + (liveBadges[item.id] || 0), 0);

              return (
                <div key={group.id}>
                  {/* Section header */}
                  {!collapsed && group.label ? (
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-2.5 pt-4 pb-1 group/header"
                    >
                      <span className={`
                        text-[10px] uppercase tracking-[0.12em] transition-colors
                        ${groupHasActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover/header:text-[var(--text-secondary)]'}
                      `}>
                        {group.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isGroupCollapsed && groupBadgeCount > 0 && (
                          <span className="w-4 h-4 flex items-center justify-center rounded-[var(--radius-badge)] bg-amber-50 text-amber-600 text-[8px] font-bold border border-amber-200/60">
                            {groupBadgeCount}
                          </span>
                        )}
                        <motion.div
                          animate={{ rotate: isGroupCollapsed ? -90 : 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ChevronDown size={10} className="text-[var(--text-muted)]" />
                        </motion.div>
                      </div>
                    </button>
                  ) : collapsed && group.id !== 'general' ? (
                    <div className="mx-2 my-2 border-t border-stone-100" />
                  ) : null}

                  {/* Items */}
                  <AnimatePresence initial={false}>
                    {(!isGroupCollapsed || collapsed) && (
                      <motion.div
                        initial={!collapsed && group.label ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={!collapsed && group.label ? { height: 0, opacity: 0 } : undefined}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="overflow-hidden space-y-[2px]"
                      >
                        {group.items.map(item => renderNavItem(item))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* ===== FOOTER ===== */}
      <div className="border-t border-stone-100">
        {/* Quick actions */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="px-3 pt-2.5 flex gap-1.5"
            >
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] bg-[var(--surface2)] hover:opacity-80 border border-[var(--border)]  rounded-[var(--radius-card)] py-[5px] transition-all"
              >
                <ExternalLink size={10} /> Ver tienda
              </a>
              <button className="flex-1 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] hover:text-[var(--error)] bg-[var(--surface2)] hover:bg-[var(--error-subtle)]/50 border border-[var(--border)] hover:border-red-200/60 rounded-[var(--radius-card)] py-[5px] transition-all">
                <LogOut size={10} /> Cerrar sesion
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User */}
        <div className={`p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
            {/* Avatar with status ring */}
            <div className="relative flex-shrink-0 group/avatar">
              <div
                className="w-8 h-8 rounded-[var(--radius-card)] flex items-center justify-center overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <span className="text-[11px] font-bold text-[var(--sidebar-text)]">DA</span>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-[var(--radius-badge)]" />
              {/* Collapsed tooltip for user */}
              {collapsed && (
                <span className="
                  absolute left-full ml-2.5 bg-[var(--surface)] text-[var(--text)] text-[11px] px-2.5 py-1.5 rounded-[var(--radius-card)]
                  opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[60]
                  border border-[var(--border)] shadow-lg shadow-stone-200/50
                ">
                  {adminName}
                  <span className="block text-[9px] text-[var(--text-muted)]">Owner</span>
                </span>
              )}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-[12px] text-[var(--text)] truncate font-medium">{adminName}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Owner</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};