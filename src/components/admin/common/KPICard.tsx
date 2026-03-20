"use client";
// ═══════════════════════════════════════════════════════════════
// KPICard.tsx — Tarjeta de KPI reutilizable
// minHeight 140px, sparklines, click modal
// ═══════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DataPointModal, formatValue } from './InteractiveChart';
import type { ChartDataPoint } from './InteractiveChart';

export type SparkType = 'line' | 'bars' | 'badge' | 'none';

export interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  changeUp?: boolean;
  changeNeutral?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  sparkType?: SparkType;
  sparkData?: number[];
  sparkColor?: string;
  // modal
  modalMetricName?: string;
  modalDescription?: string;
  modalData?: ChartDataPoint[];
  unit?: string;
  onClick?: () => void;
}

// ── Mini sparkline SVG inline ──────────────────────────────────
function MiniSparkline({ data, color, type }: { data: number[]; color: string; type: 'line' | 'bars' }) {
  const W = 80;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const yPt = (v: number) => H - 4 - ((v - min) / range) * (H - 8);

  if (type === 'bars') {
    const bw = Math.floor((W / data.length) * 0.65);
    const gap = W / data.length;
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {data.map((v, i) => {
          const h = Math.max(2, ((v - min) / range) * (H - 8));
          return <rect key={i} x={i * gap + (gap - bw) / 2} y={H - h - 4} width={bw} height={h} fill={color} opacity={0.55 + 0.45 * (i / (data.length - 1))} rx={1} />;
        })}
      </svg>
    );
  }

  // line spark
  const step = (W - 8) / Math.max(data.length - 1, 1);
  const pts = data.map((v, i) => ({ x: 4 + i * step, y: yPt(v) }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = pts[i - 1].x + step / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const area = d + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sk-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sk-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

// ── KPICard ────────────────────────────────────────────────────
export function KPICard({
  label,
  value,
  change,
  changeUp,
  changeNeutral = false,
  icon: Icon,
  iconColor = '#0D9488',
  sparkType = 'none',
  sparkData = [],
  sparkColor = '#0D9488',
  modalMetricName,
  modalDescription,
  modalData,
  unit,
  onClick,
}: KPICardProps) {
  const [showModal, setShowModal] = useState(false);
  const isClickable = !!(modalData?.length || onClick);

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (modalData?.length) setShowModal(true);
  };

  const hasSpark = (sparkType === 'line' || sparkType === 'bars') && sparkData.length > 1;
  const changeColor = changeNeutral ? 'var(--text-muted)' : changeUp ? 'var(--success)' : 'var(--error)';
  const ChangeIcon = changeNeutral ? Minus : changeUp ? TrendingUp : TrendingDown;

  return (
    <>
      <div
        onClick={isClickable ? handleClick : undefined}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          padding: '16px',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'border-color 0.15s, background 0.15s',
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) => { if (isClickable) e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onMouseLeave={(e) => { if (isClickable) e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-body)' }}>
            {label}
          </div>
          {Icon && (
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-badge)', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={14} color={iconColor} />
            </div>
          )}
        </div>

        {/* Value */}
        <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>
          {value}
        </div>

        {/* Bottom row: change + sparkline */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {change && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: changeColor }}>
              <ChangeIcon size={13} />
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>{change}</span>
            </div>
          )}
          {hasSpark && (
            <div style={{ opacity: 0.8 }}>
              <MiniSparkline data={sparkData} color={sparkColor} type={sparkType as 'line' | 'bars'} />
            </div>
          )}
          {sparkType === 'badge' && (
            <div style={{ padding: '3px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-badge)', fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {change ?? '—'}
            </div>
          )}
        </div>
      </div>

      {showModal && modalData && modalData.length > 0 && (
        // DataPointModal con el último punto
        <DataPointModal
          point={modalData[modalData.length - 1]}
          allData={modalData}
          metricName={modalMetricName ?? label}
          metricDescription={modalDescription ?? ''}
          unit={unit}
          onClose={() => setShowModal(false)}
          onViewFullReport={() => setShowModal(false)}
        />
      )}
    </>
  );
}
