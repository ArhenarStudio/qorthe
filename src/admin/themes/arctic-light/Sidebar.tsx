"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';
import type { AdminPage, NavGroup } from '@/src/admin/navigation';
import { logger } from '@/src/lib/logger';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const ArcticLightSidebar: React.FC<Props> = ({ currentPage, onNavigate, collapsed, onToggleCollapse, navigation }) => {
  const { user, medusaCustomer } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/admin/dashboard?period=30d').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.kpis?.pending_orders > 0) setLiveBadges({ orders: d.kpis.pending_orders });
    }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e));
  }, []);

  const adminName = medusaCustomer
    ? `${medusaCustomer.first_name} ${medusaCustomer.last_name}`.trim()
    : user?.email?.split('@')[0] || 'Admin';
  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || '')[0]}${(medusaCustomer.last_name || '')[0]}`.toUpperCase()
    : 'A';

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 248 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full flex flex-col z-50 overflow-hidden"
      style={{
        backgroundColor: 'var(--admin-sidebar-bg)',
        borderRight: '1px solid var(--admin-sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-[60px] shrink-0" style={{ borderBottom: '1px solid var(--admin-sidebar-border)' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: 'var(--admin-accent)', boxShadow: '0 2px 8px rgba(56,189,248,0.3)' }}>
          <Snowflake size={16} color="white" strokeWidth={2} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
              <p className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--admin-sidebar-text)', fontFamily: 'var(--admin-font-heading)' }}>
                RockSage
              </p>
              <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-[18px] -right-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center z-10 transition-colors"
        style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}
      >
        {collapsed
          ? <ChevronRight size={11} style={{ color: 'var(--admin-muted)' }} />
          : <ChevronLeft size={11} style={{ color: 'var(--admin-muted)' }} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {navigation.map((group) => (
          <div key={group.id} className="mb-1">
            {!collapsed && group.label && (
              <p className="px-3 pt-4 pb-1 text-[9px] uppercase tracking-[0.16em] font-semibold"
                style={{ color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-body)' }}>
                {group.label}
              </p>
            )}
            {collapsed && group.id !== 'general' && (
              <div className="my-2 mx-3" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }} />
            )}
            <div className="space-y-[2px]">
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
                      className={`w-full flex items-center transition-all duration-150 ${
                        collapsed ? 'justify-center py-2.5 px-0 rounded-xl' : 'gap-3 px-3 py-[7px] rounded-xl'
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? 'var(--admin-sidebar-active)'
                          : isHovered ? 'rgba(56,189,248,0.04)' : 'transparent',
                        position: 'relative',
                      }}
                    >
                      {/* Active left indicator — característico del tema Arctic */}
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                          style={{ backgroundColor: 'var(--admin-accent)' }} />
                      )}
                      <Icon
                        size={16}
                        strokeWidth={isActive ? 2 : 1.5}
                        style={{ color: isActive ? 'var(--admin-sidebar-accent)' : 'var(--admin-muted)' }}
                      />
                      {!collapsed && (
                        <span className="text-[12.5px] flex-1 text-left truncate"
                          style={{
                            color: isActive ? 'var(--admin-sidebar-text)' : 'var(--admin-text-secondary)',
                            fontFamily: 'var(--admin-font-body)',
                            fontWeight: isActive ? '500' : '400',
                          }}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && badge > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 text-[9px] font-bold"
                          style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                          {badge}
                        </span>
                      )}
                    </button>
                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.12 }}
                            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-medium pointer-events-none"
                            style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', color: 'var(--admin-text)', boxShadow: 'var(--admin-shadow-lg)' }}
                          >
                            {item.label}
                            {badge > 0 && (
                              <span className="ml-1.5 px-1 py-0.5 rounded text-[9px] font-bold"
                                style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
                                {badge}
                              </span>
                            )}
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

      {/* Footer — user */}
      <div className="shrink-0 p-3" style={{ borderTop: '1px solid var(--admin-sidebar-border)' }}>
        <div className={`flex items-center gap-2.5 rounded-xl p-2 transition-colors cursor-default ${collapsed ? 'justify-center' : ''}`}
          style={{ backgroundColor: 'var(--admin-sidebar-active)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
            style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}>
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: 'var(--admin-sidebar-text)' }}>{adminName}</p>
                <p className="text-[10px]" style={{ color: 'var(--admin-muted)' }}>Owner</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};
