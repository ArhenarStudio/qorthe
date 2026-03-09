"use client";

// ═══════════════════════════════════════════════════════════════
// ProductsPage — Production-ready product management
//
// Features:
//   - Live data from Medusa + Supabase enrichment
//   - Grid/Table views with search, filters, sort
//   - KPIs: revenue, margin, stock, reviews
//   - Context menu: edit, duplicate, view in store, delete
//   - Bulk actions: status change, export
//   - Integration: inventory module, reviews, quotes
//   - Zero mock data, zero emojis, typed formatters
// ═══════════════════════════════════════════════════════════════

import { useTheme } from '@/src/theme/ThemeContext';
import { Card as TCard, Badge as TBadge, Button as TButton, StatCard as TStatCard } from '@/src/theme/primitives';
import { Card, Badge, Button, StatCard } from '@/src/theme/primitives';
import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Grid3X3, List, Plus, Filter, MoreVertical,
  Package, AlertTriangle, ChevronDown, Pencil, Trash2, Eye,
  Download, Upload, Star, Copy, Archive, ExternalLink,
  X, ArrowUpDown, TrendingUp, DollarSign, ShoppingBag, Check,
  Zap, RefreshCw, Loader2, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/useAdminData";
import {
  Product, ProductStats, ProductFilters, ProductStatus,
  SortKey, SortDir, ViewMode,
  STATUS_CONFIG, fmt, fmtPct, getMargin, getStockColor, DEFAULT_FILTERS,
} from "./products/types";

