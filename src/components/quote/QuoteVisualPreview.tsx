"use client";

import React from 'react';
import { ProductItem, WoodType, EngravingZone, TextileColor } from './types';

// ═══════════════════════════════════════════════════════════════
// QuoteVisualPreview — 2D SVG representation of the configured piece
// Shows proportional dimensions, wood color, engraving zones, textile color
// ═══════════════════════════════════════════════════════════════

interface QuoteVisualPreviewProps {
  item: ProductItem;
  className?: string;
}

// ── Wood color map ──────────────────────────────────────────

const WOOD_COLORS: Record<WoodType, { fill: string; stroke: string; grain: string }> = {
  Cedro:       { fill: '#B8734A', stroke: '#8B5A2B', grain: '#A0623C' },
  Nogal:       { fill: '#5C4033', stroke: '#3B2716', grain: '#4A3428' },
  Encino:      { fill: '#D7C49E', stroke: '#B8A67A', grain: '#C9B68E' },
  Parota:      { fill: '#7A5C4F', stroke: '#4A3528', grain: '#6B4D40' },
  Combinación: { fill: '#8B7355', stroke: '#5C4A38', grain: '#7A6345' },
};

const TEXTILE_COLORS: Record<TextileColor, string> = {
  Natural:       '#F5F0E8',
  Negro:         '#2D2D2D',
  Blanco:        '#FAFAFA',
  'Azul Marino': '#1B3A5C',
  Terracota:     '#C75B39',
  'Verde Olivo': '#5C6B3C',
};

// ── Zone position map (relative to board) ───────────────────

const ZONE_POSITIONS: Partial<Record<EngravingZone, { cx: number; cy: number; label: string }>> = {
  Centro:           { cx: 0.5,  cy: 0.5,  label: 'C' },
  Esquina:          { cx: 0.15, cy: 0.85, label: 'E' },
  'Borde superior': { cx: 0.5,  cy: 0.12, label: 'B' },
  Reverso:          { cx: 0.85, cy: 0.85, label: 'R' },
  'Multi-zona':     { cx: 0.5,  cy: 0.5,  label: 'M' },
  'Lateral izquierdo': { cx: 0.05, cy: 0.5, label: 'LI' },
  'Lateral derecho':   { cx: 0.95, cy: 0.5, label: 'LD' },
  'Frontal completo':  { cx: 0.5,  cy: 0.5, label: 'F' },
};

// ── Wood Board Preview ──────────────────────────────────────

