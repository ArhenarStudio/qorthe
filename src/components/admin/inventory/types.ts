// ═══════════════════════════════════════════════════════════════
// Inventory Module — Types & Interfaces
// SaaS-ready: all types support multi-tenant via tenant_id
// Updated: 2026-03-06 — Added transfers, cyclic counts, valuation, ABC
// ═══════════════════════════════════════════════════════════════

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
export type MovementType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer' | 'damage' | 'production' | 'count_adjustment' | 'reservation';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring' | 'slow_moving' | 'count_discrepancy';
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';
export type CountStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ABCCategory = 'A' | 'B' | 'C';
export type ValuationMethod = 'weighted_average' | 'fifo' | 'lifo';

export interface InventoryItem {
  id: string;
  product_id: string;
  variant_id: string;
  title: string;
  variant_title: string;
  sku: string;
  thumbnail: string | null;
  category: string | null;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  reorder_qty: number;
  max_stock: number;
  unit_cost: number;
  unit_price: number;
  location: string;
  status: StockStatus;
  manage_inventory: boolean;
  last_movement_at: string | null;
  created_at: string;
  // Extended fields
  abc_category?: ABCCategory;
  days_of_inventory?: number;
  turnover_rate?: number;
  total_sold_30d?: number;
  total_sold_90d?: number;
  avg_daily_sales?: number;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  product_title: string;
  sku: string;
  type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  unit_cost: number | null;
  reference: string;
  notes: string;
  created_by: string;
  created_at: string;
  // Transfer-related
  from_location?: string;
  to_location?: string;
  transfer_id?: string;
}