// ═══════ MAIN COMPONENT ═══════
export const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Live data ──
  const { data, loading, refetch } = useAdminData<{
    products: Product[];
    stats: ProductStats;
    count: number;
  }>("/api/admin/products?limit=100", { refreshInterval: 60_000 });

  const products = data?.products || [];
  const stats = data?.stats || null;

  // ── Derived ──
  const categories = useMemo(() =>
    [...new Set(products.map(p => p.category))].sort(),
  [products]);

  const filtered = useMemo(() => {
    let list = products;

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.status !== "all") list = list.filter(p => p.status === filters.status);
    if (filters.category !== "all") list = list.filter(p => p.category === filters.category);
    if (filters.stock !== "all") list = list.filter(p => p.stock_level === filters.stock);
    if (filters.laser !== "all") list = list.filter(p =>
      filters.laser === "yes" ? p.laser_available : !p.laser_available
    );

    // Sort
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "price": cmp = a.price - b.price; break;
        case "stock": cmp = a.stock - b.stock; break;
        case "soldUnits": cmp = a.sold_units_30d - b.sold_units_30d; break;
        case "revenue": cmp = a.revenue_30d - b.revenue_30d; break;
        case "margin": cmp = getMargin(a) - getMargin(b); break;
        case "rating": cmp = a.avg_rating - b.avg_rating; break;
        default: cmp = a.title.localeCompare(b.title);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [products, search, filters, sortKey, sortDir]);

  const activeFilterCount = Object.entries(filters).filter(([, v]) => v !== "all").length;

  // ── Handlers ──
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id))
    );
  };

  const handleAction = useCallback(async (action: string, productId: string) => {
    setContextMenuId(null);
    setActionLoading(productId);
    try {
      if (action === "view") {
        const p = products.find(p => p.id === productId);
        if (p?.handle) window.open(`/shop/${p.handle}`, "_blank");
        return;
      }

      if (action === "duplicate") {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "duplicate", product_id: productId }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Producto duplicado"); refetch(); }
        else toast.error(data.error || "Error al duplicar");
        return;
      }

      if (action === "activate" || action === "draft") {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update_status",
            product_id: productId,
            status: action === "activate" ? "active" : "draft",
          }),
        });
        const data = await res.json();
        if (data.success) { toast.success(`Estado cambiado a ${action === "activate" ? "activo" : "borrador"}`); refetch(); }
        else toast.error(data.error || "Error");
        return;
      }

      if (action === "delete") {
        const res = await fetch(`/api/admin/products?id=${productId}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) { toast.success("Producto eliminado"); refetch(); }
        else toast.error(data.error || "Error al eliminar");
        return;
      }
    } catch { toast.error("Error de conexión"); }
    finally { setActionLoading(null); }
  }, [products, refetch]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.size === 0) return;
    setActionLoading("bulk");
    try {
      if (action === "activate" || action === "draft") {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "bulk_status",
            product_ids: [...selectedIds],
            status: action === "activate" ? "active" : "draft",
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`${data.updated} productos actualizados`);
          setSelectedIds(new Set());
          refetch();
        }
      }
      if (action === "export") {
        const selected = products.filter(p => selectedIds.has(p.id));
        const csv = [
          "SKU,Producto,Categoría,Precio,Costo,Stock,Vendidos 30d,Rating,Estado",
          ...selected.map(p => `${p.sku},"${p.title}",${p.category},${p.price},${p.unit_cost},${p.stock},${p.sold_units_30d},${p.avg_rating},${p.status}`)
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `productos-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        URL.revokeObjectURL(url);
        toast.success(`${selected.length} productos exportados`);
      }
    } catch { toast.error("Error"); }
    finally { setActionLoading(null); }
  }, [selectedIds, products, refetch]);

  const exportAll = () => {
    const csv = [
      "SKU,Producto,Categoría,Precio,Costo,Stock,Reservado,Vendidos 30d,Revenue 30d,Rating,Reviews,Estado",
      ...products.map(p => `${p.sku},"${p.title}",${p.category},${p.price},${p.unit_cost},${p.stock},${p.reserved_stock},${p.sold_units_30d},${p.revenue_30d},${p.avg_rating},${p.review_count},${p.status}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `productos-completo-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  // ═══════ RENDER ═══════
  return (
    <div className="space-y-4" onClick={() => setContextMenuId(null)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-[var(--admin-text)] flex items-center gap-2">
          <ShoppingBag size={18} className="text-[var(--admin-accent)]" /> Productos
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] text-xs rounded-lg hover:bg-[var(--admin-surface2)]">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={exportAll} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] text-xs rounded-lg hover:bg-[var(--admin-surface2)]">
            <Download size={13} /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard icon={<ShoppingBag size={14} />} iconCls="text-[var(--admin-accent)] bg-[var(--admin-accent)]/10"
            value={String(stats.total_products)} label="Productos"
            sub={`${stats.total_variants} variantes · ${stats.active_count} activos`} />
          <KpiCard icon={<DollarSign size={14} />} iconCls="text-green-600 bg-green-50"
            value={fmt(stats.inventory_retail)} label="Valor inventario"
            sub={`Costo: ${fmt(stats.inventory_cost)} · Margen: ${fmtPct(stats.margin_percent)}`} />
          <KpiCard icon={<TrendingUp size={14} />} iconCls="text-blue-600 bg-blue-50"
            value={fmt(stats.total_revenue_30d)} label="Revenue 30d"
            sub={`${stats.total_sold_30d} unidades vendidas`} />
          <KpiCard icon={<AlertTriangle size={14} />} iconCls={stats.out_of_stock_count > 0 ? "text-red-500 bg-red-50" : "text-amber-500 bg-amber-50"}
            value={String(stats.low_stock_count + stats.out_of_stock_count)} label="Alertas stock"
            sub={`${stats.low_stock_count} bajo · ${stats.out_of_stock_count} agotados`} />
          <KpiCard icon={<Star size={14} />} iconCls="text-[var(--admin-accent)] bg-[var(--admin-accent)]/10"
            value={stats.avg_rating > 0 ? String(stats.avg_rating) : "—"} label="Rating promedio"
            sub={`${products.reduce((s, p) => s + p.review_count, 0)} reviews totales`} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
            <Search size={16} className="ml-3 text-[var(--admin-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, SKU, categoría..."
              className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-[var(--admin-text)] placeholder:text-[var(--admin-muted)]" />
            {search && <button onClick={() => setSearch("")} className="mr-2 text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]"><X size={14} /></button>}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2.5 transition-colors ${viewMode === "grid" ? "bg-wood-900 text-sand-100" : "text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]"}`}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode("table")} className={`p-2.5 transition-colors ${viewMode === "table" ? "bg-wood-900 text-sand-100" : "text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]"}`}>
                <List size={14} />
              </button>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] border border-[var(--admin-accent)]/30"
                  : "bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-wood-300"
              }`}>
              <Filter size={13} /> Filtros
              {activeFilterCount > 0 && (
                <span className="bg-[var(--admin-accent)] text-white text-[9px] px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-[var(--admin-muted)]">Filtros:</span>
            {Object.entries(filters).map(([key, val]) => val !== "all" ? (
              <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)] text-[11px] rounded-full">
                {val}
                <button onClick={() => setFilters(f => ({ ...f, [key]: "all" }))} className="hover:text-red-500"><X size={10} /></button>
              </span>
            ) : null)}
            <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-[10px] text-[var(--admin-muted)] hover:text-red-500 underline">Limpiar</button>
          </div>
        )}

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <FilterSelect label="Estado" value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v as ProductStatus | "all" }))}
                  options={[["all", "Todos"], ["active", "Activo"], ["draft", "Borrador"], ["outOfStock", "Agotado"]]} />
                <FilterSelect label="Categoría" value={filters.category} onChange={v => setFilters(f => ({ ...f, category: v }))}
                  options={[["all", "Todas"], ...categories.map(c => [c, c] as [string, string])]} />
                <FilterSelect label="Stock" value={filters.stock} onChange={v => setFilters(f => ({ ...f, stock: v as ProductFilters["stock"] }))}
                  options={[["all", "Todos"], ["in_stock", "En stock"], ["low_stock", "Stock bajo"], ["out_of_stock", "Agotado"]]} />
                <FilterSelect label="Grabado" value={filters.laser} onChange={v => setFilters(f => ({ ...f, laser: v as ProductFilters["laser"] }))}
                  options={[["all", "Todos"], ["yes", "Con grabado"], ["no", "Sin grabado"]]} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-[var(--admin-accent)]/5 border border-[var(--admin-accent)]/20 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
              <span className="text-xs text-[var(--admin-accent)] font-bold">{selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleBulkAction("activate")} disabled={actionLoading === "bulk"}
                  className="px-3 py-1.5 text-[11px] bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-bold">Activar</button>
                <button onClick={() => handleBulkAction("draft")} disabled={actionLoading === "bulk"}
                  className="px-3 py-1.5 text-[11px] rounded-lg font-bold" style={{ backgroundColor: 'var(--admin-surface2)', color: 'var(--admin-text-secondary)' }}>Borrador</button>
                <button onClick={() => handleBulkAction("export")} disabled={actionLoading === "bulk"}
                  className="px-3 py-1.5 text-[11px] bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold">Exportar CSV</button>
              </div>
              <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[10px] text-[var(--admin-muted)] hover:text-red-500">Deseleccionar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {loading && products.length === 0 ? (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--admin-muted)] mb-3" />
          <p className="text-xs text-[var(--admin-muted)]">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-12 text-center">
          <Package size={32} className="text-[var(--admin-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--admin-text-secondary)]">Sin productos encontrados</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product}
              onAction={handleAction} contextMenuId={contextMenuId}
              onContextMenu={setContextMenuId} actionLoading={actionLoading} />
          ))}
        </div>
      ) : (
        <ProductTable products={filtered} sortKey={sortKey} sortDir={sortDir}
          onSort={toggleSort} selectedIds={selectedIds} onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll} onAction={handleAction}
          contextMenuId={contextMenuId} onContextMenu={setContextMenuId}
          actionLoading={actionLoading} />
      )}

      {/* Footer */}
      <div className="text-[10px] text-[var(--admin-muted)] pt-1">
        Mostrando {filtered.length} de {products.length} productos
      </div>
    </div>
  );
};

