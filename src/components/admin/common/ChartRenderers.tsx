"use client";
// ═══════════════════════════════════════════════════════════════
// ChartRenderers.tsx — 6 tipos de gráfico SVG puros
// Cada renderer: data[], color, hoveredIndex, onHover, onClick
// ═══════════════════════════════════════════════════════════════
import React from 'react';
import type { ChartDataPoint } from './InteractiveChart';

interface RendererProps {
  data: ChartDataPoint[];
  color: string;
  secondaryColor?: string;
  width: number;
  height: number;
  hoveredIndex: number | null;
  onHover: (i: number | null) => void;
  onClick: (i: number, e: React.MouseEvent) => void;
}

// ── helpers ────────────────────────────────────────────────────
function getRange(data: ChartDataPoint[]) {
  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return { min, max, range: max - min || 1 };
}

function svgY(value: number, min: number, range: number, height: number, padding = 16): number {
  return height - padding - ((value - min) / range) * (height - padding * 2);
}

// bezier smooth path
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 3;
    const cp1y = pts[i - 1].y;
    const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) / 3;
    const cp2y = pts[i].y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

// ── 4A: AreaGradientChart ──────────────────────────────────────
export function AreaGradientChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const { min, range } = getRange(data);
  const PAD_X = 8;
  const step = (width - PAD_X * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({ x: PAD_X + i * step, y: svgY(d.value, min, range, height) }));
  const gradId = `ag-${color.replace('#', '')}`;
  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.38" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((pt, i) => (
        <g key={i} onClick={(e) => onClick(i, e)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={pt.x} cy={pt.y} r={8} fill="transparent" />
          <circle cx={pt.x} cy={pt.y} r={hoveredIndex === i ? 4 : 3}
            fill={hoveredIndex === i ? color : 'var(--bg)'}
            stroke={color} strokeWidth={2}
            style={{ transition: 'r 0.15s ease' }} />
        </g>
      ))}
    </svg>
  );
}

