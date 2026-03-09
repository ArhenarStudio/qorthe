"use client";
import React from 'react';

export const TealNoirCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', ...style }}>{children}</div>
);

export const TealNoirBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(20,184,166,0.12)', color: '#14B8A6' },
    red: { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    amber: { backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    blue: { backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' },
    gray: { backgroundColor: '#1A1A1F', color: '#6B6B78' },
    accent: { backgroundColor: '#14B8A6', color: '#08080A' },
  };
  return <span className={`text-[10px] font-medium px-2.5 py-1 rounded-md inline-flex items-center gap-1 ${className}`} style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em', ...styles[variant] || styles.gray }}>{text}</span>;
};

export const TealNoirButton: React.FC<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#14B8A6', color: '#08080A', border: 'none', boxShadow: '0 2px 8px rgba(20,184,166,0.25)' },
    secondary: { backgroundColor: 'transparent', color: '#E8E8EC', border: '1px solid #222228' },
    ghost: { backgroundColor: 'transparent', color: '#6B6B78', border: 'none' },
    danger: { backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-xs', lg: 'px-5 py-2.5 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled} className={`font-medium inline-flex items-center gap-1.5 rounded-lg transition-all duration-150 ${sizes[size] || sizes.md} ${className}`}
      style={{ fontFamily: "'DM Sans', sans-serif", cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...variants[variant] || variants.primary }}>{children}</button>
  );
};

export const TealNoirTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg ${className}`} style={{ border: '1px solid #222228', backgroundColor: '#111114' }}>
    <table className="w-full text-xs" style={{ color: '#E8E8EC' }}>{children}</table>
  </div>
);

export const TealNoirStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-5 relative overflow-hidden" style={{ backgroundColor: '#111114', border: '1px solid #222228', borderRadius: '10px' }}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#6B6B78', fontFamily: "'DM Sans'" }}>{label}</span>
      {icon && <span style={{ color: '#14B8A6', opacity: 0.5 }}>{icon}</span>}
    </div>
    <p className="text-2xl font-semibold tracking-tight" style={{ color: '#E8E8EC', fontFamily: "'Sora', sans-serif" }}>{value}</p>
    {change && <span className="text-[10px] mt-1.5 inline-block font-medium" style={{ color: changeType === 'positive' ? '#14B8A6' : changeType === 'negative' ? '#ef4444' : '#6B6B78' }}>{change}</span>}
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-[0.03]" style={{ backgroundColor: '#14B8A6' }} />
  </div>
);