function WoodPreview({ item }: { item: ProductItem }) {
  const { length, width } = item.dimensions;
  const wood = item.woods.length > 0 ? item.woods[0] : 'Cedro';
  const colors = WOOD_COLORS[wood] || WOOD_COLORS.Cedro;

  // Proportional sizing (max 200px wide, maintain aspect ratio)
  const maxW = 200;
  const maxH = 160;
  const ratio = length / width;
  let w: number, h: number;

  if (ratio > maxW / maxH) {
    w = maxW;
    h = maxW / ratio;
  } else {
    h = maxH;
    w = maxH * ratio;
  }

  // Ensure minimum size
  w = Math.max(80, w);
  h = Math.max(60, h);

  const svgW = w + 60;
  const svgH = h + 50;
  const ox = (svgW - w) / 2;
  const oy = 10;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: 200 }}>
      {/* Board shadow */}
      <rect x={ox + 3} y={oy + 3} width={w} height={h} rx={4} fill="#00000015" />

      {/* Board body */}
      <rect x={ox} y={oy} width={w} height={h} rx={4} fill={colors.fill} stroke={colors.stroke} strokeWidth={1.5} />

      {/* Wood grain lines */}
      {[0.2, 0.4, 0.6, 0.8].map((pct, i) => (
        <line
          key={i}
          x1={ox + w * pct + (i % 2 === 0 ? -5 : 5)}
          y1={oy + 4}
          x2={ox + w * pct + (i % 2 === 0 ? 5 : -5)}
          y2={oy + h - 4}
          stroke={colors.grain}
          strokeWidth={0.8}
          opacity={0.4}
        />
      ))}

      {/* Handle cutout for cutting boards */}
      {(item.type === 'Tabla de picar' || item.type === 'Tabla de charcutería') && (
        <circle
          cx={ox + w - 12}
          cy={oy + 12}
          r={5}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={1}
          opacity={0.6}
        />
      )}

      {/* Engraving zones */}
      {item.engraving.enabled &&
        item.engraving.zones.map((zone) => {
          const pos = ZONE_POSITIONS[zone];
          if (!pos) return null;
          const cx = ox + w * pos.cx;
          const cy = oy + h * pos.cy;

          if (zone === 'Multi-zona') {
            return (
              <g key={zone}>
                <rect x={ox + 8} y={oy + 8} width={w - 16} height={h - 16} rx={2} fill="none" stroke="#C5A065" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.8} />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="#C5A065" fontSize={10} fontWeight="bold">MULTI</text>
              </g>
            );
          }

          return (
            <g key={zone}>
              <circle cx={cx} cy={cy} r={14} fill="#C5A06520" stroke="#C5A065" strokeWidth={1} strokeDasharray="3 2" />
              <text x={cx} y={cy + 3.5} textAnchor="middle" fill="#C5A065" fontSize={9} fontWeight="bold">{pos.label}</text>
            </g>
          );
        })}

      {/* Dimension labels */}
      <text x={ox + w / 2} y={oy + h + 20} textAnchor="middle" fill="currentColor" fontSize={10} opacity={0.5} fontFamily="Inter, sans-serif">
        {length} × {width} cm
      </text>
      {/* Thickness indicator */}
      <text x={ox + w / 2} y={oy + h + 32} textAnchor="middle" fill="currentColor" fontSize={8} opacity={0.35} fontFamily="Inter, sans-serif">
        espesor {item.dimensions.thickness} cm
      </text>
    </svg>
  );
}

// ── Textile Preview ─────────────────────────────────────────

