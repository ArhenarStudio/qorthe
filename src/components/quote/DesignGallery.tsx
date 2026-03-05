"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Galería de Templates de Diseño
// Diseños populares predefinidos que el cliente puede seleccionar
// en lugar de subir su propio archivo
// ═══════════════════════════════════════════════════════════════

// ── Template Types ──────────────────────────────────────────

export type TemplateCategory =
  | 'monograma'
  | 'frase'
  | 'patron'
  | 'logo-estilo'
  | 'ocasion'
  | 'corporativo';

export interface DesignTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Description shown below name */
  desc: string;
  /** SVG content rendered as preview thumbnail */
  preview: React.ReactNode;
  /** Text to pre-fill if applicable */
  defaultText?: string;
  /** Tags for filtering */
  tags: string[];
  /** Whether this template is for wood, textile, or both */
  applicableTo: ('madera' | 'textil' | 'grabado')[];
}

// ── Category Labels ─────────────────────────────────────────

const CATEGORIES: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'monograma', label: 'Monogramas' },
  { id: 'frase', label: 'Frases' },
  { id: 'patron', label: 'Patrones' },
  { id: 'logo-estilo', label: 'Logos' },
  { id: 'ocasion', label: 'Ocasiones' },
  { id: 'corporativo', label: 'Corporativo' },
];

// ── Template SVG Previews ───────────────────────────────────

const MonogramCircle = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
    <text x="40" y="48" textAnchor="middle" fill="currentColor" fontSize="24" fontFamily="serif" fontWeight="bold">AB</text>
  </svg>
);

const MonogramDiamond = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="16" y="16" width="48" height="48" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 40 40)" />
    <text x="40" y="47" textAnchor="middle" fill="currentColor" fontSize="20" fontFamily="serif" fontStyle="italic">M</text>
  </svg>
);

const MonogramLaurel = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <path d="M20 60 Q15 40 25 25 Q30 35 25 50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <path d="M60 60 Q65 40 55 25 Q50 35 55 50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <text x="40" y="48" textAnchor="middle" fill="currentColor" fontSize="18" fontFamily="serif" fontWeight="bold">JR</text>
    <line x1="28" y1="55" x2="52" y2="55" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
  </svg>
);

const FraseBonAppetit = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <text x="40" y="35" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="serif" fontStyle="italic">Bon</text>
    <text x="40" y="52" textAnchor="middle" fill="currentColor" fontSize="13" fontFamily="serif" fontWeight="bold">Appétit</text>
    <line x1="15" y1="60" x2="65" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

const FraseHomeMade = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <text x="40" y="30" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="sans-serif" letterSpacing="3">HECHO EN</text>
    <text x="40" y="48" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="serif" fontWeight="bold">Casa</text>
    <text x="40" y="62" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif" letterSpacing="2">CON AMOR</text>
  </svg>
);

const FraseFecha = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <text x="40" y="28" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="sans-serif" letterSpacing="2">EST.</text>
    <text x="40" y="48" textAnchor="middle" fill="currentColor" fontSize="18" fontFamily="serif" fontWeight="bold">2024</text>
    <line x1="18" y1="55" x2="62" y2="55" stroke="currentColor" strokeWidth="0.8" />
    <text x="40" y="66" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif" letterSpacing="1">FAMILIA PÉREZ</text>
  </svg>
);

const PatronGeometrico = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {[0, 1, 2, 3].map(i => (
      <g key={i}>
        <rect x={10 + i * 16} y={10 + i * 16} width={60 - i * 32} height={60 - i * 32} fill="none" stroke="currentColor" strokeWidth="0.8" opacity={0.3 + i * 0.2} transform={`rotate(${i * 15} 40 40)`} />
      </g>
    ))}
  </svg>
);

const PatronOndas = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {[20, 35, 50, 65].map(y => (
      <path key={y} d={`M10 ${y} Q25 ${y - 8} 40 ${y} Q55 ${y + 8} 70 ${y}`} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    ))}
  </svg>
);

const LogoMinimalista = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="20" y="20" width="40" height="40" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="40" y="46" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="sans-serif" fontWeight="bold">DS</text>
  </svg>
);

