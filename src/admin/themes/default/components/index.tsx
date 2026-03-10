"use client";

// ═══════════════════════════════════════════════════════════════
// Default Theme UI Components — Can be overridden by other themes
// ═══════════════════════════════════════════════════════════════

import React from 'react';

// Card
export const DefaultCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div
    className={`overflow-hidden ${className}`}
    style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow)',
      ...style,
    }}
  >
    {children}
  </div>
);

// Badge
export const DefaultBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--success)' },
    red: { backgroundColor: 'rgba(220,38,38,0.1)', color: 'var(--error)' },
    amber: { backgroundColor: 'rgba(217,119,6,0.1)', color: 'var(--warning)' },
    blue: { backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--info)' },
    gray: { backgroundColor: 'var(--surface2)', color: 'var(--text-muted)' },
    accent: { backgroundColor: 'var(--accent)', color: 'var(--accent-text)' },
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center ${className}`} style={styles[variant] || styles.gray}>
      {text}
    </span>
  );
};

// Button
export const DefaultButton: React.FC<{
  children: React.ReactNode;
  variant?: string;
  size?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-button)',
    fontFamily: 'var(--font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--accent)', color: 'var(--accent-text)', border: 'none' },
    secondary: { backgroundColor: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost: { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none' },
    danger: { backgroundColor: 'var(--error)', color: '#FFFFFF', border: 'none' },
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium inline-flex items-center gap-1.5 ${sizeClasses[size]} ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant] }}
    >
      {children}
    </button>
  );
};

// Table wrapper
export const DefaultTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`} style={{ borderRadius: 'var(--radius-card)' }}>
    <table className="w-full text-xs" style={{ color: 'var(--text)' }}>
      {children}
    </table>
  </div>
);

// Stat card for dashboards
export const DefaultStatCard: React.FC<{
  label: string;
  value: string | number;
  change?: string;
  changeType?: string;
  icon?: React.ReactNode;
}> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div
    className="p-4"
    style={{
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow)',
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
      {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
    </div>
    <p className="text-xl font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>{value}</p>
    {change && (
      <span className="text-[10px] mt-1 inline-block" style={{
        color: changeType === 'positive' ? 'var(--success)' : changeType === 'negative' ? 'var(--error)' : 'var(--text-muted)'
      }}>
        {change}
      </span>
    )}
  </div>
);
