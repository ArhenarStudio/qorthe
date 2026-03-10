"use client";

// ═══════════════════════════════════════════════════════════════
// InventoryPage — Control de Inventario SaaS-Ready COMPLETO
//
// 8 tabs: Dashboard, Inventario, Movimientos, Transferencias,
//         Conteos, Valoración, Reportes, Configuración
//
// Features:
//   - Dashboard visual (recharts) con rotación y valor
//   - Conteo cíclico con discrepancias y ajustes automáticos
//   - Transferencias entre ubicaciones con tracking
//   - Valoración de inventario (costo promedio) + historial costos
//   - Reportes ABC + productos estancados + rotación
//   - Edición inline de reorder points
//   - Badge alertas en sidebar
//   - Zero mock data, production-ready
// ═══════════════════════════════════════════════════════════════

import { useAdminTheme } from '@/src/contexts/AdminThemeContext';
import { Card, Badge, Button, StatCard } from '@/src/theme/primitives';
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package, Search, Filter, ArrowUpDown, AlertTriangle, CheckCircle,
  TrendingUp, TrendingDown, Boxes, DollarSign, Clock, Plus, Minus,
  BarChart3, Settings, Bell, RefreshCw, ChevronDown, ChevronUp,
  Truck, Warehouse, ArrowRightLeft, X, FileText, Download, Loader2,
  ClipboardList, PieChart as PieIcon, Layers,
} from "lucide-react";
import { toast } from "sonner";
import {
  InventoryItem, StockMovement, InventoryAlert, InventoryConfig, InventoryStats,
  StockStatus, MovementType, STOCK_STATUS_CONFIG, MOVEMENT_TYPE_CONFIG,
  fmt, fmtDate, fmtDateTime, DEFAULT_INVENTORY_CONFIG,
} from "./inventory/types";
import { getMovementIcon } from "./inventory/InventoryIcons";
import { DashboardTab } from "./inventory/DashboardTab";
import { TransfersTab } from "./inventory/TransfersTab";
import { CyclicCountTab } from "./inventory/CyclicCountTab";
import { ValuationTab } from "./inventory/ValuationTab";
import { ReportsTab } from "./inventory/ReportsTab";

// ═══════ TABS ═══════
type TabId = "dashboard" | "overview" | "movements" | "transfers" | "counts" | "valuation" | "reports" | "alerts" | "config";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "overview", label: "Inventario", icon: Boxes },
  { id: "movements", label: "Movimientos", icon: ArrowRightLeft },
  { id: "transfers", label: "Transferencias", icon: Truck },
  { id: "counts", label: "Conteos", icon: ClipboardList },
  { id: "valuation", label: "Valoración", icon: DollarSign },
  { id: "reports", label: "Reportes", icon: PieIcon },
  { id: "alerts", label: "Alertas", icon: Bell },
  { id: "config", label: "Config", icon: Settings },
];

