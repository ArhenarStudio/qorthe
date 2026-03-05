// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Configuración Centralizada
// Toda la config del cotizador en un solo lugar
// Se carga desde /api/admin/quote-pricing (Supabase)
// Fallback a defaults si no está disponible
// ═══════════════════════════════════════════════════════════════

import { ProductCategory, EngravingComplexity, BoardShape } from './types';

// ── Full Quote Config Structure ─────────────────────────────

export interface QuoteProductOption {
  type: string;
  category: ProductCategory;
  label: string;
  desc: string;
  enabled: boolean;
}

export interface QuoteWoodOption {
  label: string;
  color: string;
  gradient: string;
  description: string;
  priceM2: number;
  enabled: boolean;
}

export interface QuoteTextileColorOption {
  label: string;
  hex: string;
  enabled: boolean;
}

export interface QuoteTechniqueOption {
  label: string;
  price: number;
  enabled: boolean;
}

export interface QuoteEngravingPriceOption {
  complexity: string;
  price: number;
}

export interface QuoteVolumeDiscount {
  min_qty: number;
  percent: number;
}

export interface QuoteBundleConfig {
  id: string;
  name: string;
  desc: string;
  segment: string;
  discountPercent: number;
  enabled: boolean;
  items: {
    category: ProductCategory;
    type: string;
    quantity: number;
    woods?: string[];
    notes?: string;
  }[];
}

export interface QuoteShapeOption {
  value: BoardShape;
  label: string;
  enabled: boolean;
}

export interface QuoteExtraOption {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
  priceExtra: number;
}

export interface QuoteFinishOption {
  label: string;
  enabled: boolean;
}

export interface QuoteEngraveMaterial {
  label: string;
  enabled: boolean;
}

export interface QuoteZoneGroup {
  label: string;
  zones: string[];
}

export interface FullQuoteConfig {
  // Products
  woodProducts: QuoteProductOption[];
  textileProducts: QuoteProductOption[];
  serviceProduct: QuoteProductOption;

  // Materials
  woodOptions: QuoteWoodOption[];
  textileColors: QuoteTextileColorOption[];
  textileTechniques: QuoteTechniqueOption[];
  engraveMaterials: QuoteEngraveMaterial[];

  // Pricing
  engravingPrices: QuoteEngravingPriceOption[];
  engravingZoneExtra: number;
  engravingQrExtra: number;
  textileFullPanelExtra: number;
  woodMinPrice: number;
  woodThicknessStandard: number;
  volumeDiscounts: QuoteVolumeDiscount[];

  // Tier
  tierDiscountEnabled: boolean;

  // Board design
  boardShapes: QuoteShapeOption[];
  boardExtras: QuoteExtraOption[];
  boardFinishes: QuoteFinishOption[];

  // Engraving zones
  zoneGroups: QuoteZoneGroup[];

  // Bundles
  bundles: QuoteBundleConfig[];
}

// ── Defaults ────────────────────────────────────────────────

