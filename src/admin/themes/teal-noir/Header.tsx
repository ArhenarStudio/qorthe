"use client";

import React from 'react';
import { Search, Bell, Command, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';

interface Props { period: any; onPeriodChange: (p: any) => void; onNavigate: (page: AdminPage) => void; onMobileMenuToggle: () => void; }

export const TealNoirHeader: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { user, medusaCustomer } = useAuth();
  const name = medusaCustomer ? medusaCustomer.first_name || '' : user?.email?.split('@')[0] || 'Admin';
  const now = new Date();
  const day = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20 flex items-center h-14 px-4 md:px-6" style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <button onClick={onMobileMenuToggle} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center mr-3" style={{ color: 'var(--text-muted)' }}><Menu size={16} /></button>

      <div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>Hola, {name}</p>
        <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{day}</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 h-8 px-3 rounded-lg transition-colors" style={{ backgroundColor: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          <Search size={13} /><span className="text-[11px] hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}><Command size={9} />K</kbd>
        </button>
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
          <Bell size={15} /><span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
        </button>
      </div>
    </header>
  );
};