// ═══════ MAIN COMPONENT ═══════
export const InventoryPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>("dashboard");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [config, setConfig] = useState<InventoryConfig>(DEFAULT_INVENTORY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [sortKey, setSortKey] = useState<"stock" | "value" | "name" | "status">("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [quickAction, setQuickAction] = useState<{ item: InventoryItem; type: MovementType } | null>(null);
  const [quickQty, setQuickQty] = useState("");
  const [quickNotes, setQuickNotes] = useState("");
  const [quickRef, setQuickRef] = useState("");
  const [quickCost, setQuickCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Data fetching ──
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, movRes, alertRes, cfgRes] = await Promise.all([
        fetch("/api/admin/inventory").then(r => r.ok ? r.json() : null),
        fetch("/api/admin/inventory?action=movements&limit=200").then(r => r.ok ? r.json() : null),
        fetch("/api/admin/inventory?action=alerts").then(r => r.ok ? r.json() : null),
        fetch("/api/admin/inventory?action=config").then(r => r.ok ? r.json() : null),
      ]);
      if (itemsRes) { setItems(itemsRes.items || []); setStats(itemsRes.stats || null); }
      if (movRes) setMovements(movRes.movements || []);
      if (alertRes) setAlerts(alertRes.alerts || []);
      if (cfgRes?.config) setConfig({ ...DEFAULT_INVENTORY_CONFIG, ...cfgRes.config });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtered & sorted items ──
  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter !== "all") list = list.filter(i => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || (i.category || "").toLowerCase().includes(q));
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "stock") cmp = a.current_stock - b.current_stock;
      else if (sortKey === "value") cmp = (a.unit_price * a.current_stock) - (b.unit_price * b.current_stock);
      else if (sortKey === "name") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "status") {
        const order: Record<string, number> = { out_of_stock: 0, low_stock: 1, in_stock: 2, overstock: 3 };
        cmp = (order[a.status] ?? 2) - (order[b.status] ?? 2);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [items, statusFilter, search, sortKey, sortDir]);

  // ── Quick action submit ──
  const handleQuickAction = async () => {
    if (!quickAction || submitting) return;
    const qty = parseInt(quickQty);
    if (!qty || qty <= 0) { toast.error("Cantidad inválida"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: quickAction.item.variant_id,
          type: quickAction.type,
          quantity: qty,
          unit_cost: quickCost ? parseFloat(quickCost) : undefined,
          reference: quickRef,
          notes: quickNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${MOVEMENT_TYPE_CONFIG[quickAction.type].label}: ${qty} uds → ${data.new_stock} en stock`);
        setQuickAction(null);
        setQuickQty(""); setQuickNotes(""); setQuickRef(""); setQuickCost("");
        fetchAll();
      } else {
        toast.error(data.error || "Error al registrar movimiento");
      }
    } catch { toast.error("Error de conexión"); }
    finally { setSubmitting(false); }
  };

  const saveConfig = async () => {
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "config", config }),
      });
      toast.success("Configuración guardada");
    } catch { toast.error("Error al guardar"); }
  };

  const resolveAlert = async (alertId: string) => {
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve_alert", alert_id: alertId }),
    });
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success("Alerta resuelta");
  };

  // ── Inline reorder edit ──
  const updateReorderPoint = async (variantId: string, newValue: number) => {
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inline_reorder", variant_id: variantId, reorder_point: newValue }),
      });
      setItems(prev => prev.map(i => i.variant_id === variantId ? { ...i, reorder_point: newValue } : i));
      toast.success("Punto de reorden actualizado");
    } catch { toast.error("Error al actualizar"); }
  };

  const exportCSV = () => {
    const csv = ['SKU,Producto,Stock,Reservado,Disponible,Costo,Valor Retail,Estado,Ubicación,Reorden',
      ...items.map(i => `${i.sku},"${i.title}",${i.current_stock},${i.reserved_stock},${i.available_stock},${i.unit_cost},${i.unit_price * i.current_stock},${i.status},${i.location},${i.reorder_point}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventario-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  // ═══════ RENDER ═══════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0, fontFamily: "var(--font-heading)" }} className="flex items-center gap-2">
          <Warehouse size={20} className="text-[var(--accent)]" /> Control de Inventario
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] text-xs rounded-none hover:bg-[var(--surface2)] transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)] border-2 border-[var(--border)] text-[var(--text-secondary)] text-xs rounded-none hover:bg-[var(--surface2)] transition-colors">
            <Download size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <KpiCard icon={<Boxes size={16} className="text-[var(--accent)]" />} value={String(stats.total_items)} label="Productos" sub={`${stats.total_units} unidades`} accent />
          <KpiCard icon={<DollarSign size={16} style={{color:"var(--accent)"}} />} value={fmt(stats.total_cost_value)} label="Valor costo" sub={`Retail: ${fmt(stats.total_retail_value)}`} />
          <KpiCard icon={<AlertTriangle size={16} className="text-amber-500" />} value={String(stats.low_stock_count)} label="Stock bajo" sub={`${stats.out_of_stock_count} agotados`} />
          <KpiCard icon={<Bell size={16} style={{color:"var(--error)"}} />} value={String(stats.unresolved_alerts)} label="Alertas" sub="Sin resolver" />
          <KpiCard icon={<Truck size={16} className="text-indigo-500" />} value={String(stats.pending_transfers)} label="Transferencias" sub="Pendientes" />
          <KpiCard icon={<ClipboardList size={16} className="text-teal-600" />} value={String(stats.pending_counts)} label="Conteos" sub="Programados" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          const badgeCount = t.id === "alerts" ? alerts.length : 0;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-none whitespace-nowrap transition-colors ${
                tab === t.id ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface2)] border-2 border-[var(--border)]'
              }`}>
              <Icon size={14} /> {t.label}
              {badgeCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-none text-[10px] ${tab === t.id ? '' : ''}`}>
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {tab === "dashboard" && <DashboardTab items={items} movements={movements} stats={stats} />}
      {tab === "overview" && (
        <OverviewTab
          items={filtered} search={search} onSearch={setSearch}
          statusFilter={statusFilter} onStatusFilter={setStatusFilter}
          sortKey={sortKey} sortDir={sortDir}
          onSort={(key) => { if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortKey(key); setSortDir("asc"); } }}
          onQuickAction={(item, type) => { setQuickAction({ item, type }); setQuickQty(""); setQuickNotes(""); setQuickRef(""); setQuickCost(String(item.unit_cost || "")); }}
          onUpdateReorder={updateReorderPoint}
          loading={loading}
        />
      )}
      {tab === "movements" && <MovementsTab movements={movements} />}
      {tab === "transfers" && <TransfersTab items={items} locations={config.locations} onRefresh={fetchAll} />}
      {tab === "counts" && <CyclicCountTab items={items} locations={config.locations} onRefresh={fetchAll} />}
      {tab === "valuation" && <ValuationTab items={items} />}
      {tab === "reports" && <ReportsTab items={items} movements={movements} />}
      {tab === "alerts" && <AlertsTab alerts={alerts} onResolve={resolveAlert} />}
      {tab === "config" && <ConfigTab config={config} onChange={setConfig} onSave={saveConfig} />}

      {/* Quick Action Modal */}
      
        {quickAction && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => !submitting && setQuickAction(null)}>
            <div
              className="bg-[var(--surface)] rounded-none shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  {getMovementIcon(quickAction.type, 16, MOVEMENT_TYPE_CONFIG[quickAction.type].color)}
                  {MOVEMENT_TYPE_CONFIG[quickAction.type].label}
                </h4>
                <button onClick={() => setQuickAction(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
              </div>
              <div className="bg-[var(--surface2)] rounded-none p-3 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Producto</span><span className="text-[var(--text)] font-bold">{quickAction.item.title}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">SKU</span><span className="text-[var(--text)]">{quickAction.item.sku}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Stock actual</span><span className="text-[var(--text)] font-bold">{quickAction.item.current_stock}</span></div>
                {quickAction.item.reserved_stock > 0 && (
                  <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Reservado</span><span className="text-orange-600 font-bold">{quickAction.item.reserved_stock}</span></div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Cantidad *</label>
                  <input type="number" min={1} value={quickQty} onChange={e => setQuickQty(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" autoFocus />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Costo unitario</label>
                  <input type="number" value={quickCost} onChange={e => setQuickCost(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Referencia</label>
                <input value={quickRef} onChange={e => setQuickRef(e.target.value)} placeholder="# factura, orden, etc."
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Notas</label>
                <input value={quickNotes} onChange={e => setQuickNotes(e.target.value)} placeholder="Observaciones..."
                  className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
              </div>
              {quickQty && (
                <div className="rounded-none p-3 text-xs" style={{backgroundColor:"var(--info-subtle)",color:"var(--info)",border:"1px solid var(--info)"}}>
                  Stock resultante: <strong>{quickAction.item.current_stock} → {Math.max(0, quickAction.item.current_stock + (["purchase", "return", "production"].includes(quickAction.type) ? parseInt(quickQty) || 0 : -(parseInt(quickQty) || 0)))}</strong>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setQuickAction(null)} className="px-4 py-2 text-xs text-[var(--text-secondary)]">Cancelar</button>
                <button onClick={handleQuickAction} disabled={submitting || !quickQty}
                  className="px-4 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)] disabled:opacity-50">
                  {submitting ? "Registrando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      
    </div>
  );
};

// ═══════ KPI CARD ═══════
const KpiCard: React.FC<{ icon: React.ReactNode; value: string; label: string; sub: string; accent?: boolean }> = ({ icon, value, label, sub, accent }) => (
  <div className={`bg-[var(--surface)] rounded-none border  p-4 ${accent ? 'border-[var(--accent)]/30' : 'border-[var(--border)]'}`}>
    <div className={`w-8 h-8 rounded-none flex items-center justify-center ${accent ? 'bg-[var(--accent)]/15' : 'bg-[var(--surface2)]'} mb-2`}>{icon}</div>
    <p className="text-xl font-sans text-[var(--text)]">{value}</p>
    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{label}</p>
    <p className="text-[11px] text-[var(--text-secondary)] mt-1">{sub}</p>
  </div>
);

// ═══════ OVERVIEW TAB (with inline reorder edit) ═══════
const OverviewTab: React.FC<{
  items: InventoryItem[];
  search: string;
  onSearch: (s: string) => void;
  statusFilter: StockStatus | "all";
  onStatusFilter: (s: StockStatus | "all") => void;
  sortKey: string;
  sortDir: string;
  onSort: (key: "stock" | "value" | "name" | "status") => void;
  onQuickAction: (item: InventoryItem, type: MovementType) => void;
  onUpdateReorder: (variantId: string, value: number) => void;
  loading: boolean;
}> = ({ items, search, onSearch, statusFilter, onStatusFilter, sortKey, sortDir, onSort, onQuickAction, onUpdateReorder, loading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReorder, setEditingReorder] = useState<string | null>(null);
  const [reorderValue, setReorderValue] = useState("");

  const startEditReorder = (item: InventoryItem) => {
    setEditingReorder(item.variant_id);
    setReorderValue(String(item.reorder_point));
  };

  const saveReorder = (variantId: string) => {
    const val = parseInt(reorderValue);
    if (val >= 0) {
      onUpdateReorder(variantId, val);
    }
    setEditingReorder(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Buscar por producto, SKU..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none text-xs outline-none focus:border-[var(--border)]" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "out_of_stock", "low_stock", "in_stock", "overstock"] as const).map(s => (
            <button key={s} onClick={() => onStatusFilter(s)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                statusFilter === s ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--border)]' : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border)]'
              }`}>
              {s === "all" ? "Todos" : STOCK_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--surface2)]/50">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 cursor-pointer hover:text-[var(--text)]" onClick={() => onSort("name")}>
                  Producto {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 cursor-pointer hover:text-[var(--text)]" onClick={() => onSort("stock")}>
                  Stock {sortKey === "stock" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3">Reorden</th>
                <th className="px-4 py-3 cursor-pointer hover:text-[var(--text)]" onClick={() => onSort("value")}>
                  Valor {sortKey === "value" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-[var(--text)]" onClick={() => onSort("status")}>
                  Estado {sortKey === "status" && (sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--text-muted)]" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-xs text-[var(--text-muted)]">No hay productos en inventario</td></tr>
              ) : items.map(item => {
                const statusCfg = STOCK_STATUS_CONFIG[item.status];
                const isExpanded = expandedId === item.id;
                const stockPct = item.max_stock > 0 ? Math.min(100, (item.current_stock / item.max_stock) * 100) : 50;
                const isEditingThis = editingReorder === item.variant_id;
                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-[var(--surface2)]/50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => setExpandedId(isExpanded ? null : item.id)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt="" className="w-9 h-9 rounded-none object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-none bg-[var(--surface2)] flex items-center justify-center"><Package size={14} className="text-[var(--text-muted)]" /></div>
                          )}
                          <div>
                            <span className="text-xs font-medium text-[var(--text)] block">{item.title}</span>
                            {item.category && <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--text)]">{item.current_stock}</span>
                          {item.reserved_stock > 0 && (
                            <span className="text-[9px] px-1 py-0.5 font-bold" style={{backgroundColor:"var(--warning-subtle)",color:"var(--warning)",border:"1px solid var(--warning)"}} title={`${item.reserved_stock} reservados`}>
                              R:{item.reserved_stock}
                            </span>
                          )}
                          <div className="w-16 h-1.5 bg-[var(--surface2)] rounded-none overflow-hidden">
                            <div className="h-full rounded-none transition-all" style={{
                              width: `${stockPct}%`,
                              backgroundColor: item.status === 'out_of_stock' ? '#ef4444' : item.status === 'low_stock' ? '#f59e0b' : item.status === 'overstock' ? '#3b82f6' : '#22c55e',
                            }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min={0} value={reorderValue} onChange={e => setReorderValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveReorder(item.variant_id); if (e.key === 'Escape') setEditingReorder(null); }}
                              className="w-14 px-1.5 py-1 text-xs text-center bg-[var(--surface)] border border-[var(--accent)] rounded outline-none" autoFocus />
                            <button onClick={() => saveReorder(item.variant_id)} className="text-green-600 hover:text-green-700"><CheckCircle size={14} /></button>
                            <button onClick={() => setEditingReorder(null)} className="text-[var(--text-muted)] hover:text-red-500"><X size={12} /></button>
                          </div>
                        ) : (
                          <button onClick={() => startEditReorder(item)}
                            className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] cursor-pointer hover:underline transition-colors"
                            title="Click para editar">
                            {item.reorder_point}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text)]">{fmt(item.unit_price * item.current_stock)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-none font-bold ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[var(--text-secondary)]">{item.location}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => onQuickAction(item, "purchase")} title="Entrada (compra)"
                            className="p-1.5" style={{border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)"}}><Plus size={12} /></button>
                          <button onClick={() => onQuickAction(item, "sale")} title="Salida (venta)"
                            className="p-1.5" style={{border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)"}}><Minus size={12} /></button>
                          <button onClick={() => onQuickAction(item, "adjustment")} title="Ajuste"
                            className="p-1.5" style={{border:"1px solid var(--border)",background:"var(--surface2)",color:"var(--text)"}}><ArrowUpDown size={12} /></button>
                          <button onClick={() => onQuickAction(item, "damage")} title="Daño/Merma"
                            className="p-1.5" style={{border:"1px solid var(--error)",background:"var(--error-subtle)",color:"var(--error)"}}><AlertTriangle size={12} /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="px-4 py-4 bg-[var(--surface2)]/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
                            <div><span className="text-[var(--text-muted)] block">Costo unitario</span><span className="text-[var(--text)] font-bold">{fmt(item.unit_cost)}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Precio venta</span><span className="text-[var(--text)] font-bold">{fmt(item.unit_price)}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Margen</span><span className="text-[var(--text)] font-bold">{item.unit_price > 0 ? Math.round((item.unit_price - item.unit_cost) / item.unit_price * 100) : 0}%</span></div>
                            <div><span className="text-[var(--text-muted)] block">Reservado</span><span className="text-[var(--text)]">{item.reserved_stock} → disponible: {item.available_stock}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Días de inventario</span><span className={`font-bold ${(item.days_of_inventory || 999) > 90 ? '' : (item.days_of_inventory || 999) > 30 ? '' : ''}`}>{(item.days_of_inventory || 0) >= 999 ? '∞' : item.days_of_inventory || '—'}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Ventas 90d</span><span className="text-[var(--text)] font-bold">{item.total_sold_90d || 0}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Venta diaria prom.</span><span className="text-[var(--text)]">{(item.avg_daily_sales || 0).toFixed(2)}</span></div>
                            <div><span className="text-[var(--text-muted)] block">Stock máximo</span><span className="text-[var(--text)]">{item.max_stock} uds</span></div>
                            <div><span className="text-[var(--text-muted)] block">Cantidad reorden</span><span className="text-[var(--text)]">{item.reorder_qty} uds</span></div>
                            <div><span className="text-[var(--text-muted)] block">Último movimiento</span><span className="text-[var(--text)]">{item.last_movement_at ? fmtDateTime(item.last_movement_at) : "—"}</span></div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                            {(["purchase", "sale", "adjustment", "return", "transfer", "damage", "production"] as MovementType[]).map(type => {
                              const cfg = MOVEMENT_TYPE_CONFIG[type];
                              return (
                                <button key={type} onClick={() => onQuickAction(item, type)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none text-[10px] font-bold text-[var(--text-secondary)] hover:border-[var(--border)] transition-colors">
                                  {getMovementIcon(type, 12, cfg.color)} {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════ MOVEMENTS TAB ═══════
const MOVEMENTS_PER_PAGE = 25;

const MovementsTab: React.FC<{ movements: StockMovement[] }> = ({ movements }) => {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all');
  const [movSearch, setMovSearch] = useState('');

  const filtered = useMemo(() => {
    let list = movements;
    if (typeFilter !== 'all') list = list.filter(m => m.type === typeFilter);
    if (movSearch) {
      const q = movSearch.toLowerCase();
      list = list.filter(m => m.product_title.toLowerCase().includes(q) || m.sku.toLowerCase().includes(q) || (m.reference || '').toLowerCase().includes(q));
    }
    return list;
  }, [movements, typeFilter, movSearch]);

  const totalPages = Math.ceil(filtered.length / MOVEMENTS_PER_PAGE);
  const paged = filtered.slice(page * MOVEMENTS_PER_PAGE, (page + 1) * MOVEMENTS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => { setPage(0); }, [typeFilter, movSearch]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={movSearch} onChange={e => setMovSearch(e.target.value)} placeholder="Buscar producto, SKU, referencia..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border-2 border-[var(--border)] rounded-none text-xs outline-none focus:border-[var(--border)]" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as MovementType | 'all')}
          className="px-3 py-2 text-xs bg-[var(--surface)] border-2 border-[var(--border)] rounded-none outline-none min-w-[150px]">
          <option value="all">Todos los tipos</option>
          {Object.entries(MOVEMENT_TYPE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-[var(--text-muted)]">{filtered.length} registros</span>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--surface2)]/50">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-[var(--text-muted)]">Sin movimientos registrados</td></tr>
              ) : paged.map((m, i) => {
                const cfg = MOVEMENT_TYPE_CONFIG[m.type] || MOVEMENT_TYPE_CONFIG.adjustment;
                const isPositive = m.quantity > 0;
                return (
                  <tr key={m.id || i} className="hover:bg-[var(--surface2)]/50 transition-colors">
                    <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{fmtDateTime(m.created_at)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-bold flex items-center gap-1 ${cfg.color}`}>{getMovementIcon(m.type, 12, cfg.color)} {cfg.label}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--text)]">{m.product_title}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono">{m.sku}</td>
                    <td className="px-4 py-3"><span className="text-xs font-bold" style={{color:isPositive?"var(--success)":"var(--error)"}}>{isPositive ? '+' : ''}{m.quantity}</span></td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{m.previous_stock} → <span className="font-bold text-[var(--text)]">{m.new_stock}</span></td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{m.reference || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-muted)]">{m.created_by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-muted)]">
              Página {page + 1} de {totalPages} · Mostrando {page * MOVEMENTS_PER_PAGE + 1}–{Math.min((page + 1) * MOVEMENTS_PER_PAGE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(0)} disabled={page === 0}
                className="px-2 py-1 text-[10px] text-[var(--text-secondary)] border-2 border-[var(--border)] rounded disabled:opacity-30 hover:bg-[var(--surface2)]">«</button>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-2 py-1 text-[10px] text-[var(--text-secondary)] border-2 border-[var(--border)] rounded disabled:opacity-30 hover:bg-[var(--surface2)]">‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                const idx = start + i;
                if (idx >= totalPages) return null;
                return (
                  <button key={idx} onClick={() => setPage(idx)}
                    className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
                      page === idx ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--border)]' : 'text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface2)]'
                    }`}>{idx + 1}</button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-2 py-1 text-[10px] text-[var(--text-secondary)] border-2 border-[var(--border)] rounded disabled:opacity-30 hover:bg-[var(--surface2)]">›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                className="px-2 py-1 text-[10px] text-[var(--text-secondary)] border-2 border-[var(--border)] rounded disabled:opacity-30 hover:bg-[var(--surface2)]">»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════ ALERTS TAB ═══════
const AlertsTab: React.FC<{ alerts: InventoryAlert[]; onResolve: (id: string) => void }> = ({ alerts, onResolve }) => (
  <div className="space-y-3">
    {alerts.length === 0 ? (
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  p-12 text-center">
        <CheckCircle size={32} style={{color:"var(--success)"}} className="mx-auto mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">Sin alertas pendientes</p>
      </div>
    ) : alerts.map(a => (
      <div key={a.id} className={`bg-[var(--surface)] rounded-none border  p-4 flex items-start gap-4 ${
        a.severity === 'critical' ? 'border-red-200' : a.severity === 'warning' ? 'border-amber-200' : 'border-blue-200'
      }`}>
        <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${
          a.severity === 'critical' ? '' : a.severity === 'warning' ? '' : ''
        }`}><AlertTriangle size={18} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[var(--text)]">{a.product_title}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">{a.sku}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-bold uppercase ${
              a.severity === 'critical' ? '' : a.severity === 'warning' ? '' : ''
            }`}>{a.severity}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{a.message}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">{fmtDateTime(a.created_at)}</p>
        </div>
        <button onClick={() => onResolve(a.id)} className="px-3 py-1.5 text-[10px] font-bold shrink-0" style={{border:"1px solid var(--success)",backgroundColor:"var(--success-subtle)",color:"var(--success)"}}>
          Resolver
        </button>
      </div>
    ))}
  </div>
);

// ═══════ CONFIG TAB ═══════
const ConfigTab: React.FC<{ config: InventoryConfig; onChange: (c: InventoryConfig) => void; onSave: () => void }> = ({ config, onChange, onSave }) => {
  const [newLocation, setNewLocation] = useState("");
  return (
    <div className="space-y-6">
      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  p-5 space-y-5">
        <h4 className="text-sm font-bold text-[var(--text)]">Umbrales y Alertas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Umbral stock bajo</label>
            <input type="number" value={config.low_stock_threshold} onChange={e => onChange({ ...config, low_stock_threshold: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Multiplicador sobrestock</label>
            <input type="number" step={0.5} value={config.overstock_multiplier} onChange={e => onChange({ ...config, overstock_multiplier: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Cantidad reorden default</label>
            <input type="number" value={config.default_reorder_qty} onChange={e => onChange({ ...config, default_reorder_qty: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Email alertas</label>
            <input value={config.alert_email} onChange={e => onChange({ ...config, alert_email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Método de valoración</label>
            <select value={config.valuation_method} onChange={e => onChange({ ...config, valuation_method: e.target.value as InventoryConfig['valuation_method'] })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none outline-none">
              <option value="weighted_average">Costo promedio ponderado</option>
              <option value="fifo">FIFO (primeras entradas, primeras salidas)</option>
              <option value="lifo">LIFO (últimas entradas, primeras salidas)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Frecuencia conteo cíclico (días)</label>
            <input type="number" value={config.cyclic_count_frequency_days} onChange={e => onChange({ ...config, cyclic_count_frequency_days: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Expiración reservas (horas)</label>
            <input type="number" value={config.reserve_expiry_hours} onChange={e => onChange({ ...config, reserve_expiry_hours: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {[
            { key: 'auto_reorder_enabled' as const, label: 'Reorden automático' },
            { key: 'track_cost_changes' as const, label: 'Rastrear cambios de costo' },
            { key: 'movement_requires_notes' as const, label: 'Notas obligatorias en movimientos' },
            { key: 'alert_email_enabled' as const, label: 'Alertas por email' },
            { key: 'enable_sound_alerts' as const, label: 'Sonido en alertas' },
            { key: 'auto_reserve_on_quote' as const, label: 'Reservar stock al cotizar' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={config[key]} onChange={e => onChange({ ...config, [key]: e.target.checked })} className="accent-accent-gold" />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-none border-2 border-[var(--border)]  p-5 space-y-4">
        <h4 className="text-sm font-bold text-[var(--text)]">Ubicaciones / Almacenes</h4>
        <div className="space-y-2">
          {config.locations.map((loc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2 bg-[var(--surface2)] rounded-none">
              <Warehouse size={14} className="text-[var(--text-muted)]" />
              <span className="flex-1 text-sm text-[var(--text)]">{loc}</span>
              <button onClick={() => onChange({ ...config, locations: config.locations.filter((_, j) => j !== i) })}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"><X size={14} /></button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Nueva ubicación..."
            onKeyDown={e => { if (e.key === 'Enter' && newLocation.trim()) { onChange({ ...config, locations: [...config.locations, newLocation.trim()] }); setNewLocation(""); } }}
            className="flex-1 px-3 py-2 text-sm bg-[var(--surface2)] border-2 border-[var(--border)] rounded-none focus:border-[var(--accent)] outline-none" />
          <button onClick={() => { if (newLocation.trim()) { onChange({ ...config, locations: [...config.locations, newLocation.trim()] }); setNewLocation(""); } }}
            className="px-4 py-2 text-xs bg-[var(--accent)] text-[var(--accent-text)] rounded-none hover:bg-[var(--accent-hover)]">Agregar</button>
        </div>
      </div>

      <button onClick={onSave} className="px-6 py-3 bg-[var(--accent)] text-[var(--text)] rounded-none text-xs font-bold uppercase tracking-widest hover: transition-all">
        Guardar Configuración
      </button>
    </div>
  );
};

export default InventoryPage;
