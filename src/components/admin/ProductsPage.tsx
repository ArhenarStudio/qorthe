"use client";

// ═══════════════════════════════════════════════════════════════
// ProductsPage — Production-ready · Estándar Plantilla 01
// ─ UI adopta tema via CSS vars sin prefijo
// ─ Datos reales desde Medusa (useAdminData)
// ─ Grid / Table · Filtros · Bulk actions · Export CSV
// ─ Zero mock data · Zero rounded · Zero motion · Zero emojis
// ═══════════════════════════════════════════════════════════════

import React, { useState, useMemo, useCallback } from "react";
import {
  Search, Grid3X3, List, Plus, Filter, MoreVertical,
  Package, AlertTriangle, Pencil, Trash2, Eye,
  Download, Star, Copy, Archive, ExternalLink,
  X, ArrowUpDown, TrendingUp, DollarSign, ShoppingBag, Check,
  Zap, RefreshCw, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/useAdminData";
import {
  Product, ProductStats, ProductFilters, ProductStatus,
  SortKey, SortDir, ViewMode,
  STATUS_CONFIG, fmt, fmtPct, getMargin, getStockColor, DEFAULT_FILTERS,
} from "./products/types";

// ─── Badge de estado ────────────────────────────────────────
function StatusBadge({ status }: { status: ProductStatus }) {
  const cfg = STATUS_CONFIG[status];
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    active:     { bg: "var(--success-subtle)",  color: "var(--success)", border: "var(--success)" },
    draft:      { bg: "var(--warning-subtle)",  color: "var(--warning)", border: "var(--warning)" },
    outOfStock: { bg: "var(--error-subtle)",    color: "var(--error)",   border: "var(--error)"   },
    proposed:   { bg: "var(--info-subtle)",     color: "var(--info)",    border: "var(--info)"    },
  };
  const c = colors[status] ?? colors.draft;
  return (
    <span style={{
      display: "inline-block", fontSize: 11, fontWeight: 700,
      padding: "2px 8px",
      backgroundColor: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
    }}>
      {cfg.label}
    </span>
  );
}

// ─── KPI Card ───────────────────────────────────────────────
const KpiCard: React.FC<{ icon: React.ReactNode; value: string; label: string; sub: string }> =
  ({ icon, value, label, sub }) => (
    <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", padding: 16 }}>
      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>
    </div>
  );

// ─── FilterSelect ────────────────────────────────────────────
const FilterSelect: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: [string, string][] }> =
  ({ label, value, onChange, options }) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", padding: "6px 10px", fontSize: 13, border: "1px solid var(--border)", backgroundColor: "var(--surface2)", color: "var(--text)", outline: "none" }}>
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  );

// ─── ContextMenu ─────────────────────────────────────────────
const ContextMenu: React.FC<{ product: Product; onAction: (a: string, id: string) => void }> =
  ({ product: p, onAction }) => (
    <div style={{
      position: "absolute", right: 0, top: "100%", marginTop: 4, zIndex: 30,
      backgroundColor: "var(--surface)", border: "2px solid var(--border)",
      minWidth: 180, boxShadow: "var(--shadow-lg)",
    }} onClick={e => e.stopPropagation()}>
      {[
        { action: "view", icon: <ExternalLink size={12} />, label: "Ver en tienda" },
        { action: "duplicate", icon: <Copy size={12} />, label: "Duplicar" },
        {
          action: p.status === "active" ? "draft" : "activate",
          icon: p.status === "active" ? <Archive size={12} /> : <Check size={12} />,
          label: p.status === "active" ? "Pasar a borrador" : "Activar",
        },
      ].map(item => (
        <button key={item.action} onClick={() => onAction(item.action, p.id)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--surface2)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
          {item.icon}{item.label}
        </button>
      ))}
      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
      <button onClick={() => onAction("delete", p.id)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "var(--error)", backgroundColor: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--error-subtle)")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
        <Trash2 size={12} /> Eliminar
      </button>
    </div>
  );

