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
      backgroundColor: 'var(--admin-surface)',
      border: '1px solid var(--admin-border)',
      borderRadius: 'var(--admin-card-radius)',
      boxShadow: 'var(--admin-shadow)',
      ...style,
    }}
  >
    {children}
  </div>
);

// Badge
export const DefaultBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(22,163,74,0.1)', color: 'var(--admin-success)' },
    red: { backgroundColor: 'rgba(220,38,38,0.1)', color: 'var(--admin-error)' },
    amber: { backgroundColor: 'rgba(217,119,6,0.1)', color: 'var(--admin-warning)' },
    blue: { backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--admin-info)' },
    gray: { backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-muted)' },
    accent: { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)' },
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
    borderRadius: 'var(--admin-button-radius)',
    fontFamily: 'var(--admin-font-body)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--admin-accent)', color: 'var(--admin-accent-text)', border: 'none' },
    secondary: { backgroundColor: 'transparent', color: 'var(--admin-text)', border: '1px solid var(--admin-border)' },
    ghost: { backgroundColor: 'transparent', color: 'var(--admin-text-secondary)', border: 'none' },
    danger: { backgroundColor: 'var(--admin-error)', color: '#FFFFFF', border: 'none' },
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
  <div className={`overflow-x-auto ${className}`} style={{ borderRadius: 'var(--admin-card-radius)' }}>
    <table className="w-full text-xs" style={{ color: 'var(--admin-text)' }}>
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
      backgroundColor: 'var(--admin-surface)',
      border: '1px solid var(--admin-border)',
      borderRadius: 'var(--admin-card-radius)',
      boxShadow: 'var(--admin-shadow)',
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--admin-muted)' }}>{label}</span>
      {icon && <span style={{ color: 'var(--admin-muted)' }}>{icon}</span>}
    </div>
    <p className="text-xl font-semibold" style={{ color: 'var(--admin-text)', fontFamily: 'var(--admin-font-heading)' }}>{value}</p>
    {change && (
      <span className="text-[10px] mt-1 inline-block" style={{
        color: changeType === 'positive' ? 'var(--admin-success)' : changeType === 'negative' ? 'var(--admin-error)' : 'var(--admin-muted)'
      }}>
        {change}
      </span>
    )}
  </div>
);
