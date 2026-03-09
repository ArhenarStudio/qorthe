"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ExternalLink, LogOut, Store } from 'lucide-react';
import type { AdminPage, NavItem, NavGroup } from '@/src/admin/navigation';
import { allNavItems } from '@/src/admin/navigation';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const IndigoGlassSidebar: React.FC<Props> = ({ currentPage, onNavigate, navigation }) => {
  const { user, medusaCustomer } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});
  const flatItems = navigation.flatMap(g => g.items);

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
    const interval = setInterval(fetchBadges, 120_000);
    return () => clearInterval(interval);
  }, []);

  const initials = medusaCustomer
    ? `${(medusaCustomer.first_name || '')[0]}${(medusaCustomer.last_name || '')[0]}`.toUpperCase()
    : 'RS';

  return (
    <nav
      className="fixed left-0 top-0 h-full flex flex-col items-center w-[68px] py-4 gap-1 z-50"
      style={{ backgroundColor: 'var(--admin-sidebar-bg)', borderRight: '1px solid var(--admin-sidebar-border)' }}
    >
      {/* Logo */}
      <div className="mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--admin-accent), #8B5CF6)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
        >
          <Store className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col items-center gap-0.5 w-full px-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {flatItems.map((item) => {
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
                className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: isActive ? 'var(--admin-sidebar-active)' : isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--admin-sidebar-text)',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' }}>
                    {badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="rail-indicator"
                    className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ backgroundColor: 'var(--admin-accent)' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[60] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap pointer-events-none"
                    style={{ backgroundColor: 'var(--admin-text)', color: 'var(--admin-bg)' }}
                  >
                    {item.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom — Search + Avatar */}
      <div className="flex flex-col items-center gap-2 mt-2">
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'var(--admin-sidebar-text)' }}
        >
          <Search size={18} />
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: 'linear-gradient(135deg, var(--admin-accent), #8B5CF6)', color: '#FFFFFF' }}>
          {initials}
        </div>
      </div>
    </nav>
  );
};
