// ═══════════════════════════════════════════════════════════════
// Products Module — Types & Interfaces (production-ready)
// Self-contained types — NO dependency on adminMockData
// ═══════════════════════════════════════════════════════════════

export type ProductStatus = 'active' | 'draft' | 'outOfStock' | 'archived';
export type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';
export type SortKey = 'price' | 'stock' | 'soldUnits' | 'margin' | 'name' | 'revenue' | 'rating';
export type SortDir = 'asc' | 'desc';
export type ViewMode = 'grid' | 'table';

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  inventory_quantity: number;
  manage_inventory: boolean;
  prices: { amount: number; currency: string }[];
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  sku: string;
  status: ProductStatus;
  thumbnail: string | null;
  category: string;
  price: number;
  compare_price: number | null;
  unit_cost: number;
  stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  stock_level: StockLevel;
  variants_count: number;
  variants: ProductVariant[];
  // Sales & revenue (from movements/orders)
  sold_units_30d: number;
  sold_units_90d: number;
  revenue_30d: number;
  revenue_90d: number;
  // Reviews
  avg_rating: number;
  review_count: number;
  // Quotes
  quote_count: number;
  // Metadata
  material: string;
  weight: number;
  dimensions: string;
  laser_available: boolean;
  is_service: boolean;
  production_days: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  status: ProductStatus | 'all';
  category: string;
  stock: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  laser: 'all' | 'yes' | 'no';
}

export interface ProductStats {
  total_products: number;
  total_variants: number;
  active_count: number;
  draft_count: number;
  low_stock_count: number;
  out_of_stock_count: number;
  inventory_cost: number;
  inventory_retail: number;
  margin_percent: number;
  total_revenue_30d: number;
  total_sold_30d: number;
  avg_rating: number;
}

// ── Status config ──
export const STATUS_CONFIG: Record<ProductStatus, { label: string; cls: string; dot: string }> = {
  active:     { label: 'Activo',     cls: 'bg-[var(--success-subtle)] text-[var(--success)]',  dot: 'bg-green-500' },
  draft:      { label: 'Borrador',   cls: 'bg-[var(--surface2)] text-[var(--text-muted)]',   dot: 'bg-gray-400' },
  outOfStock: { label: 'Agotado',    cls: 'bg-[var(--error-subtle)] text-[var(--error)]',      dot: 'bg-red-500' },
  archived:   { label: 'Archivado',  cls: 'bg-wood-100 text-wood-400',   dot: 'bg-wood-300' },
};

export const STOCK_LEVEL_CONFIG: Record<StockLevel, { label: string; cls: string }> = {
  in_stock:     { label: 'En stock',    cls: 'text-[var(--success)]' },
  low_stock:    { label: 'Stock bajo',  cls: 'text-amber-500' },
  out_of_stock: { label: 'Agotado',     cls: 'text-[var(--error)]' },
};

// ── Formatters ──
export const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const fmtPct = (n: number) => `${Math.round(n)}%`;

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

// ── Computed helpers ──
export function getMargin(p: Product): number {
  return p.price > 0 && p.unit_cost > 0 ? Math.round((p.price - p.unit_cost) / p.price * 100) : 0;
}

export function getStockColor(p: Product): string {
  if (p.stock === 0) return 'text-[var(--error)]';
  if (p.stock <= p.reorder_point) return 'text-amber-500';
  return 'text-[var(--success)]';
}

export function getStockLevel(stock: number, reorderPoint: number): StockLevel {
  if (stock === 0) return 'out_of_stock';
  if (stock <= reorderPoint) return 'low_stock';
  return 'in_stock';
}

export const DEFAULT_FILTERS: ProductFilters = {
  status: 'all',
  category: 'all',
  stock: 'all',
  laser: 'all',
};
