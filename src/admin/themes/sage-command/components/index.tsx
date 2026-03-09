"use client";
import React from 'react';

// Sage Command — clean minimal dark, similar to Teal Noir but more compact
export const SageCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', ...style }}>{children}</div>
);

export const SageBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(22,163,74,0.1)', color: '#16A34A' },
    red: { backgroundColor: 'rgba(220,38,38,0.1)', color: '#DC2626' },
    amber: { backgroundColor: 'rgba(217,119,6,0.1)', color: '#D97706' },
    blue: { backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563EB' },
    gray: { backgroundColor: '#1A1A1F', color: '#6B6B78' },
    accent: { backgroundColor: '#14B8A6', color: '#08080A' },
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded inline-flex items-center ${className}`} style={{ fontFamily: "'DM Sans'", ...styles[variant] || styles.gray }}>{text}</span>;
};

export const SageButton: React.FC<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#14B8A6', color: '#08080A', border: 'none' },
    secondary: { backgroundColor: '#1A1A1F', color: '#E8E8EC', border: '1px solid #222228' },
    ghost: { backgroundColor: 'transparent', color: '#6B6B78', border: 'none' },
    danger: { backgroundColor: '#1A1A1F', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)' },
  };
  const sizes: Record<string, string> = { sm: 'px-2 py-1 text-[11px]', md: 'px-3 py-1.5 text-xs', lg: 'px-4 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled} className={`font-medium inline-flex items-center gap-1.5 rounded-lg transition-all ${sizes[size] || sizes.md} ${className}`}
      style={{ fontFamily: "'DM Sans'", cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...variants[variant] || variants.primary }}>{children}</button>
  );
};

export const SageTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg ${className}`} style={{ border: '1px solid #222228', backgroundColor: '#111114' }}>
    <table className="w-full text-xs" style={{ color: '#E8E8EC' }}>{children}</table>
  </div>
);

export const SageStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-4" style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '10px' }}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#6B6B78', fontFamily: "'DM Sans'" }}>{label}</span>
      {icon && <span style={{ color: '#14B8A6', opacity: 0.4 }}>{icon}</span>}
    </div>
    <p className="text-xl font-semibold" style={{ color: '#E8E8EC', fontFamily: "'Sora'" }}>{value}</p>
    {change && <span className="text-[10px] mt-1 inline-block" style={{ color: changeType === 'positive' ? '#16A34A' : changeType === 'negative' ? '#DC2626' : '#6B6B78' }}>{change}</span>}
  </div>
);
