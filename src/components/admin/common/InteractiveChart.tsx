"use client";
// ═══════════════════════════════════════════════════════════════
// InteractiveChart.tsx — Contenedor universal de gráficos
// + DataPointModal + FullReportModal
// ═══════════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaGradientChart,
  GradientBarsChart,
  SteppedPulseChart,
  SineWaveChart,
  StackedWavesChart,
  ProgressBarsChart,
} from './ChartRenderers';

// ── Tipos exportados ───────────────────────────────────────────
export interface ChartDataPoint {
  label: string;
  value: number;
  formattedValue: string;
  detail?: string;
  change?: string;
  changeUp?: boolean;
}

export type ChartType = 'area' | 'bars' | 'pulse' | 'sine' | 'stacked' | 'progress';

export interface InteractiveChartProps {
  title: string;
  subtitle?: string;
  type: ChartType;
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  showPeriodSelector?: boolean;
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (p: string) => void;
  metricName: string;
  metricDescription: string;
  unit?: string;
}

// ── Helper ─────────────────────────────────────────────────────
export function formatValue(value: number, unit?: string): string {
  if (unit === '$') return `$${value.toLocaleString('es-MX')}`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 'uds') return `${value.toLocaleString('es-MX')} uds`;
  return value.toLocaleString('es-MX');
}

