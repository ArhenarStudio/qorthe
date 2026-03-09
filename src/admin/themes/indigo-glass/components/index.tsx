"use client";
import React from 'react';

export const IndigoGlassCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', ...style }}>{children}</div>
);

export const IndigoGlassBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' },
    red: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' },
    amber: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
    blue: { backgroundColor: 'rgba(6,182,212,0.1)', color: '#06b6d4' },
    gray: { backgroundColor: '#f1f5f9', color: '#64748b' },
    accent: { backgroundColor: '#6366f1', color: '#FFFFFF' },
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center ${className}`} style={styles[variant] || styles.gray}>{text}</span>;
};

export const IndigoGlassButton: React.FC<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#6366f1', color: '#FFFFFF', border: 'none', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' },
    secondary: { backgroundColor: 'transparent', color: '#0f172a', border: '1px solid #e2e8f0' },
    ghost: { backgroundColor: 'transparent', color: '#64748b', border: 'none' },
    danger: { backgroundColor: '#ef4444', color: '#FFFFFF', border: 'none' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3 py-1.5 text-xs', lg: 'px-4 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled} className={`font-medium inline-flex items-center gap-1.5 rounded-xl transition-all ${sizes[size] || sizes.md} ${className}`}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...variants[variant] || variants.primary }}>{children}</button>
  );
};

export const IndigoGlassTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-xl ${className}`} style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
    <table className="w-full text-xs" style={{ color: '#0f172a' }}>{children}</table>
  </div>
);

export const IndigoGlassStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-4 relative" style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '12px' }}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</span>
      {icon && <span style={{ color: '#6366f1', opacity: 0.5 }}>{icon}</span>}
    </div>
    <p className="text-xl font-semibold" style={{ color: '#0f172a' }}>{value}</p>
    {change && <span className="text-[10px] mt-1 inline-block" style={{ color: changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#94a3b8' }}>{change}</span>}
  </div>
);
