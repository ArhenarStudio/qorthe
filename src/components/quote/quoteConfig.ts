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

export interface QuoteDesignTemplate {
  id: string;
  name: string;
  category: string;
  desc: string;
  svgCode: string;
  defaultText?: string;
  tags: string[];
  applicableTo: ('madera' | 'textil' | 'grabado')[];
  enabled: boolean;
}

export interface QuoteDesignCategory {
  id: string;
  label: string;
  enabled: boolean;
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

  // Design Gallery
  designCategories: QuoteDesignCategory[];
  designTemplates: QuoteDesignTemplate[];
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

  designCategories: [
    { id: 'monograma', label: 'Monogramas', enabled: true },
    { id: 'frase', label: 'Frases', enabled: true },
    { id: 'patron', label: 'Patrones', enabled: true },
    { id: 'logo-estilo', label: 'Logos', enabled: true },
    { id: 'ocasion', label: 'Ocasiones', enabled: true },
    { id: 'corporativo', label: 'Corporativo', enabled: true },
  ],

  designTemplates: [
    { id: 'mono-circle', name: 'Monograma Círculo', category: 'monograma', desc: 'Iniciales en marco circular clásico', svgCode: '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/><text x="40" y="48" text-anchor="middle" fill="currentColor" font-size="24" font-family="serif" font-weight="bold">AB</text></svg>', defaultText: 'AB', tags: ['iniciales', 'elegante'], applicableTo: ['madera', 'textil', 'grabado'], enabled: true },
    { id: 'mono-diamond', name: 'Monograma Diamante', category: 'monograma', desc: 'Inicial en marco rombo', svgCode: '<svg viewBox="0 0 80 80"><rect x="16" y="16" width="48" height="48" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(45 40 40)"/><text x="40" y="47" text-anchor="middle" fill="currentColor" font-size="20" font-family="serif" font-style="italic">M</text></svg>', defaultText: 'M', tags: ['inicial', 'moderno'], applicableTo: ['madera', 'textil', 'grabado'], enabled: true },
    { id: 'mono-laurel', name: 'Monograma Laurel', category: 'monograma', desc: 'Iniciales con hojas de laurel', svgCode: '<svg viewBox="0 0 80 80"><path d="M20 60 Q15 40 25 25 Q30 35 25 50" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/><path d="M60 60 Q65 40 55 25 Q50 35 55 50" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/><text x="40" y="48" text-anchor="middle" fill="currentColor" font-size="18" font-family="serif" font-weight="bold">JR</text><line x1="28" y1="55" x2="52" y2="55" stroke="currentColor" stroke-width="0.8" opacity="0.5"/></svg>', defaultText: 'JR', tags: ['iniciales', 'premium'], applicableTo: ['madera', 'grabado'], enabled: true },
    { id: 'frase-appetit', name: 'Bon Appétit', category: 'frase', desc: 'Frase clásica de cocina', svgCode: '<svg viewBox="0 0 80 80"><text x="40" y="35" text-anchor="middle" fill="currentColor" font-size="10" font-family="serif" font-style="italic">Bon</text><text x="40" y="52" text-anchor="middle" fill="currentColor" font-size="13" font-family="serif" font-weight="bold">Appétit</text><line x1="15" y1="60" x2="65" y2="60" stroke="currentColor" stroke-width="0.5" opacity="0.4"/></svg>', defaultText: 'Bon Appétit', tags: ['cocina', 'elegante'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'frase-homemade', name: 'Hecho en Casa', category: 'frase', desc: 'Para cocinas con amor', svgCode: '<svg viewBox="0 0 80 80"><text x="40" y="30" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" letter-spacing="3">HECHO EN</text><text x="40" y="48" text-anchor="middle" fill="currentColor" font-size="14" font-family="serif" font-weight="bold">Casa</text><text x="40" y="62" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" letter-spacing="2">CON AMOR</text></svg>', defaultText: 'Hecho en Casa con Amor', tags: ['hogar', 'artesanal'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'frase-fecha', name: 'Fecha Conmemorativa', category: 'frase', desc: 'Año y nombre de familia', svgCode: '<svg viewBox="0 0 80 80"><text x="40" y="28" text-anchor="middle" fill="currentColor" font-size="8" font-family="sans-serif" letter-spacing="2">EST.</text><text x="40" y="48" text-anchor="middle" fill="currentColor" font-size="18" font-family="serif" font-weight="bold">2024</text><line x1="18" y1="55" x2="62" y2="55" stroke="currentColor" stroke-width="0.8"/><text x="40" y="66" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" letter-spacing="1">FAMILIA</text></svg>', defaultText: '2024', tags: ['fecha', 'aniversario'], applicableTo: ['madera', 'grabado'], enabled: true },
    { id: 'patron-geo', name: 'Geométrico', category: 'patron', desc: 'Patrón de cuadros rotados', svgCode: '<svg viewBox="0 0 80 80"><rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.3"/><rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5" transform="rotate(15 40 40)"/><rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.7" transform="rotate(30 40 40)"/><rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.9" transform="rotate(45 40 40)"/></svg>', tags: ['abstracto', 'moderno'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'patron-ondas', name: 'Ondas', category: 'patron', desc: 'Patrón orgánico de ondas', svgCode: '<svg viewBox="0 0 80 80"><path d="M10 20 Q25 12 40 20 Q55 28 70 20" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><path d="M10 35 Q25 27 40 35 Q55 43 70 35" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><path d="M10 50 Q25 42 40 50 Q55 58 70 50" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/><path d="M10 65 Q25 57 40 65 Q55 73 70 65" fill="none" stroke="currentColor" stroke-width="1" opacity="0.5"/></svg>', tags: ['orgánico', 'fluido'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'logo-minimal', name: 'Logo Minimalista', category: 'logo-estilo', desc: 'Iniciales en rectángulo redondeado', svgCode: '<svg viewBox="0 0 80 80"><rect x="20" y="20" width="40" height="40" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="40" y="46" text-anchor="middle" fill="currentColor" font-size="16" font-family="sans-serif" font-weight="bold">DS</text></svg>', defaultText: 'DS', tags: ['marca', 'moderno'], applicableTo: ['madera', 'textil', 'grabado'], enabled: true },
    { id: 'logo-sello', name: 'Sello Artesanal', category: 'logo-estilo', desc: 'Estilo sello circular con texto', svgCode: '<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="40" cy="40" r="24" fill="none" stroke="currentColor" stroke-width="0.5"/><text x="40" y="36" text-anchor="middle" fill="currentColor" font-size="6" font-family="sans-serif" letter-spacing="3">ARTESANAL</text><line x1="20" y1="40" x2="60" y2="40" stroke="currentColor" stroke-width="0.5"/><text x="40" y="52" text-anchor="middle" fill="currentColor" font-size="10" font-family="serif" font-weight="bold">MARCA</text></svg>', defaultText: 'MARCA', tags: ['sello', 'vintage'], applicableTo: ['madera', 'textil', 'grabado'], enabled: true },
    { id: 'ocasion-boda', name: 'Boda / Pareja', category: 'ocasion', desc: 'Nombres de pareja con fecha', svgCode: '<svg viewBox="0 0 80 80"><text x="40" y="25" text-anchor="middle" fill="currentColor" font-size="10" font-family="serif" font-style="italic">Ana</text><text x="40" y="42" text-anchor="middle" fill="currentColor" font-size="16" font-family="serif">&amp;</text><text x="40" y="58" text-anchor="middle" fill="currentColor" font-size="10" font-family="serif" font-style="italic">Carlos</text><text x="40" y="72" text-anchor="middle" fill="currentColor" font-size="6" font-family="sans-serif" letter-spacing="1">15.06.2024</text></svg>', defaultText: 'Ana & Carlos', tags: ['boda', 'pareja'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'ocasion-navidad', name: 'Navidad / Estrella', category: 'ocasion', desc: 'Estrella navideña', svgCode: '<svg viewBox="0 0 80 80"><polygon points="40,15 50,40 65,40 53,52 57,70 40,60 23,70 27,52 15,40 30,40" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6"/><text x="40" y="78" text-anchor="middle" fill="currentColor" font-size="7" font-family="serif" letter-spacing="1">NAVIDAD</text></svg>', tags: ['navidad', 'estrella'], applicableTo: ['madera', 'textil'], enabled: true },
    { id: 'corp-qr', name: 'Código QR Menú', category: 'corporativo', desc: 'QR para restaurantes', svgCode: '<svg viewBox="0 0 80 80"><rect x="22" y="15" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="42" y="15" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="22" y="35" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="42" y="35" width="8" height="8" fill="currentColor" opacity="0.3"/><rect x="52" y="45" width="8" height="8" fill="currentColor" opacity="0.3"/><text x="40" y="70" text-anchor="middle" fill="currentColor" font-size="7" font-family="sans-serif" letter-spacing="1">MENÚ QR</text></svg>', tags: ['qr', 'restaurante'], applicableTo: ['madera', 'grabado'], enabled: true },
  ],
};
