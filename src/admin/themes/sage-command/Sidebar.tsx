"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';
import type { AdminPage, NavGroup } from '@/src/admin/navigation';
import { logger } from '@/src/lib/logger';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const SageCommandSidebar: React.FC<Props> = ({ currentPage, onNavigate, collapsed, onToggleCollapse, navigation }) => {
  const { user, medusaCustomer } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/admin/dashboard?period=30d').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.kpis?.pending_orders > 0) setLiveBadges({ orders: d.kpis.pending_orders });
    }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e));
  }, []);

  const adminName = medusaCustomer ? `${medusaCustomer.first_name} ${medusaCustomer.last_name}`.trim() : user?.email?.split('@')[0] || 'Admin';
  const initials = medusaCustomer ? `${(medusaCustomer.first_name || '')[0]}${(medusaCustomer.last_name || '')[0]}`.toUpperCase() : 'RS';

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full flex flex-col z-50 overflow-hidden"
      style={{ backgroundColor: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-info))', boxShadow: '0 2px 8px rgba(20,184,166,0.3)' }}>
          <Hexagon size={16} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[13px] font-semibold" style={{ color: 'var(--admin-sidebar-text)', fontFamily: 'var(--admin-font-heading)' }}>
              RockSage
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse */}
      <button onClick={onToggleCollapse} className="absolute top-[14px] -right-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
        {collapsed ? <ChevronRight size={12} style={{ color: 'var(--admin-muted)' }} /> : <ChevronLeft size={12} style={{ color: 'var(--admin-muted)' }} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {navigation.map((group) => (
          <div key={group.id}>
            {!collapsed && group.label && (
              <p className="px-2.5 pt-5 pb-1.5 text-[10px] uppercase tracking-[0.14em] font-medium"
                style={{ color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-heading)' }}>{group.label}</p>
            )}
            {collapsed && group.id !== 'general' && <div className="mx-2 my-2" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }} />}
            <div className="space-y-[1px]">
              {group.items.map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;
                const badge = liveBadges[item.id] || 0;
                const isHovered = hoveredItem === item.id;
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => onNavigate(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`w-full flex items-center gap-2.5 text-[13px] transition-all duration-150 ${collapsed ? 'px-0 py-2 justify-center rounded-lg' : 'px-2.5 py-[7px] rounded-lg'}`}
                      style={{
                        backgroundColor: isActive ? 'var(--admin-sidebar-active)' : isHovered ? 'rgba(255,255,255,0.03)' : 'transparent',
                        color: isActive ? 'var(--admin-accent)' : 'var(--admin-muted)',
                      }}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                      {!collapsed && (
                        <span className="truncate flex-1 text-left" style={{ color: isActive ? 'var(--admin-sidebar-text)' : 'var(--admin-text-secondary)', fontFamily: 'var(--admin-font-body)' }}>{item.label}</span>
                      )}
                      {!collapsed && badge > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 text-[9px] font-bold"
                          style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}>{badge}</span>
                      )}
                    </button>
                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[60] px-2.5 py-1.5 rounded-lg text-[11px] whitespace-nowrap pointer-events-none"
                            style={{ backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>
                            {item.label}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-info))' }}>
            <span className="text-[10px] font-bold text-white">{initials}</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate" style={{ color: 'var(--admin-sidebar-text)' }}>{adminName}</p>
                <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>admin@rocksage.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};
