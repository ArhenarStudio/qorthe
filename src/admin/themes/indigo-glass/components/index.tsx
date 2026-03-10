"use client";
import React from 'react';

// ─── Indigo Glass — glassmorphism. Todos los colores via CSS vars ─────────────

export const IndigoGlassCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{
    backgroundColor: 'var(--surface)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow)',
    ...style,
  }}>{children}</div>
);

export const IndigoGlassBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green:  { backgroundColor: 'rgba(16,185,129,0.1)',  color: 'var(--success)' },
    red:    { backgroundColor: 'rgba(239,68,68,0.1)',   color: 'var(--error)' },
    amber:  { backgroundColor: 'rgba(245,158,11,0.1)',  color: 'var(--warning)' },
    blue:   { backgroundColor: 'rgba(6,182,212,0.1)',   color: 'var(--info)' },
    gray:   { backgroundColor: 'var(--surface2)', color: 'var(--text-secondary)' },
    accent: { backgroundColor: 'var(--accent)',   color: 'var(--accent-text)' },
  };
  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center ${className}`}
      style={styles[variant] ?? styles.gray}
    >{text}</span>
  );
};

export const IndigoGlassButton: React.FC<{
  children: React.ReactNode; variant?: string; size?: string;
  onClick?: () => void; disabled?: boolean; className?: string;
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary:   { backgroundColor: 'var(--accent)', color: 'var(--accent-text)', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' },
    secondary: { backgroundColor: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost:     { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none' },
    danger:    { backgroundColor: 'var(--error)', color: '#FFFFFF', border: 'none' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3 py-1.5 text-xs', lg: 'px-4 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`font-medium inline-flex items-center gap-1.5 rounded-xl transition-all ${sizes[size] ?? sizes.md} ${className}`}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...(variants[variant] ?? variants.primary) }}
    >{children}</button>
  );
};

export const IndigoGlassTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl ${className}`} style={{
    backgroundColor: 'var(--surface)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid var(--border)',
  }}>
    <table className="w-full text-xs" style={{ color: 'var(--text)' }}>{children}</table>
  </div>
);

export const IndigoGlassStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-4 relative" style={{
    backgroundColor: 'var(--surface)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
  }}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {icon && <span style={{ color: 'var(--accent)', opacity: 0.5 }}>{icon}</span>}
    </div>
    <p className="text-xl font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{value}</p>
    {change && (
      <span className="text-[10px] mt-1 inline-block" style={{
        color: changeType === 'positive' ? 'var(--success)' : changeType === 'negative' ? 'var(--error)' : 'var(--text-muted)',
      }}>{change}</span>
    )}
  </div>
);