function TextilePreview({ item }: { item: ProductItem }) {
  const color = TEXTILE_COLORS[item.textile?.color || 'Natural'] || '#F5F0E8';
  const isDark = ['Negro', 'Azul Marino'].includes(item.textile?.color || '');
  const textColor = isDark ? '#FFFFFF90' : '#00000040';
  const accentColor = isDark ? '#C5A065' : '#8B6F1E';
  const printZone = item.textile?.printZone || 'Frente';

  if (item.type === 'Tote bag') {
    return (
      <svg viewBox="0 0 200 200" className="w-full" style={{ maxHeight: 180 }}>
        {/* Bag body */}
        <path d="M50 70 L50 170 Q50 180 60 180 L140 180 Q150 180 150 170 L150 70 Z" fill={color} stroke={isDark ? '#555' : '#CCC'} strokeWidth={1.2} />
        {/* Handles */}
        <path d="M70 70 Q70 40 85 40 L115 40 Q130 40 130 70" fill="none" stroke={isDark ? '#555' : '#AAA'} strokeWidth={2.5} strokeLinecap="round" />
        {/* Print zone */}
        {printZone !== 'Reverso' && (
          <g>
            <rect x={65} y={90} width={70} height={60} rx={3} fill="none" stroke={accentColor} strokeWidth={1} strokeDasharray="4 3" />
            <text x={100} y={124} textAnchor="middle" fill={accentColor} fontSize={9} fontWeight="bold">
              {item.textile?.technique === 'Sublimación' ? 'SUBLIMACIÓN' : item.textile?.technique?.toUpperCase() || 'DISEÑO'}
            </text>
          </g>
        )}
        {/* Label */}
        <text x={100} y={198} textAnchor="middle" fill="currentColor" fontSize={10} opacity={0.5}>Tote Bag</text>
      </svg>
    );
  }

  if (item.type === 'Mandil de cocina') {
    return (
      <svg viewBox="0 0 200 220" className="w-full" style={{ maxHeight: 180 }}>
        {/* Apron body */}
        <path d="M60 50 L55 200 Q55 210 65 210 L135 210 Q145 210 145 200 L140 50 Q130 30 100 30 Q70 30 60 50 Z" fill={color} stroke={isDark ? '#555' : '#CCC'} strokeWidth={1.2} />
        {/* Neck strap */}
        <path d="M75 50 Q100 20 125 50" fill="none" stroke={isDark ? '#555' : '#AAA'} strokeWidth={2} />
        {/* Pocket */}
        <rect x={72} y={140} width={56} height={35} rx={3} fill="none" stroke={textColor} strokeWidth={0.8} />
        {/* Print zone */}
        <rect x={70} y={70} width={60} height={50} rx={3} fill="none" stroke={accentColor} strokeWidth={1} strokeDasharray="4 3" />
        <text x={100} y={99} textAnchor="middle" fill={accentColor} fontSize={9} fontWeight="bold">DISEÑO</text>
        <text x={100} y={218} textAnchor="middle" fill="currentColor" fontSize={10} opacity={0.5}>Mandil</text>
      </svg>
    );
  }

  // Generic textile (servilleta, cojín)
  return (
    <svg viewBox="0 0 200 180" className="w-full" style={{ maxHeight: 160 }}>
      <rect x={30} y={20} width={140} height={120} rx={4} fill={color} stroke={isDark ? '#555' : '#CCC'} strokeWidth={1.2} />
      {/* Diagonal fold for servilleta */}
      {item.type === 'Servilletas' && (
        <line x1={30} y1={20} x2={170} y2={140} stroke={textColor} strokeWidth={0.8} strokeDasharray="4 3" />
      )}
      {/* Print zone */}
      <rect x={55} y={45} width={90} height={70} rx={3} fill="none" stroke={accentColor} strokeWidth={1} strokeDasharray="4 3" />
      <text x={100} y={84} textAnchor="middle" fill={accentColor} fontSize={9} fontWeight="bold">
        {printZone === 'Panel completo' ? 'FULL PANEL' : 'DISEÑO'}
      </text>
      <text x={100} y={160} textAnchor="middle" fill="currentColor" fontSize={10} opacity={0.5}>
        {item.type}
      </text>
    </svg>
  );
}

// ── Service/Engraving Preview ───────────────────────────────

function EngravingServicePreview({ item }: { item: ProductItem }) {
  return (
    <svg viewBox="0 0 200 160" className="w-full" style={{ maxHeight: 140 }}>
      {/* Generic surface */}
      <rect x={30} y={20} width={140} height={100} rx={6} fill="#E8E0D6" stroke="#C4B8A8" strokeWidth={1.2} />
      {/* Laser beam indicator */}
      <line x1={100} y1={0} x2={100} y2={45} stroke="#C5A065" strokeWidth={1.5} strokeDasharray="3 2" />
      <circle cx={100} cy={48} r={2} fill="#C5A065" />
      {/* Engraving area */}
      <rect x={55} y={45} width={90} height={50} rx={3} fill="none" stroke="#C5A065" strokeWidth={1} strokeDasharray="4 3" />
      <text x={100} y={74} textAnchor="middle" fill="#C5A065" fontSize={9} fontWeight="bold">
        {item.engraving.type === 'Código QR' ? 'QR CODE' : item.engraving.type.toUpperCase()}
      </text>
      <text x={100} y={140} textAnchor="middle" fill="currentColor" fontSize={10} opacity={0.5}>
        {item.materialToEngrave || 'Grabado Láser'}
      </text>
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────

export const QuoteVisualPreview: React.FC<QuoteVisualPreviewProps> = ({ item, className }) => {
  return (
    <div className={`flex items-center justify-center py-3 ${className || ''}`}>
      {item.category === 'madera' && <WoodPreview item={item} />}
      {item.category === 'textil' && <TextilePreview item={item} />}
      {item.category === 'grabado' && <EngravingServicePreview item={item} />}
    </div>
  );
};
