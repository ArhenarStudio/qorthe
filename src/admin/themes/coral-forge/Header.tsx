"use client";

import React from 'react';
import { Search, Bell, Command, Menu, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';

interface Props { period: any; onPeriodChange: (p: any) => void; onNavigate: (page: AdminPage) => void; onMobileMenuToggle: () => void; }

export const CoralForgeHeader: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { medusaCustomer, user } = useAuth();
  const name = medusaCustomer?.first_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <header className="sticky top-0 z-20 flex items-center h-12 px-4 md:px-6" style={{ backgroundColor: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
      <button onClick={onMobileMenuToggle} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ color: 'var(--admin-muted)' }}><Menu size={16} /></button>

      <p className="text-[13px] font-medium" style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-heading)' }}>
        Hola, <span style={{ color: 'var(--admin-accent)' }}>{name}</span>
      </p>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors" style={{ backgroundColor: 'var(--admin-accent)', color: '#FFF' }}>
          <Plus size={12} /> Crear
        </button>
        <button className="h-8 px-2.5 rounded-lg flex items-center gap-1.5 text-[11px]" style={{ backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }}>
          <Search size={12} /><span className="hidden sm:inline">Buscar</span>
          <kbd className="hidden sm:flex text-[9px] px-1 rounded" style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>⌘K</kbd>
        </button>
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--admin-muted)' }}>
          <Bell size={15} /><span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--admin-accent)' }} />
        </button>
      </div>
    </header>
  );
};
