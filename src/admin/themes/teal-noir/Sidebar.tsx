"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ChevronLeft, ChevronRight, Hexagon, X } from 'lucide-react';
import type { AdminPage, NavItem, NavGroup } from '@/src/admin/navigation';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const TealNoirSidebar: React.FC<Props> = ({ currentPage, onNavigate, collapsed, onToggleCollapse, navigation }) => {
  const { user, medusaCustomer } = useAuth();
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/dashboard?period=30d');
        if (!res.ok) return;
        const dash = await res.json();
        const badges: Record<string, number> = {};
        if (dash?.kpis?.pending_orders > 0) badges.orders = dash.kpis.pending_orders;
        setLiveBadges(badges);
      } catch {}
    };
    fetchBadges();
  }, []);

  const adminName = medusaCustomer
    ? `${medusaCustomer.first_name} ${medusaCustomer.last_name}`.trim()
    : user?.email?.split('@')[0] || 'Admin';

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || '')[0]}${(medusaCustomer.last_name || '')[0]}`.toUpperCase()
    : 'RS';

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full flex flex-col z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16" style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(20,184,166,0.1)' }}>
          <Hexagon className="w-5 h-5" style={{ color: 'var(--admin-accent)' }} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--admin-sidebar-text)', fontFamily: 'var(--admin-font-heading)' }}>RockSage</p>
              <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>Commerce</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-[18px] -right-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
      >
        {collapsed ? <ChevronRight size={12} style={{ color: 'var(--admin-muted)' }} /> : <ChevronLeft size={12} style={{ color: 'var(--admin-muted)' }} />}
      </button>

      {/* Search */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-muted)' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-7 py-[6px] rounded-lg text-[11px] outline-none transition-all"
                style={{ backgroundColor: 'var(--admin-surface2)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', fontFamily: 'var(--admin-font-body)' }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--admin-muted)' }}><X size={12} /></button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {navigation.map((group) => (
          <div key={group.id}>
            {!collapsed && group.label && (
              <p className="px-2.5 pt-4 pb-1.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-heading)' }}>
                {group.label}
              </p>
            )}
            {collapsed && group.id !== 'general' && (
              <div className="mx-2 my-2" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }} />
            )}
            <div className="space-y-[2px]">
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                const badge = liveBadges[item.id] || 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-2.5 text-[13px] transition-all ${collapsed ? 'px-0 py-2 justify-center rounded-xl' : 'px-2.5 py-[7px] rounded-lg'}`}
                    style={{
                      backgroundColor: isActive ? 'var(--admin-sidebar-active)' : 'transparent',
                      color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                      fontFamily: 'var(--admin-font-body)',
                    }}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                    {!collapsed && <span className="truncate flex-1 text-left" style={{ color: isActive ? 'var(--admin-sidebar-text)' : 'var(--admin-text-secondary)' }}>{item.label}</span>}
                    {!collapsed && badge > 0 && (
                      <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 text-[9px] font-bold"
                        style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}>{badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--admin-sidebar-border)' }} className="p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, var(--admin-accent), #06b6d4)', boxShadow: '0 2px 8px rgba(20,184,166,0.3)' }}>
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium truncate" style={{ color: 'var(--admin-sidebar-text)' }}>{adminName}</p>
              <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>Owner</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