// ─── ProductCard (Grid) ──────────────────────────────────────
const ProductCard: React.FC<{
  product: Product;
  onAction: (a: string, id: string) => void;
  contextMenuId: string | null;
  onContextMenu: (id: string | null) => void;
  actionLoading: string | null;
}> = ({ product: p, onAction, contextMenuId, onContextMenu, actionLoading }) => {
  const margin = getMargin(p);
  const isLoading = actionLoading === p.id;
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", position: "relative" }}>
      {isLoading && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(var(--surface-rgb),0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
          <Loader2 size={20} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
        </div>
      )}
      {/* Imagen */}
      <div style={{ position: "relative", aspectRatio: "1/1", backgroundColor: "var(--surface2)" }}>
        {p.thumbnail
          ? <img src={p.thumbnail} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={32} style={{ color: "var(--text-muted)" }} /></div>}
        <div style={{ position: "absolute", top: 8, left: 8 }}><StatusBadge status={p.status} /></div>
        {p.stock === 0 && (
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, backgroundColor: "var(--error)", padding: "4px 10px" }}>AGOTADO</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{p.sku}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{fmt(p.price)}</span>
          {p.compare_price != null && p.compare_price > 0 && <span style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through" }}>{fmt(p.compare_price)}</span>}
        </div>
        {p.unit_cost > 0 && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Costo: {fmt(p.unit_cost)} · Margen: <span style={{ color: margin >= 40 ? "var(--success)" : "var(--warning)", fontWeight: 700 }}>{fmtPct(margin)}</span>
          </div>
        )}
        {/* Stock + reviews */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: p.stock <= 0 ? "var(--error)" : p.stock_level === "low_stock" ? "var(--warning)" : "var(--text-secondary)" }}>
            Stock: {p.stock}
          </span>
          {p.review_count > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--accent)" }}>
              <Star size={10} fill="currentColor" /> {p.avg_rating} ({p.review_count})
            </span>
          )}
        </div>
        {/* Ventas 30d */}
        {p.sold_units_30d > 0 && (
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={10} /> {p.sold_units_30d} vendidos (30d) · {fmt(p.revenue_30d)}
          </div>
        )}
        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          {p.laser_available && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--error)", backgroundColor: "var(--error-subtle)", padding: "2px 8px", border: "1px solid var(--error)" }}>
              <Zap size={9} /> Grabado
            </span>
          )}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            <button onClick={e => { e.stopPropagation(); onContextMenu(contextMenuId === p.id ? null : p.id); }}
              style={{ padding: "4px 6px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <MoreVertical size={14} />
            </button>
            {contextMenuId === p.id && <ContextMenu product={p} onAction={onAction} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ProductTable (List view) ─────────────────────────────────
const ProductTable: React.FC<{
  products: Product[]; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void;
  selectedIds: Set<string>; onToggleSelect: (id: string) => void; onToggleSelectAll: () => void;
  onAction: (a: string, id: string) => void;
  contextMenuId: string | null; onContextMenu: (id: string | null) => void; actionLoading: string | null;
}> = ({ products, sortKey, sortDir, onSort, selectedIds, onToggleSelect, onToggleSelectAll, onAction, contextMenuId, onContextMenu, actionLoading }) => {
  const SortTh: React.FC<{ label: string; k: SortKey }> = ({ label, k }) => (
    <th onClick={() => onSort(k)} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label} <ArrowUpDown size={10} style={{ color: sortKey === k ? "var(--accent)" : "var(--text-muted)" }} />
        {sortKey === k && <span style={{ fontSize: 9 }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
      </span>
    </th>
  );
  return (
    <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ padding: "10px 12px", width: 32 }}>
              <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0} onChange={onToggleSelectAll} />
            </th>
            <th style={{ padding: "10px 12px", width: 48 }} />
            <SortTh label="PRODUCTO" k="name" />
            <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>SKU</th>
            <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>CATEGORÍA</th>
            <SortTh label="PRECIO" k="price" />
            <SortTh label="MARGEN" k="margin" />
            <SortTh label="STOCK" k="stock" />
            <SortTh label="VENDIDOS 30D" k="soldUnits" />
            <SortTh label="RATING" k="rating" />
            <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)" }}>ESTADO</th>
            <th style={{ padding: "10px 12px", width: 40 }} />
          </tr>
        </thead>
        <tbody>
          {products.length === 0
            ? <tr><td colSpan={12} style={{ padding: "48px 16px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>Sin productos</td></tr>
            : products.map((p, idx) => {
              const margin = getMargin(p);
              return (
                <tr key={p.id} style={{ borderBottom: idx < products.length - 1 ? "1px solid var(--border)" : "none", backgroundColor: selectedIds.has(p.id) ? "var(--accent-subtle)" : "transparent" }}>
                  <td style={{ padding: "10px 12px" }}><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => onToggleSelect(p.id)} /></td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.thumbnail
                      ? <img src={p.thumbnail} alt="" style={{ width: 40, height: 40, objectFit: "cover" }} loading="lazy" />
                      : <div style={{ width: 40, height: 40, backgroundColor: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={14} style={{ color: "var(--text-muted)" }} /></div>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                    {p.variants_count > 1 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{p.variants_count} variantes</div>}
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{p.sku}</td>
                  <td style={{ padding: "10px 12px", fontSize: 13, color: "var(--text-secondary)" }}>{p.category}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text)" }}>{fmt(p.price)}</div>
                    {p.unit_cost > 0 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>C: {fmt(p.unit_cost)}</div>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.unit_cost > 0
                      ? <span style={{ fontSize: 13, fontWeight: 700, color: margin >= 40 ? "var(--success)" : margin >= 20 ? "var(--warning)" : "var(--error)" }}>{fmtPct(margin)}</span>
                      : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, color: p.stock <= 0 ? "var(--error)" : p.stock_level === "low_stock" ? "var(--warning)" : "var(--text)" }}>{p.stock}</span>
                    {p.reserved_stock > 0 && <span style={{ fontSize: 10, color: "var(--warning)", marginLeft: 4 }}>R:{p.reserved_stock}</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.sold_units_30d > 0
                      ? <div><span style={{ fontSize: 13, color: "var(--text)" }}>{p.sold_units_30d}</span><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{fmt(p.revenue_30d)}</div></div>
                      : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {p.review_count > 0
                      ? <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, color: "var(--accent)" }}><Star size={10} fill="currentColor" /> {p.avg_rating} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({p.review_count})</span></span>
                      : <span style={{ fontSize: 11, color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}><StatusBadge status={p.status} /></td>
                  <td style={{ padding: "10px 12px", position: "relative" }}>
                    <button onClick={e => { e.stopPropagation(); onContextMenu(contextMenuId === p.id ? null : p.id); }}
                      style={{ padding: "4px 6px", backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                      <MoreVertical size={14} />
                    </button>
                    {contextMenuId === p.id && <ContextMenu product={p} onAction={onAction} />}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

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

  const { data, loading, refetch } = useAdminData<{ products: Product[]; stats: ProductStats; count: number }>(
    "/api/admin/products?limit=100", { refreshInterval: 60_000 }
  );
  const products = data?.products ?? [];
  const stats = data?.stats ?? null;

  const categories = useMemo(() => [...new Set(products.map(p => p.category))].sort(), [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (search) { const q = search.toLowerCase(); list = list.filter(p => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); }
    if (filters.status !== "all") list = list.filter(p => p.status === filters.status);
    if (filters.category !== "all") list = list.filter(p => p.category === filters.category);
    if (filters.stock !== "all") list = list.filter(p => p.stock_level === filters.stock);
    if (filters.laser !== "all") list = list.filter(p => filters.laser === "yes" ? p.laser_available : !p.laser_available);
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

  const activeFilterCount = Object.values(filters).filter(v => v !== "all").length;
  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } };
  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)));

  const handleAction = useCallback(async (action: string, productId: string) => {
    setContextMenuId(null);
    setActionLoading(productId);
    try {
      if (action === "view") { const p = products.find(p => p.id === productId); if (p?.handle) window.open(`/shop/${p.handle}`, "_blank"); return; }
      if (action === "duplicate") {
        const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "duplicate", product_id: productId }) });
        const d = await res.json(); if (d.success) { toast.success("Producto duplicado"); refetch(); } else toast.error(d.error || "Error al duplicar"); return;
      }
      if (action === "activate" || action === "draft") {
        const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_status", product_id: productId, status: action === "activate" ? "active" : "draft" }) });
        const d = await res.json(); if (d.success) { toast.success(`Estado actualizado`); refetch(); } else toast.error(d.error || "Error"); return;
      }
      if (action === "delete") {
        const res = await fetch(`/api/admin/products?id=${productId}`, { method: "DELETE" });
        const d = await res.json(); if (d.success) { toast.success("Producto eliminado"); refetch(); } else toast.error(d.error || "Error al eliminar"); return;
      }
    } catch { toast.error("Error de conexión"); } finally { setActionLoading(null); }
  }, [products, refetch]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.size === 0) return;
    setActionLoading("bulk");
    try {
      if (action === "activate" || action === "draft") {
        const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bulk_status", product_ids: [...selectedIds], status: action === "activate" ? "active" : "draft" }) });
        const d = await res.json(); if (d.success) { toast.success(`${d.updated} productos actualizados`); setSelectedIds(new Set()); refetch(); }
      }
      if (action === "export") {
        const sel = products.filter(p => selectedIds.has(p.id));
        const csv = ["SKU,Producto,Categoría,Precio,Costo,Stock,Vendidos 30d,Rating,Estado", ...sel.map(p => `${p.sku},"${p.title}",${p.category},${p.price},${p.unit_cost},${p.stock},${p.sold_units_30d},${p.avg_rating},${p.status}`)].join("\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `productos-${new Date().toISOString().slice(0,10)}.csv`; a.click();
        toast.success(`${sel.length} productos exportados`);
      }
    } catch { toast.error("Error"); } finally { setActionLoading(null); }
  }, [selectedIds, products, refetch]);

  const exportAll = () => {
    const csv = ["SKU,Producto,Categoría,Precio,Costo,Stock,Vendidos 30d,Revenue 30d,Rating,Estado", ...products.map(p => `${p.sku},"${p.title}",${p.category},${p.price},${p.unit_cost},${p.stock},${p.sold_units_30d},${p.revenue_30d},${p.avg_rating},${p.status}`)].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `productos-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    toast.success("CSV exportado");
  };

  // ═══ RENDER ═══
  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }} onClick={() => setContextMenuId(null)}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0 }}>Productos</h1>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Catálogo de productos · Medusa</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => refetch()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: "var(--surface)", border: "2px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : undefined }} /> Actualizar
          </button>
          <button onClick={exportAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", backgroundColor: "var(--surface)", border: "2px solid var(--border)", color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <KpiCard icon={<ShoppingBag size={13} />} value={String(stats.total_products)} label="Total Productos" sub={`${stats.active_count} activos · ${stats.total_variants} variantes`} />
          <KpiCard icon={<DollarSign size={13} />} value={fmt(stats.inventory_retail)} label="Valor Inventario" sub={`Costo: ${fmt(stats.inventory_cost)} · Margen: ${fmtPct(stats.margin_percent)}`} />
          <KpiCard icon={<TrendingUp size={13} />} value={fmt(stats.total_revenue_30d)} label="Revenue 30 Días" sub={`${stats.total_sold_30d} unidades vendidas`} />
          <KpiCard icon={<AlertTriangle size={13} />} value={String(stats.low_stock_count + stats.out_of_stock_count)} label="Alertas de Stock" sub={`${stats.low_stock_count} stock bajo · ${stats.out_of_stock_count} agotados`} />
          <KpiCard icon={<Star size={13} />} value={stats.avg_rating > 0 ? String(stats.avg_rating) : "—"} label="Rating Promedio" sub={`${products.reduce((s, p) => s + p.review_count, 0)} reviews totales`} />
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: "var(--surface2)", border: "1px solid var(--border)" }}>
          <Search size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, SKU, categoría..."
            style={{ flex: 1, backgroundColor: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--text)" }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={14} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", backgroundColor: showFilters || activeFilterCount > 0 ? "var(--accent-subtle)" : "var(--surface)", border: `2px solid ${showFilters || activeFilterCount > 0 ? "var(--accent)" : "var(--border)"}`, color: showFilters || activeFilterCount > 0 ? "var(--accent)" : "var(--text)" }}>
          <Filter size={13} /> Filtros {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
        <div style={{ display: "flex", border: "2px solid var(--border)" }}>
          {(["grid", "table"] as ViewMode[]).map((mode, i) => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{ padding: "8px 12px", backgroundColor: viewMode === mode ? "var(--accent)" : "var(--surface)", color: viewMode === mode ? "var(--accent-text)" : "var(--text)", border: "none", cursor: "pointer", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
              {mode === "grid" ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          <FilterSelect label="Estado" value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v as ProductStatus | "all" }))} options={[["all","Todos"],["active","Activo"],["draft","Borrador"],["outOfStock","Agotado"]]} />
          <FilterSelect label="Categoría" value={filters.category} onChange={v => setFilters(f => ({ ...f, category: v }))} options={[["all","Todas"], ...categories.map(c => [c,c] as [string,string])]} />
          <FilterSelect label="Stock" value={filters.stock} onChange={v => setFilters(f => ({ ...f, stock: v as ProductFilters["stock"] }))} options={[["all","Todos"],["in_stock","En stock"],["low_stock","Stock bajo"],["out_of_stock","Agotado"]]} />
          <FilterSelect label="Grabado" value={filters.laser} onChange={v => setFilters(f => ({ ...f, laser: v as ProductFilters["laser"] }))} options={[["all","Todos"],["yes","Con grabado"],["no","Sin grabado"]]} />
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={() => setFilters(DEFAULT_FILTERS)} style={{ padding: "6px 12px", backgroundColor: "var(--surface2)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}>Limpiar filtros</button>
          </div>
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", backgroundColor: "var(--accent-subtle)", border: "2px solid var(--accent)", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{selectedIds.size} seleccionado{selectedIds.size > 1 ? "s" : ""}</span>
          <button onClick={() => handleBulkAction("activate")} disabled={actionLoading === "bulk"} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700, backgroundColor: "var(--success-subtle)", color: "var(--success)", border: "1px solid var(--success)", cursor: "pointer" }}>Activar</button>
          <button onClick={() => handleBulkAction("draft")} disabled={actionLoading === "bulk"} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700, backgroundColor: "var(--surface2)", color: "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer" }}>Borrador</button>
          <button onClick={() => handleBulkAction("export")} disabled={actionLoading === "bulk"} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700, backgroundColor: "var(--info-subtle)", color: "var(--info)", border: "1px solid var(--info)", cursor: "pointer" }}>Exportar CSV</button>
          <button onClick={() => setSelectedIds(new Set())} style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>Deseleccionar</button>
        </div>
      )}

      {/* Content */}
      {loading && products.length === 0 ? (
        <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", padding: "64px 16px", textAlign: "center" }}>
          <Loader2 size={24} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block", animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ backgroundColor: "var(--surface)", border: "2px solid var(--border)", padding: "64px 16px", textAlign: "center" }}>
          <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Sin productos. Crea tu primer producto para comenzar.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} onAction={handleAction}
              contextMenuId={contextMenuId} onContextMenu={setContextMenuId} actionLoading={actionLoading} />
          ))}
        </div>
      ) : (
        <ProductTable products={filtered} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}
          selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll}
          onAction={handleAction} contextMenuId={contextMenuId} onContextMenu={setContextMenuId} actionLoading={actionLoading} />
      )}

      {/* Footer */}
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Mostrando {filtered.length} de {products.length} productos
      </div>
    </div>
  );
};

export default ProductsPage;
