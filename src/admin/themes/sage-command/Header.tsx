"use client";

import React from 'react';
import { Search, Bell, Command, Menu, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';

interface Props { period: any; onPeriodChange: (p: any) => void; onNavigate: (page: AdminPage) => void; onMobileMenuToggle: () => void; }

export const SageCommandHeader: React.FC<Props> = ({ onNavigate, onMobileMenuToggle }) => {
  const { medusaCustomer, user } = useAuth();
  const name = medusaCustomer?.first_name || user?.email?.split('@')[0] || 'Admin';
  const now = new Date();
  const day = now.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20 flex items-center h-14 px-4 md:px-6" style={{ backgroundColor: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
      <button onClick={onMobileMenuToggle} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ color: 'var(--admin-muted)' }}><Menu size={16} /></button>

      <div>
        <p className="text-[13px]" style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-heading)' }}>
          Hola, <span className="font-medium">{name}</span>
        </p>
        <p className="text-[10px] capitalize" style={{ color: 'var(--admin-muted)' }}>{day}</p>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {/* Spotlight search trigger */}
        <button className="flex items-center gap-2 h-8 px-3 rounded-lg transition-all"
          style={{ backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }}>
          <Search size={13} />
          <span className="text-[11px] hidden sm:inline" style={{ fontFamily: 'var(--admin-font-body)' }}>Buscar o ejecutar...</span>
          <kbd className="hidden sm:flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
            <Command size={9} />K
          </kbd>
        </button>

        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--admin-muted)' }}>
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--admin-accent)' }} />
        </button>

        <button onClick={() => onNavigate('settings' as AdminPage)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--admin-muted)' }}>
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};
