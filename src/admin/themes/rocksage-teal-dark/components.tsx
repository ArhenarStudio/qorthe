"use client";
// ═══════════════════════════════════════════════════════════════
// RockSage OS — UI Components (dark glassmorphism + teal glow)
// Card, Badge, Button, Table, StatCard
// ═══════════════════════════════════════════════════════════════

import React from 'react';

// ── Card — glassmorphism dark con teal glow en hover ──────────
export const OSCard: React.FC<{
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ className = '', children, style }) => (
  <div
    className={`overflow-hidden transition-all group/card ${className}`}
    style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow)',
      backdropFilter: 'blur(12px)',
      ...style,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(13,148,136,0.35)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 1px rgba(13,148,136,0.12), var(--shadow-lg)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
    }}
  >
    {children}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────
export const OSBadge: React.FC<{
  text: string;
  variant?: string;
  className?: string;
}> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green:  { background: 'rgba(34,197,94,0.15)',   color: '#22C55E' },
    red:    { background: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
    amber:  { background: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
    blue:   { background: 'rgba(59,130,246,0.15)',  color: '#3B82F6' },
    teal:   { background: 'rgba(13,148,136,0.15)',  color: '#2DD4BF' },
    purple: { background: 'rgba(167,139,250,0.15)', color: '#A78BFA' },
    gray:   { background: 'rgba(100,116,139,0.15)', color: '#94A3B8' },
    accent: { background: 'rgba(13,148,136,0.2)',   color: '#0D9488' },
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center ${className}`}
      style={styles[variant] ?? styles.gray}
    >
      {text}
    </span>
  );
};

// ── Button ────────────────────────────────────────────────────
export const OSButton: React.FC<{
  children: React.ReactNode;
  variant?: string;
  size?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const base: React.CSSProperties = {
    borderRadius: 'var(--radius-button)',
    fontFamily: 'var(--font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s ease',
    fontWeight: 500,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
      color: '#fff',
      border: 'none',
      boxShadow: '0 0 0 0 rgba(13,148,136,0)',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: 'none',
    },
    danger: {
      background: 'rgba(239,68,68,0.15)',
      color: '#EF4444',
      border: '1px solid rgba(239,68,68,0.3)',
    },
  };

  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-[12px]',
    lg: 'px-4 py-2 text-[13px]',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium inline-flex items-center gap-1.5 ${sizes[size] ?? sizes.md} ${className}`}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === 'primary') {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(13,148,136,0.4)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
      }}
    >
      {children}
    </button>
  );
};

// ── Table wrapper ─────────────────────────────────────────────
export const OSTable: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`} style={{ borderRadius: 'var(--radius-card)' }}>
    <table className="w-full text-[12px]" style={{ color: 'var(--text)', borderCollapse: 'separate', borderSpacing: 0 }}>
      {children}
    </table>
  </div>
);

// ── StatCard — KPI con sparkline slot ─────────────────────────
export const OSStatCard: React.FC<{
  label: string;
  value: string | number;
  change?: string;
  changeType?: string;
  icon?: React.ReactNode;
}> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div
    className="p-4 transition-all"
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow)',
    }}
  >
    <div className="flex items-center justify-between mb-3">
      <span
        className="text-[10px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      {icon && (
        <span
          className="w-7 h-7 flex items-center justify-center rounded-lg"
          style={{ background: 'rgba(13,148,136,0.12)', color: '#2DD4BF' }}
        >
          {icon}
        </span>
      )}
    </div>
    <p
      className="text-2xl font-bold"
      style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
    >
      {value}
    </p>
    {change && (
      <span
        className="text-[10px] mt-1.5 inline-block font-medium"
        style={{
          color: changeType === 'positive'
            ? '#22C55E'
            : changeType === 'negative'
            ? '#EF4444'
            : 'var(--text-secondary)',
        }}
      >
        {change}
      </span>
    )}
  </div>
);
