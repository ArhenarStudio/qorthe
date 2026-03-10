"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Zap } from 'lucide-react';
import type { AdminPage, NavItem, NavGroup } from '@/src/admin/navigation';
import { logger } from '@/src/lib/logger';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  navigation: NavGroup[];
}

export const CoralForgeSidebar: React.FC<Props> = ({ currentPage, onNavigate, navigation }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});
  const flatItems = navigation.flatMap(g => g.items);

  useEffect(() => {
    fetch('/api/admin/dashboard?period=30d').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.kpis?.pending_orders > 0) setLiveBadges({ orders: d.kpis.pending_orders });
    }).catch((e) => logger.warn("[fetch] non-critical fetch error suppressed", e));
  }, []);

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-4 top-4 bottom-4 z-50 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl overflow-y-auto"
      style={{
        background: 'rgba(15, 17, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(26, 34, 40, 0.6)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.05)',
      }}
    >
      {/* Logo */}
      <div className="mb-2 p-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Nav Items */}
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
                backgroundColor: isActive ? 'rgba(249,115,22,0.15)' : isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'rgba(232,236,240,0.5)',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', color: '#FFF' }}>{badge}</span>
              )}
              {isActive && (
                <motion.div
                  layoutId="coral-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
                  className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[60] px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                >
                  {item.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Search */}
      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(26,34,40,0.6)' }}>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: 'rgba(232,236,240,0.4)' }}>
          <Search size={16} />
        </button>
      </div>
    </motion.div>
  );
};
