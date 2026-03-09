"use client";
import React from 'react';

// ─── Teal Noir — dark analytics. Todos los colores via CSS vars ───────────────

export const TealNoirCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{
    backgroundColor: 'var(--admin-surface)',
    border: '1px solid var(--admin-border)',
    borderRadius: 'var(--admin-card-radius)',
    boxShadow: 'var(--admin-shadow)',
    ...style,
  }}>{children}</div>
);

export const TealNoirBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green:  { backgroundColor: 'rgba(20,184,166,0.12)', color: 'var(--admin-success)' },
    red:    { backgroundColor: 'rgba(239,68,68,0.12)',  color: 'var(--admin-error)' },
    amber:  { backgroundColor: 'rgba(245,158,11,0.12)', color: 'var(--admin-warning)' },
    blue:   { backgroundColor: 'rgba(99,102,241,0.12)', color: 'var(--admin-info)' },
    gray:   { backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-muted)' },
    accent: { backgroundColor: 'var(--admin-accent)',   color: 'var(--admin-accent-text)' },
  };
  return (
    <span
      className={`text-[10px] font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${className}`}
      style={{ fontFamily: 'var(--admin-font-body)', letterSpacing: '0.02em', ...(styles[variant] ?? styles.gray) }}
    >{text}</span>
  );
};

export const TealNoirButton: React.FC<{
  children: React.ReactNode; variant?: string; size?: string;
  onClick?: () => void; disabled?: boolean; className?: string;
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)', border: 'none', boxShadow: '0 2px 8px rgba(20,184,166,0.25)' },
    secondary: { backgroundColor: 'transparent', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' },
    ghost:     { backgroundColor: 'transparent', color: 'var(--admin-muted)', border: 'none' },
    danger:    { backgroundColor: 'rgba(239,68,68,0.12)', color: 'var(--admin-error)', border: '1px solid rgba(239,68,68,0.2)' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-xs', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`font-medium inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 ${sizes[size] ?? sizes.md} ${className}`}
      style={{ fontFamily: 'var(--admin-font-body)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...(variants[variant] ?? variants.primary) }}
    >{children}</button>
  );
};

export const TealNoirTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg ${className}`} style={{ border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-surface)' }}>
    <table className="w-full text-xs" style={{ color: 'var(--admin-text)' }}>{children}</table>
  </div>
);

export const TealNoirStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-5 relative overflow-hidden" style={{ backgroundColor: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-card-radius)' }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--admin-muted)', fontFamily: 'var(--admin-font-body)' }}>{label}</span>
      {icon && <span style={{ color: 'var(--admin-accent)', opacity: 0.5 }}>{icon}</span>}
    </div>
    <p className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-heading)' }}>{value}</p>
    {change && (
      <span className="text-[10px] mt-1.5 inline-block font-medium" style={{
        color: changeType === 'positive' ? 'var(--admin-success)' : changeType === 'negative' ? 'var(--admin-error)' : 'var(--admin-muted)',
      }}>{change}</span>
    )}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-[0.04]" style={{ backgroundColor: 'var(--admin-accent)' }} />
  </div>
);
