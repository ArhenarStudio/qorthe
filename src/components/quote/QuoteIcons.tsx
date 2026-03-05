// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Iconos SVG artesanales
// Iconos propios para el cotizador, sin emojis ni Lucide genéricos
// Estilo: trazo fino, minimalista, inspiración artesanal mexicana
// ═══════════════════════════════════════════════════════════════

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const defaults = { size: 24 };

/** Tabla de picar — silueta de tabla con handle */
export const TablaIconPicar: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="12" height="16" rx="2" />
    <line x1="10" y1="19" x2="10" y2="22" />
    <circle cx="10" cy="22" r="1" fill="currentColor" />
  </svg>
);

/** Tabla de charcutería — tabla larga con secciones */
export const TablaIconCharcuteria: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7a1 1 0 011-1z" />
    <line x1="9" y1="6" x2="9" y2="18" strokeDasharray="2 2" />
    <line x1="15" y1="6" x2="15" y2="18" strokeDasharray="2 2" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
  </svg>
);

/** Tabla decorativa — marco con hoja */
export const TablaIconDecorativa: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M12 8c-2 2-2 4 0 6 2-2 2-4 0-6z" fill="currentColor" opacity="0.3" />
    <path d="M12 8c-2 2-2 4 0 6 2-2 2-4 0-6z" />
    <line x1="12" y1="14" x2="12" y2="17" />
  </svg>
);

/** Plato decorativo — círculo con patrón */
export const PlatoIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

/** Caja personalizada — caja abierta */
export const CajaIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-5 9 5v7l-9 5-9-5V9z" />
    <path d="M12 4v18" />
    <path d="M3 9l9 5 9-5" />
  </svg>
);

/** Tote bag — bolsa de tela */
export const ToteBagIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 8h14l1 13H4L5 8z" />
    <path d="M8 8V6a4 4 0 018 0v2" />
  </svg>
);

/** Mandil de cocina — delantal con bolsillo */
export const MandilIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 4h12l1 3v4c0 2-2 3-4 3h-1v7H10v-7H9c-2 0-4-1-4-3V7l1-3z" />
    <rect x="9" y="14" width="6" height="4" rx="0.5" />
    <path d="M4 4l2 3" />
    <path d="M20 4l-2 3" />
  </svg>
);

/** Servilleta — tela doblada con borde */
export const ServilletaIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4h16v16H4z" />
    <path d="M4 4l16 16" strokeDasharray="3 2" />
    <path d="M7 4v3" />
    <path d="M4 7h3" />
  </svg>
);

/** Funda de cojín — cojín con cremallera */
export const CojinIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <line x1="8" y1="19" x2="16" y2="19" strokeDasharray="2 1" />
    <path d="M8 10h8M8 14h5" opacity="0.4" />
  </svg>
);

/** Grabado láser — rayo sobre superficie */
export const GrabadoIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l-2 7h4l-2 7" />
    <rect x="4" y="16" width="16" height="5" rx="1" />
    <path d="M8 18h8" opacity="0.4" />
  </svg>
);

/** QR Code icon */
export const QRIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="3" height="3" />
    <rect x="18" y="18" width="3" height="3" />
    <line x1="14" y1="18" x2="17" y2="18" />
    <rect x="5" y="5" width="3" height="3" fill="currentColor" />
    <rect x="16" y="5" width="3" height="3" fill="currentColor" />
    <rect x="5" y="16" width="3" height="3" fill="currentColor" />
  </svg>
);

// ── Lookup Map ──────────────────────────────────────────────

import { ProductType } from './types';

export const PRODUCT_ICON_MAP: Record<ProductType, React.FC<IconProps>> = {
  'Tabla de picar': TablaIconPicar,
  'Tabla de charcutería': TablaIconCharcuteria,
  'Tabla de decoración': TablaIconDecorativa,
  'Plato decorativo': PlatoIcon,
  'Caja personalizada': CajaIcon,
  'Tote bag': ToteBagIcon,
  'Mandil de cocina': MandilIcon,
  'Servilletas': ServilletaIcon,
  'Funda de cojín': CojinIcon,
  'Servicio de Grabado': GrabadoIcon,
};

export function getProductIcon(type: ProductType): React.FC<IconProps> {
  return PRODUCT_ICON_MAP[type] || TablaIconPicar;
}

// ── Material Icons (for engraving service) ───────────────────

export const MaterialMaderaIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="12" rx="8" ry="10" /><ellipse cx="12" cy="12" rx="5" ry="7" opacity="0.5" /><ellipse cx="12" cy="12" rx="2" ry="3" opacity="0.3" />
  </svg>
);

export const MaterialCueroIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" strokeDasharray="3 2" opacity="0.5" /><path d="M7 5v14" strokeDasharray="2 3" opacity="0.4" /><path d="M17 5v14" strokeDasharray="2 3" opacity="0.4" />
  </svg>
);

export const MaterialMetalIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <ellipse cx="12" cy="5" rx="6" ry="2" /><path d="M6 5v14c0 1.1 2.7 2 6 2s6-.9 6-2V5" /><path d="M6 12c0 1.1 2.7 2 6 2s6-.9 6-2" opacity="0.4" />
  </svg>
);

export const MaterialAcrilicoIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 3l16 18" opacity="0.2" /><path d="M8 3l12 14" opacity="0.15" /><circle cx="12" cy="12" r="3" opacity="0.3" />
  </svg>
);

export const MaterialVidrioIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 3h8l-1 8c0 2-2 3-3 3s-3-1-3-3L8 3z" /><line x1="12" y1="14" x2="12" y2="19" /><line x1="9" y1="19" x2="15" y2="19" /><path d="M9 6h6" opacity="0.3" />
  </svg>
);

export const MaterialOtroIcon: React.FC<IconProps> = ({ className, size = defaults.size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" /><path d="M12 12l8-4.5" opacity="0.4" /><path d="M12 12L4 7.5" opacity="0.4" /><line x1="12" y1="12" x2="12" y2="22" opacity="0.4" />
  </svg>
);

export const MATERIAL_ICON_MAP: Record<string, React.FC<IconProps>> = {
  'Madera': MaterialMaderaIcon,
  'Cuero': MaterialCueroIcon,
  'Metal / Termo': MaterialMetalIcon,
  'Acrílico': MaterialAcrilicoIcon,
  'Vidrio': MaterialVidrioIcon,
  'Otro': MaterialOtroIcon,
};
