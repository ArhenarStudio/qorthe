"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Menu, Command } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';

interface Props {
  period: any;
  onPeriodChange: (p: any) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

export const IndigoGlassHeader: React.FC<Props> = ({ onNavigate, onMobileMenuToggle }) => {
  const { user, medusaCustomer } = useAuth();
  const name = medusaCustomer ? `${medusaCustomer.first_name || ''} ${medusaCustomer.last_name || ''}`.trim() : user?.email?.split('@')[0] || 'Admin';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-14 px-4 md:px-6"
      style={{
        backgroundColor: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Mobile menu */}
      <button onClick={onMobileMenuToggle} className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl mr-3" style={{ backgroundColor: 'var(--surface2)' }}>
        <Menu size={16} style={{ color: 'var(--accent)' }} />
      </button>

      {/* Search */}
      <button
        className="flex items-center gap-2.5 h-9 px-3.5 rounded-xl transition-all max-w-xs flex-1 sm:flex-none sm:w-64"
        style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid transparent' }}
      >
        <Search size={14} />
        <span className="text-[13px] truncate">Buscar...</span>
        <kbd className="hidden sm:inline-flex ml-auto items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px]"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          <Command size={10} />K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        <span className="hidden lg:block text-xs" style={{ color: 'var(--text-secondary)' }}>{greeting}, <strong style={{ color: 'var(--text)' }}>{name}</strong></span>

        <button
          className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-text)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}
        >
          <Plus size={14} /> Crear
        </button>

        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)' }}>
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        </button>
      </div>
    </header>
  );
};