// ── PeriodSelector ─────────────────────────────────────────────
function PeriodSelector({ periods, active, onChange }: { periods: string[]; active: string; onChange: (p: string) => void }) {
  return (
    <div className="flex items-center gap-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={(e) => { e.stopPropagation(); onChange(p); }}
          style={{
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            background: active === p ? 'var(--accent)' : 'var(--surface2)',
            color: active === p ? 'var(--accent-text)' : 'var(--text-secondary)',
            border: `1px solid ${active === p ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-button)',
            cursor: 'pointer',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

// ── Tooltip flotante ───────────────────────────────────────────
function HoverTooltip({ point }: { point: ChartDataPoint }) {
  return (
    <div style={{
      position: 'absolute',
      top: 4,
      right: 4,
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      padding: '6px 10px',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{point.formattedValue}</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{point.label}</div>
      {point.change && (
        <div style={{ fontSize: 9, color: point.changeUp ? 'var(--success)' : 'var(--error)', marginTop: 1 }}>{point.change}</div>
      )}
    </div>
  );
}

// ── DataPointModal ─────────────────────────────────────────────
interface DataPointModalProps {
  point: ChartDataPoint;
  allData: ChartDataPoint[];
  metricName: string;
  metricDescription: string;
  unit?: string;
  onClose: () => void;
  onViewFullReport: () => void;
}

export function DataPointModal({ point, allData, metricName, metricDescription, unit, onClose, onViewFullReport }: DataPointModalProps) {
  const avg = allData.reduce((s, d) => s + d.value, 0) / allData.length;
  const vsAvg = ((point.value - avg) / avg * 100).toFixed(1);
  const idx = allData.indexOf(point);
  const prevPoint = idx > 0 ? allData[idx - 1] : null;
  const vsPrev = prevPoint ? ((point.value - prevPoint.value) / prevPoint.value * 100).toFixed(1) : null;
  const avgUp = Number(vsAvg) >= 0;
  const prevUp = vsPrev !== null ? Number(vsPrev) >= 0 : true;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', width: 360, maxWidth: '92vw', padding: 24, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1 }}>
          <X size={16} />
        </button>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{metricName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>{point.label}</div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#0D9488' }}>{point.formattedValue}</div>
          {point.change && (
            <div style={{ fontSize: 12, marginTop: 4, color: point.changeUp ? 'var(--success)' : 'var(--error)', fontFamily: 'var(--font-body)' }}>{point.change}</div>
          )}
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-card)', padding: '10px 12px', marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{metricDescription}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-card)', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'var(--font-body)' }}>vs Promedio</div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: avgUp ? 'var(--success)' : 'var(--error)' }}>
              {avgUp ? '+' : ''}{vsAvg}%
            </div>
          </div>
          {vsPrev !== null && (
            <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-card)', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'var(--font-body)' }}>vs Anterior</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: prevUp ? 'var(--success)' : 'var(--error)' }}>
                {prevUp ? '+' : ''}{vsPrev}%
              </div>
            </div>
          )}
        </div>

        {point.detail && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '10px 12px', marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Desglose</div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{point.detail}</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onViewFullReport} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-button)', background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            Ver reporte completo
          </button>
          <button onClick={() => toast.success('Datos descargados')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-button)', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FullReportModal ────────────────────────────────────────────
interface FullReportModalProps {
  title: string;
  data: ChartDataPoint[];
  metricName: string;
  metricDescription: string;
  unit?: string;
  chartType: ChartType;
  color: string;
  onClose: () => void;
}

function FullReportModal({ title, data, metricName, metricDescription, unit, color, onClose }: FullReportModalProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const avg = total / data.length;
  const max = data.reduce((m, d) => d.value > m.value ? d : m, data[0]);
  const min = data.reduce((m, d) => d.value < m.value ? d : m, data[0]);

  const stats = [
    { label: 'Total', value: formatValue(total, unit) },
    { label: 'Promedio', value: formatValue(avg, unit) },
    { label: 'Máximo', value: `${formatValue(max.value, unit)} (${max.label})` },
    { label: 'Mínimo', value: `${formatValue(min.value, unit)} (${min.label})` },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', width: 620, maxWidth: '96vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>Reporte completo — {metricName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-body)' }}>Todos los datos del período</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
          {/* Stats summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-card)', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontFamily: 'var(--font-body)' }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Data table */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', position: 'sticky', top: 0 }}>
                    {['Período', 'Valor', 'Cambio'].map((h) => (
                      <th key={h} style={{ textAlign: h === 'Período' ? 'left' : 'right', padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((d, i) => {
                    const prev = i > 0 ? data[i - 1].value : d.value;
                    const change = i > 0 ? ((d.value - prev) / prev * 100) : 0;
                    return (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-body)' }}>{d.label}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{d.formattedValue}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: i > 0 ? (change >= 0 ? 'var(--success)' : 'var(--error)') : 'var(--text-muted)' }}>
                          {i > 0 ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <button onClick={() => toast.success('Reporte CSV descargado')} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-button)', background: '#0D9488', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
            Descargar reporte completo (.csv)
          </button>
          <button onClick={() => toast.info('Generando PDF...')} style={{ padding: '10px 14px', borderRadius: 'var(--radius-button)', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── useChartDimensions — mide el contenedor ────────────────────
function useChartDimensions(ref: React.RefObject<HTMLDivElement | null>) {
  const [dims, setDims] = useState({ width: 400, height: 200 });
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return dims;
}

// ── InteractiveChart — componente principal exportado ──────────
export function InteractiveChart({
  title,
  subtitle,
  type,
  data,
  height = 200,
  color = '#0D9488',
  secondaryColor,
  showPeriodSelector = false,
  periods = ['7d', '30d', '90d'],
  activePeriod,
  onPeriodChange,
  metricName,
  metricDescription,
  unit,
}: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDataModal, setShowDataModal] = useState<number | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [internalPeriod, setInternalPeriod] = useState(activePeriod ?? periods[0]);
  const chartRef = useRef<HTMLDivElement>(null);
  const dims = useChartDimensions(chartRef);

  if (!data || data.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: 24, minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' }}>
          <BarChart2 size={16} />
          Sin datos disponibles
        </div>
      </div>
    );
  }

  const handleDataClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDataModal(index);
  };

  const rendererProps = {
    data,
    color,
    secondaryColor,
    width: dims.width,
    height: dims.height,
    hoveredIndex,
    onHover: setHoveredIndex,
    onClick: handleDataClick,
  };

  const renderChart = () => {
    switch (type) {
      case 'area':    return <AreaGradientChart {...rendererProps} />;
      case 'bars':    return <GradientBarsChart {...rendererProps} />;
      case 'pulse':   return <SteppedPulseChart {...rendererProps} />;
      case 'sine':    return <SineWaveChart {...rendererProps} />;
      case 'stacked': return <StackedWavesChart {...rendererProps} />;
      case 'progress': return <ProgressBarsChart {...rendererProps} />;
      default:        return <AreaGradientChart {...rendererProps} />;
    }
  };

  const currentPeriod = activePeriod ?? internalPeriod;
  const handlePeriodChange = (p: string) => {
    setInternalPeriod(p);
    onPeriodChange?.(p);
  };

  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 8px' }}>
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-heading)', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', margin: '2px 0 0' }}>{subtitle}</p>}
          </div>
          {showPeriodSelector && (
            <PeriodSelector periods={periods} active={currentPeriod} onChange={handlePeriodChange} />
          )}
        </div>

        {/* Chart area */}
        <div
          ref={chartRef}
          onClick={() => setShowFullReport(true)}
          style={{ padding: '4px 16px 12px', height, position: 'relative', cursor: 'pointer' }}
        >
          {renderChart()}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <HoverTooltip point={data[hoveredIndex]} />
          )}
        </div>
      </div>

      {showDataModal !== null && data[showDataModal] && (
        <DataPointModal
          point={data[showDataModal]}
          allData={data}
          metricName={metricName}
          metricDescription={metricDescription}
          unit={unit}
          onClose={() => setShowDataModal(null)}
          onViewFullReport={() => { setShowDataModal(null); setShowFullReport(true); }}
        />
      )}

      {showFullReport && (
        <FullReportModal
          title={title}
          data={data}
          metricName={metricName}
          metricDescription={metricDescription}
          unit={unit}
          chartType={type}
          color={color}
          onClose={() => setShowFullReport(false)}
        />
      )}
    </>
  );
}
