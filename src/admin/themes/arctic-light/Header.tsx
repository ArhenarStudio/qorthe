"use client";

import React, { useState } from 'react';
import { Search, Bell, Calendar, Menu, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminPage } from '@/src/admin/navigation';

interface Props {
  period: string;
  onPeriodChange: (p: string) => void;
  onNavigate: (page: AdminPage) => void;
  onMobileMenuToggle: () => void;
}

const PERIODS = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: '1y', label: '1 año' },
];

export const ArcticLightHeader: React.FC<Props> = ({ period, onPeriodChange, onNavigate, onMobileMenuToggle }) => {
  const { medusaCustomer, user } = useAuth();
  const name = medusaCustomer?.first_name || user?.email?.split('@')[0] || 'Admin';
  const [periodOpen, setPeriodOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const currentPeriodLabel = PERIODS.find(p => p.value === period)?.label ?? '30 días';

  return (
    <header
      className="sticky top-0 z-20 flex items-center h-[60px] px-5 gap-3"
      style={{
        backgroundColor: 'var(--admin-bg)',
        borderBottom: '1px solid var(--admin-border)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Mobile menu */}
      <button onClick={onMobileMenuToggle}
        className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ color: 'var(--admin-muted)', border: '1px solid var(--admin-border)' }}>
        <Menu size={15} />
      </button>

      {/* Search — arctic characteristic: wide, prominent */}
      <div
        className="hidden md:flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 h-9 transition-all duration-200"
        style={{
          backgroundColor: searchFocused ? 'var(--admin-surface)' : 'var(--admin-surface2)',
          border: `1px solid ${searchFocused ? 'var(--admin-accent)' : 'var(--admin-border)'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(56,189,248,0.08)' : 'none',
        }}
      >
        <Search size={13} style={{ color: 'var(--admin-muted)' }} className='shrink-0' />
        <input
          type="text"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-xs outline-none"
          style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-body)' }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <kbd className="text-[9px] px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'var(--admin-border)', color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-mono)' }}>
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      {/* Period selector */}
      <div className="relative">
        <button
          onClick={() => setPeriodOpen(!periodOpen)}
          className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-medium transition-colors"
          style={{
            backgroundColor: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
            color: 'var(--admin-text-secondary)',
            fontFamily: 'var(--admin-font-body)',
          }}
        >
          <Calendar size={12} style={{ color: 'var(--admin-accent)' }} />
          {currentPeriodLabel}
          <ChevronDown size={11} style={{ color: 'var(--admin-muted)' }} />
        </button>
        {periodOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-32 rounded-xl overflow-hidden z-50"
            style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}
          >
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => { onPeriodChange(p.value); setPeriodOpen(false); }}
                className="w-full text-left px-3 py-2 text-[11px] transition-colors hover:opacity-80"
                style={{
                  color: period === p.value ? 'var(--admin-accent)' : 'var(--admin-text-secondary)',
                  backgroundColor: period === p.value ? 'var(--admin-sidebar-active)' : 'transparent',
                  fontFamily: 'var(--admin-font-body)',
                  fontWeight: period === p.value ? '600' : '400',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <button onClick={() => onNavigate('notifications')}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
        style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
        <Bell size={14} style={{ color: 'var(--admin-text-secondary)' }} />
      </button>

      {/* Settings */}
      <button onClick={() => onNavigate('settings')}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
        style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)' }}>
        <Settings size={14} style={{ color: 'var(--admin-text-secondary)' }} />
      </button>

      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold cursor-default shrink-0"
        style={{ backgroundColor: 'var(--admin-accent)', color: 'white' }}
        title={name}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    </header>
  );
};
