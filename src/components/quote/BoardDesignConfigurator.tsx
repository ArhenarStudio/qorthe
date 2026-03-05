"use client";

import React from 'react';
import { BoardDesign, BoardShape } from './types';
import { useQuoteConfig } from '@/hooks/useQuoteConfig';

// ═══════════════════════════════════════════════════════════════
// BoardDesignConfigurator — Personalización de diseño de tabla
// Forma, acabados, extras (canaletas, patitas, agarres, borde vivo)
// ═══════════════════════════════════════════════════════════════

interface BoardDesignConfiguratorProps {
  design: BoardDesign;
  onChange: (design: BoardDesign) => void;
}

// ── Shape options with SVG previews ─────────────────────────

const SHAPES: { value: BoardShape; label: string; preview: React.ReactNode }[] = [
  {
    value: 'Rectangular',
    label: 'Rectangular',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <rect x="5" y="5" width="50" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'Redonda',
    label: 'Redonda',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <circle cx="30" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'Ovalada',
    label: 'Ovalada',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <ellipse cx="30" cy="20" rx="25" ry="15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'Corazón',
    label: 'Corazón',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M30 35 C15 25 5 15 15 10 C22 6 28 12 30 16 C32 12 38 6 45 10 C55 15 45 25 30 35z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'Irregular',
    label: 'Borde natural',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <path d="M8 15 C10 8 18 5 25 6 C32 4 40 5 48 8 C54 12 55 20 52 28 C48 34 38 36 30 35 C22 36 12 33 8 27 C5 22 6 18 8 15z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    value: 'Personalizada',
    label: 'Forma libre',
    preview: (
      <svg viewBox="0 0 60 40" className="w-full h-full">
        <rect x="10" y="8" width="40" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" />
        <text x="30" y="24" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.5">?</text>
      </svg>
    ),
  },
];

// ── Toggle extras ───────────────────────────────────────────

const EXTRAS: { key: keyof Pick<BoardDesign, 'hasJuiceGroove' | 'hasHandleHoles' | 'hasRubberFeet' | 'hasLiveEdge'>; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: 'hasJuiceGroove',
    label: 'Canaleta',
    desc: 'Surco perimetral para líquidos',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="5" y="5" width="14" height="14" rx="1" fill="none" strokeDasharray="3 2" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'hasHandleHoles',
    label: 'Agarres',
    desc: 'Orificios laterales para manos',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <ellipse cx="6" cy="12" rx="1.5" ry="3" />
        <ellipse cx="18" cy="12" rx="1.5" ry="3" />
      </svg>
    ),
  },
  {
    key: 'hasRubberFeet',
    label: 'Patitas',
    desc: 'Bases antideslizantes de silicón',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="16" height="12" rx="2" />
        <circle cx="7" cy="20" r="2" fill="currentColor" opacity="0.4" />
        <circle cx="17" cy="20" r="2" fill="currentColor" opacity="0.4" />
        <line x1="7" y1="16" x2="7" y2="18" strokeDasharray="1 1" opacity="0.3" />
        <line x1="17" y1="16" x2="17" y2="18" strokeDasharray="1 1" opacity="0.3" />
      </svg>
    ),
  },
  {
    key: 'hasLiveEdge',
    label: 'Borde vivo',
    desc: 'Conserva el borde natural de la madera',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8 C5 5 8 7 10 5 C12 3 15 6 17 4 C19 3 21 5 21 8 L21 18 C21 19 20 20 19 20 L5 20 C4 20 3 19 3 18 Z" />
      </svg>
    ),
  },
];

// FINISH_OPTIONS now comes from useQuoteConfig()

// ── Component ───────────────────────────────────────────────