export const DEFAULT_FULL_CONFIG: FullQuoteConfig = {
  woodProducts: [
    { type: 'Tabla de picar', category: 'madera', label: 'Tabla de Picar', desc: 'Funcional y elegante', enabled: true },
    { type: 'Tabla de charcutería', category: 'madera', label: 'Tabla Charcutería', desc: 'Ideal para presentación', enabled: true },
    { type: 'Tabla de decoración', category: 'madera', label: 'Tabla Decorativa', desc: 'Pieza de exhibición', enabled: true },
    { type: 'Plato decorativo', category: 'madera', label: 'Plato Decorativo', desc: 'Artesanía para tu mesa', enabled: true },
    { type: 'Caja personalizada', category: 'madera', label: 'Caja Personalizada', desc: 'Empaque o regalo premium', enabled: true },
  ],
  textileProducts: [
    { type: 'Tote bag', category: 'textil', label: 'Tote Bag', desc: 'Bolsa de tela personalizada', enabled: true },
    { type: 'Mandil de cocina', category: 'textil', label: 'Mandil de Cocina', desc: 'Chef con tu marca', enabled: true },
    { type: 'Servilletas', category: 'textil', label: 'Servilletas', desc: 'Tela con diseño personalizado', enabled: true },
    { type: 'Funda de cojín', category: 'textil', label: 'Funda de Cojín', desc: 'Decoración sublimada', enabled: true },
  ],
  serviceProduct: { type: 'Servicio de Grabado', category: 'grabado', label: 'Solo Grabado', desc: 'Láser en tu material', enabled: true },

  woodOptions: [
    { label: 'Cedro', color: '#A05A2C', gradient: 'linear-gradient(135deg, #C17840 0%, #8B4513 100%)', description: 'Aromático y rojizo', priceM2: 3500, enabled: true },
    { label: 'Nogal', color: '#4A3728', gradient: 'linear-gradient(135deg, #5C4033 0%, #3B2716 100%)', description: 'Oscuro y elegante', priceM2: 5500, enabled: true },
    { label: 'Encino', color: '#D7C49E', gradient: 'linear-gradient(135deg, #E8D9B8 0%, #B8A67A 100%)', description: 'Claro y resistente', priceM2: 3000, enabled: true },
    { label: 'Parota', color: '#594036', gradient: 'linear-gradient(135deg, #7A5C4F 0%, #3D2B22 100%)', description: 'Exótico y veteado', priceM2: 6000, enabled: true },
    { label: 'Combinación', color: '#8B7355', gradient: 'linear-gradient(135deg, #A05A2C 0%, #4A3728 50%, #594036 100%)', description: 'Fusión personalizada', priceM2: 5000, enabled: true },
  ],

  textileColors: [
    { label: 'Natural', hex: '#F5F0E8', enabled: true },
    { label: 'Negro', hex: '#2D2D2D', enabled: true },
    { label: 'Blanco', hex: '#FAFAFA', enabled: true },
    { label: 'Azul Marino', hex: '#1B3A5C', enabled: true },
    { label: 'Terracota', hex: '#C75B39', enabled: true },
    { label: 'Verde Olivo', hex: '#5C6B3C', enabled: true },
  ],

  textileTechniques: [
    { label: 'Sublimación', price: 80, enabled: true },
    { label: 'Vinilo HTV', price: 60, enabled: true },
    { label: 'Transfer', price: 50, enabled: true },
  ],

  engraveMaterials: [
    { label: 'Madera', enabled: true },
    { label: 'Cuero', enabled: true },
    { label: 'Metal / Termo', enabled: true },
    { label: 'Acrílico', enabled: true },
    { label: 'Vidrio', enabled: true },
    { label: 'Otro', enabled: true },
  ],

  engravingPrices: [
    { complexity: 'Básico', price: 70 },
    { complexity: 'Intermedio', price: 150 },
    { complexity: 'Detallado', price: 250 },
    { complexity: 'Premium', price: 400 },
  ],
  engravingZoneExtra: 50,
  engravingQrExtra: 30,
  textileFullPanelExtra: 40,
  woodMinPrice: 350,
  woodThicknessStandard: 3,

  volumeDiscounts: [
    { min_qty: 5, percent: 5 },
    { min_qty: 10, percent: 10 },
    { min_qty: 20, percent: 15 },
    { min_qty: 50, percent: 20 },
  ],

  tierDiscountEnabled: true,

  boardShapes: [
    { value: 'Rectangular', label: 'Rectangular', enabled: true },
    { value: 'Redonda', label: 'Redonda', enabled: true },
    { value: 'Ovalada', label: 'Ovalada', enabled: true },
    { value: 'Corazón', label: 'Corazón', enabled: true },
    { value: 'Irregular', label: 'Borde natural', enabled: true },
    { value: 'Personalizada', label: 'Forma libre', enabled: true },
  ],

  boardExtras: [
    { key: 'hasJuiceGroove', label: 'Canaleta', desc: 'Surco perimetral para líquidos', enabled: true, priceExtra: 0 },
    { key: 'hasHandleHoles', label: 'Agarres', desc: 'Orificios laterales para manos', enabled: true, priceExtra: 0 },
    { key: 'hasRubberFeet', label: 'Patitas', desc: 'Bases antideslizantes de silicón', enabled: true, priceExtra: 0 },
    { key: 'hasLiveEdge', label: 'Borde vivo', desc: 'Conserva el borde natural de la madera', enabled: true, priceExtra: 0 },
  ],

  boardFinishes: [
    { label: 'Aceite mineral', enabled: true },
    { label: 'Cera de abeja', enabled: true },
    { label: 'Sin acabado', enabled: true },
  ],

  zoneGroups: [
    { label: 'Frontal', zones: ['Centro', 'Esquina', 'Borde superior', 'Frontal completo'] },
    { label: 'Laterales', zones: ['Lateral izquierdo', 'Lateral derecho'] },
    { label: 'Posterior', zones: ['Reverso'] },
    { label: 'Avanzado', zones: ['Multi-zona'] },
  ],

  bundles: [
    {
      id: 'kit-corporativo', name: 'Kit Corporativo', desc: '10 tablas con logo + 10 tote bags',
      segment: 'B2B / Empresas', discountPercent: 15, enabled: true,
      items: [
        { category: 'madera', type: 'Tabla de charcutería', quantity: 10, woods: ['Parota'] },
        { category: 'textil', type: 'Tote bag', quantity: 10 },
      ],
    },
    {
      id: 'kit-boda', name: 'Kit Boda', desc: 'Tabla conmemorativa + 2 mandiles + tote bag',
      segment: 'Novios / Regalos', discountPercent: 10, enabled: true,
      items: [
        { category: 'madera', type: 'Tabla de decoración', quantity: 1, woods: ['Nogal'] },
        { category: 'textil', type: 'Mandil de cocina', quantity: 2 },
        { category: 'textil', type: 'Tote bag', quantity: 1 },
      ],
    },
    {
      id: 'kit-restaurante', name: 'Kit Restaurante', desc: '20 tablas presentación + 20 mandiles + QR',
      segment: 'Restaurantes / Hoteles', discountPercent: 20, enabled: true,
      items: [
        { category: 'madera', type: 'Tabla de charcutería', quantity: 20, woods: ['Parota'] },
        { category: 'textil', type: 'Mandil de cocina', quantity: 20 },
      ],
    },
    {
      id: 'kit-home-chef', name: 'Kit Home Chef', desc: 'Tabla premium + mandil + tote bag',
      segment: 'Foodies / Regalos', discountPercent: 10, enabled: true,
      items: [
        { category: 'madera', type: 'Tabla de picar', quantity: 1, woods: ['Nogal'] },
        { category: 'textil', type: 'Mandil de cocina', quantity: 1 },
        { category: 'textil', type: 'Tote bag', quantity: 1 },
      ],
    },
    {
      id: 'kit-navidad', name: 'Kit Navidad / Evento', desc: '5+ cajas de madera + tote bags',
      segment: 'Temporada / Corporativo', discountPercent: 12, enabled: true,
      items: [
        { category: 'madera', type: 'Caja personalizada', quantity: 5, woods: ['Cedro'] },
        { category: 'textil', type: 'Tote bag', quantity: 5 },
      ],
    },
  ],
};