// ═══════ KPI CARD ═══════
const KpiCard: React.FC<{
  icon: React.ReactNode; iconCls: string; value: string; label: string; sub: string;
}> = ({ icon, iconCls, value, label, sub }) => (
  <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-4">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls} mb-2`}>{icon}</div>
    <p className="text-lg font-sans text-[var(--admin-text)]">{value}</p>
    <p className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider mt-0.5">{label}</p>
    <p className="text-[10px] text-[var(--admin-text-secondary)] mt-1">{sub}</p>
  </div>
);

// ═══════ FILTER SELECT ═══════
const FilterSelect: React.FC<{
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider mb-1.5 block">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 text-xs border border-[var(--admin-border)] rounded-lg bg-[var(--admin-surface)] text-[var(--admin-text)] outline-none">
      {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
    </select>
  </div>
);

// ═══════ PRODUCT CARD (Grid) ═══════
const ProductCard: React.FC<{
  product: Product;
  onAction: (action: string, id: string) => void;
  contextMenuId: string | null;
  onContextMenu: (id: string | null) => void;
  actionLoading: string | null;
}> = ({ product: p, onAction, contextMenuId, onContextMenu, actionLoading }) => {
  const statusCfg = STATUS_CONFIG[p.status];
  const margin = getMargin(p);
  const stockCls = getStockColor(p);
  const isLoading = actionLoading === p.id;

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden group hover:shadow-md transition-shadow relative">
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--admin-surface)]/70 flex items-center justify-center z-20">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--admin-accent)]" />
        </div>
      )}
      {/* Image */}
      <div className="relative aspect-square bg-[var(--admin-surface2)]">
        {p.thumbnail ? (
          <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package size={32} className="text-[var(--admin-muted)]" /></div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
          </span>
        </div>
        {p.stock_level === "low_stock" && (
          <div className="absolute top-2 right-2">
            <span className="bg-amber-50 text-amber-600 text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <AlertTriangle size={9} /> Bajo
            </span>
          </div>
        )}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-medium uppercase bg-red-500/80 px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-wood-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={() => onAction("view", p.id)} className="p-2 bg-[var(--admin-surface)] rounded-lg text-[var(--admin-text)] hover:bg-[var(--admin-surface2)]"><Eye size={16} /></button>
          <button onClick={() => onAction("duplicate", p.id)} className="p-2 bg-[var(--admin-surface)] rounded-lg text-[var(--admin-text)] hover:bg-[var(--admin-surface2)]"><Copy size={16} /></button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] text-[var(--admin-muted)] font-mono">{p.sku}</p>
        <h4 className="text-sm text-[var(--admin-text)] truncate mt-0.5">{p.title}</h4>

        {/* Price + margin */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-[var(--admin-text)]">{fmt(p.price)}</span>
          {p.compare_price && <span className="text-[10px] text-[var(--admin-muted)] line-through">{fmt(p.compare_price)}</span>}
        </div>
        {p.unit_cost > 0 && (
          <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">
            Costo: {fmt(p.unit_cost)} · Margen: <span className={margin >= 40 ? "text-green-600" : "text-amber-500"}>{fmtPct(margin)}</span>
          </p>
        )}

        {/* Stock + reviews */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--admin-border)]">
          <div className="flex items-center gap-1.5">
            <Package size={11} className={stockCls} />
            <span className={`text-[11px] ${stockCls}`}>Stock: {p.stock}</span>
            {p.reserved_stock > 0 && (
              <span className="text-[9px] px-1 py-0.5 bg-orange-50 text-orange-600 rounded font-bold">R:{p.reserved_stock}</span>
            )}
          </div>
          {p.review_count > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-[var(--admin-accent)]">
              <Star size={10} fill="currentColor" /> {p.avg_rating} ({p.review_count})
            </span>
          )}
        </div>

        {/* Sales info */}
        {p.sold_units_30d > 0 && (
          <p className="text-[10px] text-[var(--admin-muted)] mt-1.5">
            <TrendingUp size={9} className="inline mr-0.5" /> {p.sold_units_30d} vendidos (30d) · {fmt(p.revenue_30d)}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3">
          {p.laser_available && (
            <span className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">
              <Zap size={9} /> Grabado
            </span>
          )}
          <div className="ml-auto relative">
            <button onClick={e => { e.stopPropagation(); onContextMenu(contextMenuId === p.id ? null : p.id); }}
              className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]">
              <MoreVertical size={14} />
            </button>
            {contextMenuId === p.id && <ContextMenu product={p} onAction={onAction} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════ CONTEXT MENU ═══════
const ContextMenu: React.FC<{ product: Product; onAction: (a: string, id: string) => void }> = ({ product: p, onAction }) => (
  <div className="absolute right-0 top-full mt-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-xl py-1 z-30 min-w-[180px]"
    onClick={e => e.stopPropagation()}>
    <button onClick={() => onAction("view", p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
      <ExternalLink size={12} /> Ver en tienda
    </button>
    <button onClick={() => onAction("duplicate", p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
      <Copy size={12} /> Duplicar
    </button>
    <button onClick={() => onAction(p.status === "active" ? "draft" : "activate", p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]">
      {p.status === "active" ? <Archive size={12} /> : <Check size={12} />}
      {p.status === "active" ? "Pasar a borrador" : "Activar"}
    </button>
    <div className="border-t border-[var(--admin-border)] my-1" />
    <button onClick={() => onAction("delete", p.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50">
      <Trash2 size={12} /> Eliminar
    </button>
  </div>
);

// ═══════ PRODUCT TABLE ═══════
const ProductTable: React.FC<{
  products: Product[];
  sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void;
  selectedIds: Set<string>; onToggleSelect: (id: string) => void; onToggleSelectAll: () => void;
  onAction: (a: string, id: string) => void;
  contextMenuId: string | null; onContextMenu: (id: string | null) => void;
  actionLoading: string | null;
}> = ({ products, sortKey, sortDir, onSort, selectedIds, onToggleSelect, onToggleSelectAll, onAction, contextMenuId, onContextMenu, actionLoading }) => {
  const SortHeader: React.FC<{ label: string; k: SortKey; className?: string }> = ({ label, k, className = "" }) => (
    <th className={`px-3 py-3 cursor-pointer select-none ${className}`} onClick={() => onSort(k)}>
      <span className="flex items-center gap-1">
        {label} <ArrowUpDown size={10} className={sortKey === k ? "text-[var(--admin-accent)]" : ""} />
        {sortKey === k && <span className="text-[8px]">{sortDir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
              <th className="pl-4 py-3 w-8">
                <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0}
                  onChange={onToggleSelectAll} className="accent-accent-gold rounded" />
              </th>
              <th className="px-3 py-3 w-12" />
              <SortHeader label="Producto" k="name" />
              <th className="px-3 py-3">SKU</th>
              <th className="px-3 py-3">Categoría</th>
              <SortHeader label="Precio" k="price" />
              <SortHeader label="Margen" k="margin" className="hidden md:table-cell" />
              <SortHeader label="Stock" k="stock" />
              <SortHeader label="Vendidos" k="soldUnits" className="hidden lg:table-cell" />
              <SortHeader label="Rating" k="rating" className="hidden lg:table-cell" />
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-wood-50">
            {products.length === 0 ? (
              <tr><td colSpan={12} className="px-4 py-12 text-center text-xs text-[var(--admin-muted)]">Sin productos</td></tr>
            ) : products.map(p => {
              const statusCfg = STATUS_CONFIG[p.status];
              const margin = getMargin(p);
              const stockCls = getStockColor(p);
              return (
                <tr key={p.id} className={`hover:bg-[var(--admin-surface2)]/50 transition-colors ${selectedIds.has(p.id) ? "bg-[var(--admin-accent)]/5" : ""}`}>
                  <td className="pl-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => onToggleSelect(p.id)} className="accent-accent-gold rounded" />
                  </td>
                  <td className="px-3 py-3">
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[var(--admin-surface2)] flex items-center justify-center"><Package size={14} className="text-[var(--admin-muted)]" /></div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs text-[var(--admin-text)] truncate max-w-[200px]">{p.title}</p>
                    {p.variants_count > 1 && <p className="text-[10px] text-[var(--admin-muted)]">{p.variants_count} variantes</p>}
                  </td>
                  <td className="px-3 py-3 text-xs text-[var(--admin-text-secondary)] font-mono">{p.sku}</td>
                  <td className="px-3 py-3 text-xs text-[var(--admin-text-secondary)]">{p.category}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs font-bold text-[var(--admin-text)]">{fmt(p.price)}</span>
                    {p.unit_cost > 0 && <p className="text-[10px] text-[var(--admin-muted)]">C: {fmt(p.unit_cost)}</p>}
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    {p.unit_cost > 0 ? (
                      <span className={`text-xs font-bold ${margin >= 40 ? "text-green-600" : margin >= 20 ? "text-amber-500" : "text-red-500"}`}>{fmtPct(margin)}</span>
                    ) : <span className="text-[10px] text-[var(--admin-muted)]">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-bold ${stockCls}`}>{p.stock}</span>
                    {p.reserved_stock > 0 && <span className="text-[9px] text-orange-500 ml-1">R:{p.reserved_stock}</span>}
                    {p.stock_level === "low_stock" && <AlertTriangle size={10} className="inline ml-1 text-amber-400" />}
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {p.sold_units_30d > 0 ? (
                      <div>
                        <span className="text-xs text-[var(--admin-text)]">{p.sold_units_30d}</span>
                        <p className="text-[10px] text-[var(--admin-muted)]">{fmt(p.revenue_30d)}</p>
                      </div>
                    ) : <span className="text-[10px] text-[var(--admin-muted)]">—</span>}
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {p.review_count > 0 ? (
                      <span className="flex items-center gap-0.5 text-xs text-[var(--admin-accent)]">
                        <Star size={10} fill="currentColor" /> {p.avg_rating}
                        <span className="text-[10px] text-[var(--admin-muted)]">({p.review_count})</span>
                      </span>
                    ) : <span className="text-[10px] text-[var(--admin-muted)]">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${statusCfg.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative">
                      <button onClick={e => { e.stopPropagation(); onContextMenu(contextMenuId === p.id ? null : p.id); }}
                        className="p-1.5 hover:bg-[var(--admin-surface2)] rounded-lg text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]">
                        <MoreVertical size={14} />
                      </button>
                      {contextMenuId === p.id && <ContextMenu product={p} onAction={onAction} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