export interface InventoryAlert {
  id: string;
  inventory_item_id: string;
  product_title: string;
  sku: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface InventoryConfig {
  low_stock_threshold: number;
  overstock_multiplier: number;
  auto_reorder_enabled: boolean;
  default_reorder_qty: number;
  track_cost_changes: boolean;
  movement_requires_notes: boolean;
  locations: string[];
  alert_email_enabled: boolean;
  alert_email: string;
  valuation_method: ValuationMethod;
  cyclic_count_frequency_days: number;
  enable_sound_alerts: boolean;
  auto_reserve_on_quote: boolean;
  reserve_expiry_hours: number;
}

export interface InventoryStats {
  total_items: number;
  total_units: number;
  total_cost_value: number;
  total_retail_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  overstock_count: number;
  unresolved_alerts: number;
  movements_today: number;
  avg_turnover_days: number;
  margin_percent: number;
  pending_transfers: number;
  pending_counts: number;
}

// ── Transfer ──────────────────────────────────────────────

export interface StockTransfer {
  id: string;
  transfer_number: string;  // TRF-YYYY-NNN
  from_location: string;
  to_location: string;
  status: TransferStatus;
  items: TransferItem[];
  notes: string;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  shipped_at: string | null;
}

export interface TransferItem {
  variant_id: string;
  product_title: string;
  sku: string;
  quantity: number;
  received_quantity?: number;
}

// ── Cyclic Count ──────────────────────────────────────────

export interface CyclicCount {
  id: string;
  count_number: string;  // CNT-YYYY-NNN
  status: CountStatus;
  location: string;
  scheduled_date: string;
  started_at: string | null;
  completed_at: string | null;
  items: CountItem[];
  total_items: number;
  counted_items: number;
  discrepancies: number;
  notes: string;
  created_by: string;
  created_at: string;
}

export interface CountItem {
  variant_id: string;
  product_title: string;
  sku: string;
  system_stock: number;
  counted_stock: number | null;
  discrepancy: number | null;
  adjusted: boolean;
  notes: string;
}

// ── Valuation / Cost History ──────────────────────────────

export interface CostHistoryEntry {
  id: string;
  variant_id: string;
  sku: string;
  product_title: string;
  previous_cost: number;
  new_cost: number;
  change_percent: number;
  reason: string;
  movement_id: string | null;
  created_at: string;
}

export interface ValuationSummary {
  total_cost_value: number;
  total_retail_value: number;
  total_margin: number;
  margin_percent: number;
  by_category: { category: string; cost: number; retail: number; units: number }[];
  by_location: { location: string; cost: number; retail: number; units: number }[];
}

// ── ABC / Rotation Report ─────────────────────────────────

export interface ABCReport {
  items: ABCItem[];
  summary: {
    a_count: number;
    a_revenue_pct: number;
    b_count: number;
    b_revenue_pct: number;
    c_count: number;
    c_revenue_pct: number;
  };
}

export interface ABCItem {
  variant_id: string;
  product_title: string;
  sku: string;
  category: ABCCategory;
  total_sold_90d: number;
  revenue_90d: number;
  revenue_pct: number;
  cumulative_pct: number;
  days_of_inventory: number;
  avg_daily_sales: number;
  is_stagnant: boolean;
}

// ── Movement period chart ─────────────────────────────────

export interface MovementsByPeriod {
  date: string;
  purchases: number;
  sales: number;
  adjustments: number;
  transfers: number;
  net: number;
}

export interface TurnoverByCategory {
  category: string;
  avg_turnover_days: number;
  total_units: number;
  total_value: number;
}

// ── Status helpers ──────────────────────────────────────

export const STOCK_STATUS_CONFIG: Record<StockStatus, { label: string; cls: string; dot: string }> = {
  in_stock:     { label: 'En stock',     cls: 'bg-green-50 text-green-600',  dot: 'bg-green-500' },
  low_stock:    { label: 'Stock bajo',   cls: 'bg-amber-50 text-amber-600',  dot: 'bg-amber-500' },
  out_of_stock: { label: 'Agotado',      cls: 'bg-red-50 text-red-500',      dot: 'bg-red-500' },
  overstock:    { label: 'Sobrestock',   cls: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-500' },
};

export const MOVEMENT_TYPE_CONFIG: Record<MovementType, { label: string; icon: string; color: string }> = {
  purchase:         { label: 'Compra',          icon: '📦', color: 'text-green-600' },
  sale:             { label: 'Venta',           icon: '🛒', color: 'text-blue-600' },
  adjustment:       { label: 'Ajuste',          icon: '⚙️', color: 'text-amber-600' },
  return:           { label: 'Devolución',      icon: '↩️', color: 'text-purple-600' },
  transfer:         { label: 'Transferencia',   icon: '🔄', color: 'text-indigo-600' },
  damage:           { label: 'Daño/Merma',      icon: '⚠️', color: 'text-red-600' },
  production:       { label: 'Producción',      icon: '🔨', color: 'text-wood-600' },
  count_adjustment: { label: 'Ajuste conteo',   icon: '📋', color: 'text-teal-600' },
  reservation:      { label: 'Reserva',         icon: '🔒', color: 'text-orange-600' },
};

export const TRANSFER_STATUS_CONFIG: Record<TransferStatus, { label: string; cls: string }> = {
  pending:    { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-600' },
  in_transit: { label: 'En tránsito', cls: 'bg-blue-50 text-blue-600' },
  completed:  { label: 'Completada',  cls: 'bg-green-50 text-green-600' },
  cancelled:  { label: 'Cancelada',   cls: 'bg-red-50 text-red-500' },
};

export const COUNT_STATUS_CONFIG: Record<CountStatus, { label: string; cls: string }> = {
  scheduled:    { label: 'Programado',   cls: 'bg-blue-50 text-blue-600' },
  in_progress:  { label: 'En progreso',  cls: 'bg-amber-50 text-amber-600' },
  completed:    { label: 'Completado',   cls: 'bg-green-50 text-green-600' },
  cancelled:    { label: 'Cancelado',    cls: 'bg-red-50 text-red-500' },
};

export const ABC_CONFIG: Record<ABCCategory, { label: string; cls: string; description: string }> = {
  A: { label: 'A — Alto valor',  cls: 'bg-green-50 text-green-700 border-green-200', description: '~20% productos, ~80% ingreso' },
  B: { label: 'B — Valor medio', cls: 'bg-amber-50 text-amber-700 border-amber-200', description: '~30% productos, ~15% ingreso' },
  C: { label: 'C — Bajo valor',  cls: 'bg-red-50 text-red-600 border-red-200',       description: '~50% productos, ~5% ingreso' },
};

export const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d: string) =>
  new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fmtPct = (n: number) => `${Math.round(n * 10) / 10}%`;

export const DEFAULT_INVENTORY_CONFIG: InventoryConfig = {
  low_stock_threshold: 5,
  overstock_multiplier: 3,
  auto_reorder_enabled: false,
  default_reorder_qty: 10,
  track_cost_changes: true,
  movement_requires_notes: false,
  locations: ['Taller Hermosillo', 'Almacén Principal'],
  alert_email_enabled: true,
  alert_email: 'designdavidsons@gmail.com',
  valuation_method: 'weighted_average',
  cyclic_count_frequency_days: 30,
  enable_sound_alerts: false,
  auto_reserve_on_quote: true,
  reserve_expiry_hours: 72,
};