const LogoSello = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="40" cy="40" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <text x="40" y="36" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="sans-serif" letterSpacing="3">ARTESANAL</text>
    <line x1="20" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="0.5" />
    <text x="40" y="52" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="serif" fontWeight="bold">MARCA</text>
  </svg>
);

const OcasionBoda = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <text x="40" y="25" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="serif" fontStyle="italic">Ana</text>
    <text x="40" y="42" textAnchor="middle" fill="currentColor" fontSize="16" fontFamily="serif">&amp;</text>
    <text x="40" y="58" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="serif" fontStyle="italic">Carlos</text>
    <text x="40" y="72" textAnchor="middle" fill="currentColor" fontSize="6" fontFamily="sans-serif" letterSpacing="1">15.06.2024</text>
  </svg>
);

const OcasionNavidad = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <polygon points="40,15 50,40 65,40 53,52 57,70 40,60 23,70 27,52 15,40 30,40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <text x="40" y="78" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="serif" letterSpacing="1">NAVIDAD</text>
  </svg>
);

const CorpQR = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect x="22" y="15" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <rect x="42" y="15" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <rect x="22" y="35" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <rect x="42" y="35" width="8" height="8" fill="currentColor" opacity="0.3" />
    <rect x="52" y="45" width="8" height="8" fill="currentColor" opacity="0.3" />
    <text x="40" y="70" textAnchor="middle" fill="currentColor" fontSize="7" fontFamily="sans-serif" letterSpacing="1">MENÚ QR</text>
  </svg>
);