export const BoardDesignConfigurator: React.FC<BoardDesignConfiguratorProps> = ({
  design,
  onChange,
}) => {
  // Read board design config from centralized admin-configurable source
  const { config: qc } = useQuoteConfig();
  const enabledShapes = qc.boardShapes.filter(s => s.enabled);
  const enabledExtras = qc.boardExtras.filter(e => e.enabled);
  const enabledFinishes = qc.boardFinishes.filter(f => f.enabled);
  return (
    <div className="space-y-8">
      {/* Shape selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Forma de la pieza
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {enabledShapes.map((shapeOpt) => {
            const s = SHAPES.find(sh => sh.value === shapeOpt.value) || { value: shapeOpt.value, label: shapeOpt.label, preview: null };
            const sel = design.shape === s.value;
            return (
              <button
                key={s.value}
                onClick={() => onChange({ ...design, shape: s.value })}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  sel
                    ? 'border-accent-gold bg-accent-gold/5 shadow-md'
                    : 'border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900 hover:border-wood-300'
                }`}
              >
                {s.preview && (
                  <div className={`w-12 h-8 mb-1.5 ${sel ? 'text-accent-gold' : 'text-wood-400'}`}>
                    {s.preview}
                  </div>
                )}
                <span className={`text-[10px] font-bold ${sel ? 'text-accent-gold' : 'text-wood-500'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
        {design.shape === 'Personalizada' && (
          <textarea
            placeholder="Describe la forma que deseas (ej: forma de México, silueta de animal, etc.)"
            value={design.customShapeNotes || ''}
            onChange={(e) => onChange({ ...design, customShapeNotes: e.target.value })}
            rows={2}
            className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-600 focus:border-accent-gold outline-none text-sm resize-none"
          />
        )}
      </div>

      {/* Extras toggles */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Extras y acabados
        </label>
        <div className="grid grid-cols-2 gap-3">
          {enabledExtras.map((extraOpt) => {
            const extra = EXTRAS.find(e => e.key === extraOpt.key) || { key: extraOpt.key, label: extraOpt.label, desc: extraOpt.desc, icon: null };
            const active = design[extra.key as keyof Pick<BoardDesign, 'hasJuiceGroove' | 'hasHandleHoles' | 'hasRubberFeet' | 'hasLiveEdge'>];
            return (
              <button
                key={extra.key}
                onClick={() => onChange({ ...design, [extra.key as string]: !active })}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'border-accent-gold bg-accent-gold/5'
                    : 'border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900 hover:border-wood-300'
                }`}
              >
                <div className={`shrink-0 mt-0.5 ${active ? 'text-accent-gold' : 'text-wood-400'}`}>
                  {extra.icon}
                </div>
                <div>
                  <span className={`block text-sm font-bold ${active ? 'text-wood-900 dark:text-sand-100' : 'text-wood-600'}`}>
                    {extra.label}
                  </span>
                  <span className="block text-[10px] text-wood-400 mt-0.5">
                    {extra.desc}
                  </span>
                </div>
                <div className={`ml-auto shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                  active ? 'bg-accent-gold border-accent-gold' : 'border-wood-300 dark:border-wood-600'
                }`}>
                  {active && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Finish type */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Tipo de acabado
        </label>
        <div className="flex gap-3">
          {enabledFinishes.map((finishOpt) => {
            const finish = finishOpt.label as BoardDesign['finishType'];
            const sel = design.finishType === finish;
            return (
              <button
                key={finish}
                onClick={() => onChange({ ...design, finishType: finish })}
                className={`flex-1 py-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                  sel
                    ? 'border-accent-gold bg-accent-gold/10 text-wood-900 dark:text-sand-100 font-bold'
                    : 'border-wood-100 dark:border-wood-800 bg-white dark:bg-wood-900 text-wood-500 hover:border-wood-300'
                }`}
              >
                {finish}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">
          Notas adicionales de diseño (opcional)
        </label>
        <textarea
          placeholder="Instrucciones especiales para el diseño de tu pieza..."
          value={design.notes || ''}
          onChange={(e) => onChange({ ...design, notes: e.target.value })}
          rows={2}
          className="w-full p-3 rounded-xl bg-sand-50 dark:bg-wood-800 border border-wood-200 dark:border-wood-600 focus:border-accent-gold outline-none text-sm resize-none"
        />
      </div>
    </div>
  );
};