// ── 4B: GradientBarsChart ──────────────────────────────────────
export function GradientBarsChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const { min, range } = getRange(data);
  const PAD_X = 8;
  const totalW = width - PAD_X * 2;
  const barW = Math.max(4, (totalW / data.length) * 0.6);
  const gap = totalW / data.length;
  const gradId = `gb-${color.replace('#', '')}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const barH = Math.max(2, ((d.value - min) / range) * (height - 24));
        const x = PAD_X + i * gap + (gap - barW) / 2;
        const y = height - barH - 8;
        const opacity = hoveredIndex === null ? 0.55 + 0.45 * (i / (data.length - 1)) : hoveredIndex === i ? 1 : 0.4;
        return (
          <g key={i} onClick={(e) => onClick(i, e)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
            <rect x={x} y={y} width={barW} height={barH} fill={`url(#${gradId})`} opacity={opacity} rx={2} style={{ transition: 'opacity 0.15s ease' }} />
            <text x={x + barW / 2} y={height - 1} textAnchor="middle" fontSize={9} fill="var(--text-muted)">{d.label.slice(0, 3)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 4C: SteppedPulseChart ──────────────────────────────────────
export function SteppedPulseChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const { min, range } = getRange(data);
  const PAD_X = 8;
  const step = (width - PAD_X * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({ x: PAD_X + i * step, y: svgY(d.value, min, range, height) }));
  const gradId = `sp-${color.replace('#', '')}`;

  // stepped path: go horizontal first, then vertical
  let linePath = `M ${pts[0].x} ${pts[0].y}`;
  let areaPath = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    linePath += ` H ${pts[i].x} V ${pts[i].y}`;
    areaPath += ` H ${pts[i].x} V ${pts[i].y}`;
  }
  areaPath += ` V ${height} H ${pts[0].x} Z`;

  const gridLines = [0.25, 0.5, 0.75].map((r) => height * r);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridLines.map((y, i) => (
        <line key={i} x1={PAD_X} y1={y} x2={width - PAD_X} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="square" />
      {pts.map((pt, i) => (
        <g key={i} onClick={(e) => onClick(i, e)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={pt.x} cy={pt.y} r={8} fill="transparent" />
          {hoveredIndex === i && <circle cx={pt.x} cy={pt.y} r={5} fill={color} opacity={0.25} />}
          <circle cx={pt.x} cy={pt.y} r={3} fill={hoveredIndex === i ? color : 'var(--bg)'} stroke={color} strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
}

// ── 4D: SineWaveChart ─────────────────────────────────────────
export function SineWaveChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const { min, range } = getRange(data);
  const PAD_X = 8;
  const step = (width - PAD_X * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({ x: PAD_X + i * step, y: svgY(d.value, min, range, height) }));
  const gradId = `sw-${color.replace('#', '')}`;
  const linePath = smoothPath(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {pts.map((pt, i) => (
        <line key={i} x1={pt.x} y1={0} x2={pt.x} y2={height} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 4" />
      ))}
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {pts.map((pt, i) => (
        <g key={i} onClick={(e) => onClick(i, e)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={pt.x} cy={pt.y} r={9} fill="transparent" />
          {hoveredIndex === i && <circle cx={pt.x} cy={pt.y} r={7} fill={color} opacity={0.15} />}
          <circle cx={pt.x} cy={pt.y} r={hoveredIndex === i ? 4.5 : 3.5} fill={color} stroke="var(--bg)" strokeWidth={1.5} />
        </g>
      ))}
    </svg>
  );
}

// ── 4E: StackedWavesChart ─────────────────────────────────────
export function StackedWavesChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const { min, range } = getRange(data);
  const PAD_X = 8;
  const step = (width - PAD_X * 2) / Math.max(data.length - 1, 1);

  // 3 layers with offset scaling
  const layers = [1, 0.72, 0.45].map((scale, li) => {
    const pts = data.map((d, i) => ({
      x: PAD_X + i * step,
      y: svgY(d.value * scale, min * scale, range * scale + 0.01, height),
    }));
    const line = smoothPath(pts);
    const area = line + ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
    const opacities = [0.25, 0.18, 0.12];
    return { pts, line, area, opacity: opacities[li] };
  });

  const gradId = `stk-${color.replace('#', '')}`;
  const topPts = layers[0].pts;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {layers.map((l, li) => (
        <path key={li} d={l.area} fill={color} opacity={l.opacity} />
      ))}
      <path d={layers[0].line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {topPts.map((pt, i) => (
        <g key={i} onClick={(e) => onClick(i, e)} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
          <circle cx={pt.x} cy={pt.y} r={8} fill="transparent" />
          <circle cx={pt.x} cy={pt.y} r={hoveredIndex === i ? 4 : 3} fill={hoveredIndex === i ? color : 'var(--bg)'} stroke={color} strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
}

// ── 4F: ProgressBarsChart ─────────────────────────────────────
export function ProgressBarsChart({ data, color, width, height, hoveredIndex, onHover, onClick }: RendererProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const maxVal = sorted[0]?.value || 1;
  const barH = Math.max(12, Math.floor((height - 8) / sorted.length) - 6);
  const labelW = 90;
  const valW = 52;
  const trackW = width - labelW - valW - 8;
  const gradId = `pb-${color.replace('#', '')}`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      {sorted.map((d, i) => {
        const origIdx = data.indexOf(d);
        const y = i * (barH + 6) + 4;
        const fillW = (d.value / maxVal) * trackW;
        const isHov = hoveredIndex === origIdx;
        return (
          <g key={i} onClick={(e) => onClick(origIdx, e)} onMouseEnter={() => onHover(origIdx)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
            <text x={0} y={y + barH * 0.72} fontSize={10} fill={isHov ? 'var(--text)' : 'var(--text-secondary)'} style={{ transition: 'fill 0.15s' }}>
              {d.label.length > 12 ? d.label.slice(0, 11) + '…' : d.label}
            </text>
            <rect x={labelW} y={y} width={trackW} height={barH} fill="var(--border)" rx={barH / 2} opacity={0.5} />
            <rect x={labelW} y={y} width={Math.max(fillW, 4)} height={barH} fill={`url(#${gradId})`} rx={barH / 2} opacity={isHov ? 1 : 0.8} style={{ transition: 'opacity 0.15s' }} />
            <text x={labelW + trackW + 6} y={y + barH * 0.72} fontSize={10} fontWeight={700} fill={isHov ? color : 'var(--text-secondary)'}>
              {d.formattedValue}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