// ── Template Catalog ────────────────────────────────────────

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'mono-circle',
    name: 'Monograma Círculo',
    category: 'monograma',
    desc: 'Iniciales en marco circular clásico',
    preview: <MonogramCircle />,
    defaultText: 'AB',
    tags: ['iniciales', 'elegante', 'clásico'],
    applicableTo: ['madera', 'textil', 'grabado'],
  },
  {
    id: 'mono-diamond',
    name: 'Monograma Diamante',
    category: 'monograma',
    desc: 'Inicial en marco rombo rotado',
    preview: <MonogramDiamond />,
    defaultText: 'M',
    tags: ['inicial', 'moderno', 'geométrico'],
    applicableTo: ['madera', 'textil', 'grabado'],
  },
  {
    id: 'mono-laurel',
    name: 'Monograma Laurel',
    category: 'monograma',
    desc: 'Iniciales con hojas de laurel',
    preview: <MonogramLaurel />,
    defaultText: 'JR',
    tags: ['iniciales', 'premium', 'laurel'],
    applicableTo: ['madera', 'grabado'],
  },
  {
    id: 'frase-appetit',
    name: 'Bon Appétit',
    category: 'frase',
    desc: 'Frase clásica de cocina',
    preview: <FraseBonAppetit />,
    defaultText: 'Bon Appétit',
    tags: ['cocina', 'francés', 'elegante'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'frase-homemade',
    name: 'Hecho en Casa',
    category: 'frase',
    desc: 'Para cocinas con amor',
    preview: <FraseHomeMade />,
    defaultText: 'Hecho en Casa con Amor',
    tags: ['hogar', 'cocina', 'artesanal'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'frase-fecha',
    name: 'Fecha Conmemorativa',
    category: 'frase',
    desc: 'Año, nombre de familia o negocio',
    preview: <FraseFecha />,
    defaultText: '2024',
    tags: ['fecha', 'aniversario', 'familia'],
    applicableTo: ['madera', 'grabado'],
  },
  {
    id: 'patron-geo',
    name: 'Geométrico',
    category: 'patron',
    desc: 'Patrón de cuadros rotados',
    preview: <PatronGeometrico />,
    tags: ['abstracto', 'moderno', 'decorativo'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'patron-ondas',
    name: 'Ondas',
    category: 'patron',
    desc: 'Patrón orgánico de ondas',
    preview: <PatronOndas />,
    tags: ['orgánico', 'mar', 'fluido'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'logo-minimal',
    name: 'Logo Minimalista',
    category: 'logo-estilo',
    desc: 'Iniciales en rectángulo redondeado',
    preview: <LogoMinimalista />,
    defaultText: 'DS',
    tags: ['marca', 'moderno', 'simple'],
    applicableTo: ['madera', 'textil', 'grabado'],
  },
  {
    id: 'logo-sello',
    name: 'Sello Artesanal',
    category: 'logo-estilo',
    desc: 'Estilo sello circular con texto',
    preview: <LogoSello />,
    defaultText: 'MARCA',
    tags: ['sello', 'artesanal', 'vintage'],
    applicableTo: ['madera', 'textil', 'grabado'],
  },
  {
    id: 'ocasion-boda',
    name: 'Boda / Pareja',
    category: 'ocasion',
    desc: 'Nombres de pareja con fecha',
    preview: <OcasionBoda />,
    defaultText: 'Ana & Carlos',
    tags: ['boda', 'pareja', 'romántico'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'ocasion-navidad',
    name: 'Navidad / Estrella',
    category: 'ocasion',
    desc: 'Estrella navideña decorativa',
    preview: <OcasionNavidad />,
    tags: ['navidad', 'estrella', 'festividad'],
    applicableTo: ['madera', 'textil'],
  },
  {
    id: 'corp-qr',
    name: 'Código QR Menú',
    category: 'corporativo',
    desc: 'QR para restaurantes y negocios',
    preview: <CorpQR />,
    tags: ['qr', 'restaurante', 'menú', 'negocio'],
    applicableTo: ['madera', 'grabado'],
  },
];

// ── Gallery Component ───────────────────────────────────────

interface DesignGalleryProps {
  /** Filter by product category */
  productCategory: 'madera' | 'textil' | 'grabado';
  /** Currently selected template ID */
  selectedId?: string;
  /** Called when user picks a template */
  onSelect: (template: DesignTemplate) => void;
  /** Called to close gallery */
  onClose: () => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  productCategory,
  selectedId,
  onSelect,
  onClose,
}) => {
  const [filter, setFilter] = useState<TemplateCategory | 'all'>('all');

  const filtered = DESIGN_TEMPLATES.filter((t) => {
    if (!t.applicableTo.includes(productCategory)) return false;
    if (filter !== 'all' && t.category !== filter) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white dark:bg-wood-950 border border-wood-200 dark:border-wood-700 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-wood-100 dark:border-wood-800 bg-wood-50/50 dark:bg-wood-900/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-gold" />
          <span className="text-sm font-bold text-wood-900 dark:text-sand-100">Galería de Diseños</span>
          <span className="text-[10px] text-wood-400">({filtered.length})</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-wood-100 dark:hover:bg-wood-800 text-wood-400 hover:text-wood-900 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category filters */}
      <div className="px-4 py-2 border-b border-wood-100 dark:border-wood-800 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              filter === cat.id
                ? 'bg-wood-900 dark:bg-sand-100 text-sand-100 dark:text-wood-900'
                : 'text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 hover:bg-wood-100 dark:hover:bg-wood-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-4 max-h-[320px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-wood-400 py-8">No hay diseños en esta categoría para este tipo de producto.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filtered.map((template) => {
              const isSelected = selectedId === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-accent-gold bg-accent-gold/5 shadow-md'
                      : 'border-transparent hover:border-wood-200 dark:hover:border-wood-700 bg-wood-50 dark:bg-wood-900/50'
                  }`}
                >
                  {/* Preview SVG */}
                  <div className={`w-14 h-14 mb-2 ${isSelected ? 'text-accent-gold' : 'text-wood-500 dark:text-wood-400'}`}>
                    {template.preview}
                  </div>
                  {/* Name */}
                  <span className={`text-[10px] font-bold text-center leading-tight ${
                    isSelected ? 'text-accent-gold' : 'text-wood-600 dark:text-wood-400'
                  }`}>
                    {template.name}
                  </span>
                  {/* Selected check */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-5 h-5 bg-accent-gold rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-wood-100 dark:border-wood-800 bg-wood-50/30 dark:bg-wood-900/30">
        <p className="text-[10px] text-wood-400 text-center">
          Selecciona un diseño base. Puedes personalizarlo con tu texto o logo después.
        </p>
      </div>
    </motion.div>
  );
};
