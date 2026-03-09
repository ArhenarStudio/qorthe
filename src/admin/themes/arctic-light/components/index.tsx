"use client";
import React from 'react';

// ─── Arctic Light — nordic minimal. Todos los colores via CSS vars ────────────

export const ArcticCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{
    backgroundColor: 'var(--admin-surface)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-card-radius)',
    boxShadow: 'var(--admin-shadow)',
    ...style,
  }}>{children}</div>
);

export const ArcticBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green:  { backgroundColor: 'rgba(16,185,129,0.08)', color: 'var(--admin-success)', border: '1px solid rgba(16,185,129,0.15)' },
    red:    { backgroundColor: 'rgba(239,68,68,0.08)',  color: 'var(--admin-error)',   border: '1px solid rgba(239,68,68,0.15)' },
    amber:  { backgroundColor: 'rgba(245,158,11,0.08)', color: 'var(--admin-warning)', border: '1px solid rgba(245,158,11,0.15)' },
    blue:   { backgroundColor: 'rgba(56,189,248,0.08)', color: 'var(--admin-info)',    border: '1px solid rgba(56,189,248,0.15)' },
    gray:   { backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-text-secondary)', border: '1px solid var(--admin-border)' },
    accent: { backgroundColor: 'var(--admin-accent)',   color: 'var(--admin-accent-text)', border: 'none' },
  };
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center ${className}`}
      style={{ fontFamily: 'var(--admin-font-body)', ...(styles[variant] ?? styles.gray) }}
    >{text}</span>
  );
};

export const ArcticButton: React.FC<{
  children: React.ReactNode; variant?: string; size?: string;
  onClick?: () => void; disabled?: boolean; className?: string;
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)', border: 'none' },
    secondary: { backgroundColor: 'var(--admin-surface)', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' },
    ghost:     { backgroundColor: 'transparent', color: 'var(--admin-text-secondary)', border: 'none' },
    danger:    { backgroundColor: 'rgba(239,68,68,0.06)', color: 'var(--admin-error)', border: '1px solid rgba(239,68,68,0.15)' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-[12px]', lg: 'px-5 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`font-medium inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 ${sizes[size] ?? sizes.md} ${className}`}
      style={{ fontFamily: 'var(--admin-font-body)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...(variants[variant] ?? variants.primary) }}
    >{children}</button>
  );
};

export const ArcticTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl ${className}`} style={{ border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
    <table className="w-full text-[12px]" style={{ color: 'var(--admin-text)' }}>{children}</table>
  </div>
);

export const ArcticStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-5" style={{
    backgroundColor: 'var(--admin-surface)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-card-radius)',
    borderTop: '2px solid var(--admin-accent)',
  }}>
    <div className="flex items-start justify-between mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-body)' }}>{label}</span>
      {icon && <span style={{ color: 'var(--admin-accent)', opacity: 0.6 }}>{icon}</span>}
    </div>
    <p className="text-[28px] font-bold tracking-tight leading-none" style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-heading)' }}>{value}</p>
    {change && (
      <span className="text-[11px] mt-2 inline-block font-medium" style={{
        color: changeType === 'positive' ? 'var(--admin-success)' : changeType === 'negative' ? 'var(--admin-error)' : 'var(--admin-muted)',
      }}>{change}</span>
    )}
  </div>
);
