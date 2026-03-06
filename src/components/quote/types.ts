// ═══════════════════════════════════════════════════════════════
// COTIZADOR PRO — Types
// Fase 10: Rediseño completo con línea madera + textil
// ═══════════════════════════════════════════════════════════════

// ── Product Categories ──────────────────────────────────────

export type ProductCategory = 'madera' | 'textil' | 'grabado';

export type WoodProductType =
  | 'Tabla de picar'
  | 'Tabla de charcutería'
  | 'Tabla de decoración'
  | 'Plato decorativo'
  | 'Caja personalizada';

export type TextileProductType =
  | 'Tote bag'
  | 'Mandil de cocina'
  | 'Servilletas'
  | 'Funda de cojín';

export type ServiceProductType = 'Servicio de Grabado';

export type ProductType = WoodProductType | TextileProductType | ServiceProductType;

// ── Bundles ──────────────────────────────────────────────────

export type BundleId =
  | 'kit-corporativo'
  | 'kit-boda'
  | 'kit-restaurante'
  | 'kit-home-chef'
  | 'kit-navidad';

export interface BundleItem {
  category: ProductCategory;
  type: ProductType;
  quantity: number;
  woods?: WoodType[];
  dimensions?: { length: number; width: number; thickness: number };
  textile?: TextileConfig;
  engraving?: Partial<EngravingConfig>;
  notes?: string;
}

export interface BundleTemplate {
  id: BundleId;
  name: string;
  desc: string;
  segment: string;
  items: BundleItem[];
  discountPercent: number;
}

// ── Materials ───────────────────────────────────────────────

export type WoodType =
  | 'Cedro'
  | 'Nogal'
  | 'Encino'
  | 'Parota'
  | 'Combinación';

export type TextileColor =
  | 'Natural'
  | 'Negro'
  | 'Blanco'
  | 'Azul Marino'
  | 'Terracota'
  | 'Verde Olivo';

export type TextileTechnique =
  | 'Sublimación'
  | 'Vinilo HTV'
  | 'Transfer';

// ── Engraving ───────────────────────────────────────────────

export type EngravingType =
  | 'Texto'
  | 'Logotipo'
  | 'Imagen personalizada'
  | 'Código QR'
  | 'Combinación';

export type EngravingComplexity = 'Básico' | 'Intermedio' | 'Detallado' | 'Premium';

export type EngravingZone = 'Centro' | 'Esquina' | 'Borde superior' | 'Reverso' | 'Multi-zona'
  | 'Lateral izquierdo' | 'Lateral derecho' | 'Frontal completo';

export interface ZoneEngravingConfig {
  zone: EngravingZone;
  type: EngravingType;
  complexity: EngravingComplexity;
  customText?: string;
  qrUrl?: string;
  file?: File | null;
  fileName?: string;
  templateId?: string;
  templateName?: string;
}

export interface EngravingConfig {
  enabled: boolean;
  type: EngravingType;
  zones: EngravingZone[];
  customText?: string;
  qrUrl?: string;
  complexity: EngravingComplexity;
  file?: File | null;
  fileName?: string;
  templateId?: string;
  templateName?: string;
  /** Per-zone config (optional, for advanced multi-zone) */
  zoneConfigs?: ZoneEngravingConfig[];
}

// ── Textile Customization ───────────────────────────────────

// ── Board Design (wood customization) ────────────────────────

export type BoardShape = 'Rectangular' | 'Redonda' | 'Ovalada' | 'Corazón' | 'Irregular' | 'Personalizada';

export interface BoardDesign {
  shape: string;
  customShapeNotes?: string;
  hasJuiceGroove: boolean;
  hasHandleHoles: boolean;
  hasRubberFeet: boolean;
  hasLiveEdge: boolean;
  finishType: 'Aceite mineral' | 'Cera de abeja' | 'Sin acabado';
  notes?: string;
}

export const DEFAULT_BOARD_DESIGN: BoardDesign = {
  shape: 'Rectangular',
  hasJuiceGroove: false,
  hasHandleHoles: false,
  hasRubberFeet: false,
  hasLiveEdge: false,
  finishType: 'Aceite mineral',
};

// ── Textile Customization ────────────────────────────────────

export interface TextileConfig {
  technique: TextileTechnique;
  color: TextileColor;
  printZone: string;
  customText?: string;
  file?: File | null;
  fileName?: string;
  templateId?: string;
  templateName?: string;
}

// ── Product Item ────────────────────────────────────────────

export interface ProductItem {
  id: string;
  category: ProductCategory;
  type: ProductType;
  // Wood fields
  woods: WoodType[];
  primaryWood?: WoodType;
  secondaryWood?: WoodType;
  dimensions: {
    length: number;
    width: number;
    thickness: number;
  };
  // Board design (wood only)
  boardDesign?: BoardDesign;
  // Textile fields
  textile?: TextileConfig;
  // Engraving service fields
  materialToEngrave?: string;
  // Shared
  quantity: number;
  engraving: EngravingConfig;
  notes?: string;
}

// ── Customer ────────────────────────────────────────────────

export interface CustomerDetails {
  name: string;
  company?: string;
  phone: string;
  email: string;
  notes?: string;
}

// ── Wizard Step Definition ──────────────────────────────────

export interface WizardStep {
  id: string;
  label: string;
  title: string;
  subtitle: string;
}

// ── Quote Submission ────────────────────────────────────────

export interface QuoteSubmission {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_name: string;
  pieces: QuotePiece[];
  subtotal: number;
  total: number;
  timeline: string;
  notes?: string;
}

export interface QuotePiece {
  type: ProductType;
  category: ProductCategory;
  material: string;
  dimensions?: string;
  quantity: number;
  engraving?: {
    type: EngravingType;
    complexity: EngravingComplexity;
    zones: string[];
    text?: string;
    hasFile: boolean;
  };
  textile?: {
    technique: TextileTechnique;
    color: TextileColor;
    printZone: string;
    hasFile: boolean;
  };
  unitPrice: number;
  lineTotal: number;
  notes?: string;
}

// ── Defaults ────────────────────────────────────────────────

export const DEFAULT_ENGRAVING: EngravingConfig = {
  enabled: false,
  type: 'Texto',
  zones: ['Centro'],
  complexity: 'Básico',
};

export const DEFAULT_TEXTILE: TextileConfig = {
  technique: 'Sublimación',
  color: 'Natural',
  printZone: 'Frente',
};

export const DEFAULT_PRODUCT: ProductItem = {
  id: '',
  category: 'madera',
  type: 'Tabla de picar',
  woods: [],
  dimensions: { length: 40, width: 25, thickness: 3 },
  quantity: 1,
  engraving: { ...DEFAULT_ENGRAVING },
};
