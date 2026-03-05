// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Bundle Templates
// Pre-configured packages of madera + textil products
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import type { BundleTemplate, BundleId } from './types';

// ── Bundle SVG Icons ────────────────────────────────────────

interface IconProps { className?: string; size?: number }

export const KitCorporativoIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    <path d="M12 11v4" />
    <path d="M10 13h4" />
  </svg>
);

export const KitBodaIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3C8 3 6 7 6 10c0 4 6 11 6 11s6-7 6-11c0-3-2-7-6-7z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const KitRestauranteIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 11h18" />
    <path d="M5 11V8a7 7 0 0114 0v3" />
    <path d="M4 11v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
    <path d="M8 14v4" />
    <path d="M16 14v4" />
    <path d="M6 18h12" />
  </svg>
);

export const KitHomeChefIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    <path d="M15 3l2-1" />
    <path d="M9 3L7 2" />
  </svg>
);

export const KitNavidadIcon: React.FC<IconProps> = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l3 6H9l3-6z" />
    <path d="M12 8l4 7H8l4-7z" />
    <path d="M12 15l5 7H7l5-7z" />
    <rect x="10" y="22" width="4" height="2" rx="0.5" fill="currentColor" />
  </svg>
);

export const BUNDLE_ICON_MAP: Record<BundleId, React.FC<IconProps>> = {
  'kit-corporativo': KitCorporativoIcon,
  'kit-boda': KitBodaIcon,
  'kit-restaurante': KitRestauranteIcon,
  'kit-home-chef': KitHomeChefIcon,
  'kit-navidad': KitNavidadIcon,
};

// ── Bundle Templates ────────────────────────────────────────

export const BUNDLE_TEMPLATES: BundleTemplate[] = [
  {
    id: 'kit-corporativo',
    name: 'Kit Corporativo',
    desc: '10 tablas con logo + 10 tote bags con marca',
    segment: 'B2B / Empresas',
    discountPercent: 15,
    items: [
      {
        category: 'madera',
        type: 'Tabla de charcutería',
        quantity: 10,
        woods: ['Parota'],
        dimensions: { length: 40, width: 25, thickness: 3 },
        engraving: { enabled: true, type: 'Logotipo', complexity: 'Intermedio', zones: ['Centro'] },
        notes: 'Con logo corporativo grabado',
      },
      {
        category: 'textil',
        type: 'Tote bag',
        quantity: 10,
        textile: { technique: 'Sublimación', color: 'Natural', printZone: 'Frente' },
        notes: 'Con marca/logo de la empresa',
      },
    ],
  },
  {
    id: 'kit-boda',
    name: 'Kit Boda',
    desc: 'Tabla conmemorativa + 2 mandiles + tote bag',
    segment: 'Novios / Regalos',
    discountPercent: 10,
    items: [
      {
        category: 'madera',
        type: 'Tabla de decoración',
        quantity: 1,
        woods: ['Nogal'],
        dimensions: { length: 45, width: 30, thickness: 3 },
        engraving: { enabled: true, type: 'Texto', complexity: 'Detallado', zones: ['Centro'] },
        notes: 'Nombres + fecha de boda',
      },
      {
        category: 'textil',
        type: 'Mandil de cocina',
        quantity: 2,
        textile: { technique: 'Vinilo HTV', color: 'Blanco', printZone: 'Frente' },
        notes: 'Nombres de los novios',
      },
      {
        category: 'textil',
        type: 'Tote bag',
        quantity: 1,
        textile: { technique: 'Sublimación', color: 'Natural', printZone: 'Frente' },
        notes: 'Recuerdo de boda',
      },
    ],
  },
  {
    id: 'kit-restaurante',
    name: 'Kit Restaurante',
    desc: '20 tablas presentación + 20 mandiles + QR menú',
    segment: 'Restaurantes / Hoteles',
    discountPercent: 20,
    items: [
      {
        category: 'madera',
        type: 'Tabla de charcutería',
        quantity: 20,
        woods: ['Cedro'],
        dimensions: { length: 35, width: 20, thickness: 2.5 },
        engraving: { enabled: true, type: 'Logotipo', complexity: 'Básico', zones: ['Esquina'] },
        notes: 'Logo del restaurante',
      },
      {
        category: 'textil',
        type: 'Mandil de cocina',
        quantity: 20,
        textile: { technique: 'Vinilo HTV', color: 'Negro', printZone: 'Frente' },
        notes: 'Logo + nombre del chef',
      },
      {
        category: 'madera',
        type: 'Tabla de picar',
        quantity: 5,
        woods: ['Cedro'],
        dimensions: { length: 20, width: 15, thickness: 2 },
        engraving: { enabled: true, type: 'Código QR', complexity: 'Básico', zones: ['Centro'] },
        notes: 'QR vinculado al menú digital',
      },
    ],
  },
  {
    id: 'kit-home-chef',
    name: 'Kit Home Chef',
    desc: 'Tabla premium + mandil + tote bag',
    segment: 'Foodies / Regalos',
    discountPercent: 10,
    items: [
      {
        category: 'madera',
        type: 'Tabla de picar',
        quantity: 1,
        woods: ['Parota'],
        dimensions: { length: 50, width: 30, thickness: 4 },
        engraving: { enabled: true, type: 'Texto', complexity: 'Básico', zones: ['Esquina'] },
        notes: 'Nombre del chef',
      },
      {
        category: 'textil',
        type: 'Mandil de cocina',
        quantity: 1,
        textile: { technique: 'Sublimación', color: 'Negro', printZone: 'Frente' },
        notes: 'Diseño personalizado',
      },
      {
        category: 'textil',
        type: 'Tote bag',
        quantity: 1,
        textile: { technique: 'Sublimación', color: 'Natural', printZone: 'Frente' },
        notes: 'Temática cocinero',
      },
    ],
  },
  {
    id: 'kit-navidad',
    name: 'Kit Navidad / Evento',
    desc: '5 cajas regalo + tote bags como envoltorio',
    segment: 'Temporada / Corporativo',
    discountPercent: 12,
    items: [
      {
        category: 'madera',
        type: 'Caja personalizada',
        quantity: 5,
        woods: ['Cedro'],
        dimensions: { length: 30, width: 20, thickness: 10 },
        engraving: { enabled: true, type: 'Logotipo', complexity: 'Intermedio', zones: ['Centro'] },
        notes: 'Logo + mensaje navideño',
      },
      {
        category: 'textil',
        type: 'Tote bag',
        quantity: 5,
        textile: { technique: 'Sublimación', color: 'Natural', printZone: 'Frente' },
        notes: 'Diseño navideño como envoltorio',
      },
    ],
  },
];

export function getBundleTemplate(id: BundleId): BundleTemplate | undefined {
  return BUNDLE_TEMPLATES.find((b) => b.id === id);
}
