"use client";
import React from 'react';

export const CoralForgeCard: React.FC<{ className?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ className = '', children, style }) => (
  <div className={`overflow-hidden ${className}`} style={{ backgroundColor: '#0F1114', border: '1px solid #1A2228', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.4)', ...style }}>{children}</div>
);

export const CoralForgeBadge: React.FC<{ text: string; variant?: string; className?: string }> = ({ text, variant = 'gray', className = '' }) => {
  const styles: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.15)' },
    red: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.15)' },
    amber: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.15)' },
    blue: { backgroundColor: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.15)' },
    gray: { backgroundColor: '#161A1F', color: '#6B7A85', border: '1px solid #1A2228' },
    accent: { backgroundColor: '#F97316', color: '#FFFFFF', border: 'none' },
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center ${className}`} style={{ fontFamily: "'DM Sans'", ...styles[variant] || styles.gray }}>{text}</span>;
};

export const CoralForgeButton: React.FC<{ children: React.ReactNode; variant?: string; size?: string; onClick?: () => void; disabled?: boolean; className?: string }> = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const variants: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: '#F97316', color: '#FFFFFF', border: 'none', boxShadow: '0 2px 12px rgba(249,115,22,0.3)' },
    secondary: { backgroundColor: 'transparent', color: '#E8ECF0', border: '1px solid #1A2228' },
    ghost: { backgroundColor: 'transparent', color: '#6B7A85', border: 'none' },
    danger: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' },
  };
  const sizes: Record<string, string> = { sm: 'px-2.5 py-1 text-[11px]', md: 'px-3.5 py-1.5 text-xs', lg: 'px-5 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled} className={`font-medium inline-flex items-center gap-1.5 rounded-lg transition-all ${sizes[size] || sizes.md} ${className}`}
      style={{ fontFamily: "'DM Sans'", cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...variants[variant] || variants.primary }}>{children}</button>
  );
};

export const CoralForgeTable: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto rounded-lg ${className}`} style={{ border: '1px solid #1A2228', backgroundColor: '#0F1114' }}>
    <table className="w-full text-xs" style={{ color: '#E8ECF0' }}>{children}</table>
  </div>
);

export const CoralForgeStatCard: React.FC<{ label: string; value: string | number; change?: string; changeType?: string; icon?: React.ReactNode }> = ({ label, value, change, changeType = 'neutral', icon }) => (
  <div className="p-5 relative overflow-hidden" style={{ backgroundColor: '#0F1114', border: '1px solid #1A2228', borderRadius: '10px' }}>
    <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'linear-gradient(135deg, #F97316 0%, transparent 60%)' }} />
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#6B7A85' }}>{label}</span>
        {icon && <span style={{ color: '#F97316', opacity: 0.6 }}>{icon}</span>}
      </div>
      <p className="text-2xl font-semibold" style={{ color: '#E8ECF0', fontFamily: "'Sora'" }}>{value}</p>
      {change && <span className="text-[10px] mt-1.5 inline-block font-medium" style={{ color: changeType === 'positive' ? '#22C55E' : changeType === 'negative' ? '#EF4444' : '#6B7A85' }}>{change}</span>}
    </div>
  </div>
);
