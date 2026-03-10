"use client";

// ═══════════════════════════════════════════════════════════════
// ValuationTab — Inventory valuation with cost history charts
// Weighted average cost method, cost tracking per product
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { InventoryItem, CostHistoryEntry, fmt, fmtDate, fmtPct } from "./types";

interface Props {
  items: InventoryItem[];
}

export const ValuationTab: React.FC<Props> = ({ items }) => {
  const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
  const [selectedSku, setSelectedSku] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchCostHistory = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedSku
        ? `/api/admin/inventory?action=cost_history&sku=${selectedSku}`
        : "/api/admin/inventory?action=cost_history";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCostHistory(data.history || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [selectedSku]);

  useEffect(() => { fetchCostHistory(); }, [fetchCostHistory]);

  // ── Valuation summary ──
  const summary = useMemo(() => {
    const byCategory = new Map<string, { cost: number; retail: number; units: number }>();
    const byLocation = new Map<string, { cost: number; retail: number; units: number }>();
    let totalCost = 0;
    let totalRetail = 0;

    items.forEach(item => {
      const costVal = item.unit_cost * item.current_stock;
      const retailVal = item.unit_price * item.current_stock;
      totalCost += costVal;
      totalRetail += retailVal;

      const cat = item.category || "Sin categoría";
      const prevCat = byCategory.get(cat) || { cost: 0, retail: 0, units: 0 };
      byCategory.set(cat, { cost: prevCat.cost + costVal, retail: prevCat.retail + retailVal, units: prevCat.units + item.current_stock });

      const loc = item.location || "Sin ubicación";
      const prevLoc = byLocation.get(loc) || { cost: 0, retail: 0, units: 0 };
      byLocation.set(loc, { cost: prevLoc.cost + costVal, retail: prevLoc.retail + retailVal, units: prevLoc.units + item.current_stock });
    });

    return {
      totalCost,
      totalRetail,
      totalMargin: totalRetail - totalCost,
      marginPercent: totalRetail > 0 ? ((totalRetail - totalCost) / totalRetail * 100) : 0,
      byCategory: Array.from(byCategory.entries()).map(([cat, v]) => ({ category: cat, ...v })).sort((a, b) => b.cost - a.cost),
      byLocation: Array.from(byLocation.entries()).map(([loc, v]) => ({ location: loc, ...v })),
    };
  }, [items]);

  // ── Cost history chart data for selected product ──
  const costChartData = useMemo(() => {
    if (costHistory.length === 0) return [];
    return costHistory
      .slice()
      .reverse()
      .map(h => ({
        date: fmtDate(h.created_at),
        cost: h.new_cost,
        previous: h.previous_cost,
      }));
  }, [costHistory]);

  // ── Item-level valuation table ──
  const valuationItems = useMemo(() => {
    return items
      .filter(i => i.current_stock > 0)
      .map(i => ({
        ...i,
        total_cost: i.unit_cost * i.current_stock,
        total_retail: i.unit_price * i.current_stock,
        margin_pct: i.unit_price > 0 ? ((i.unit_price - i.unit_cost) / i.unit_price * 100) : 0,
      }))
      .sort((a, b) => b.total_cost - a.total_cost);
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Valor Total (Costo)" value={fmt(summary.totalCost)} icon={<DollarSign size={16} />} color="bg-[var(--success-subtle)] text-[var(--success)]" />
        <SummaryCard label="Valor Total (Retail)" value={fmt(summary.totalRetail)} icon={<DollarSign size={16} />} color="bg-[var(--info-subtle)] text-[var(--info)]" />
        <SummaryCard label="Margen Total" value={fmt(summary.totalMargin)} icon={<TrendingUp size={16} />} color="bg-accent-gold/10 text-accent-gold" />
        <SummaryCard label="Margen %" value={fmtPct(summary.marginPercent)} icon={<TrendingUp size={16} />} color="bg-[var(--accent-subtle)] text-[var(--accent)]" />
      </div>

      {/* Cost history chart */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-wood-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-gold" /> Historial de Costos
          </h4>
          <select value={selectedSku} onChange={e => setSelectedSku(e.target.value)}
            className="px-3 py-1.5 text-xs bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none min-w-[200px]">
            <option value="">Todos los productos</option>
            {items.map(i => (
              <option key={i.variant_id} value={i.sku}>{i.title} ({i.sku})</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="h-[200px] flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-wood-300" /></div>
        ) : costChartData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-wood-400">
            Sin historial de cambios de costo
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={costChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => fmt(Number(v ?? 0))} />
              <Line type="stepAfter" dataKey="cost" name="Costo actual" stroke="#C5A065" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="stepAfter" dataKey="previous" name="Costo anterior" stroke="#d4c4a8" strokeWidth={1} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Cost history table */}
        {costHistory.length > 0 && (
          <div className="mt-4 border-t border-wood-100 pt-4">
            <h5 className="text-[10px] font-bold text-wood-400 uppercase tracking-wider mb-2">Cambios Recientes</h5>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {costHistory.slice(0, 15).map((h, i) => (
                <div key={h.id || i} className="flex items-center justify-between py-1.5 px-3 bg-sand-50 rounded-[var(--radius-card)] text-xs">
                  <div className="flex-1 min-w-0">
                    <span className="text-wood-900 font-medium">{h.product_title}</span>
                    <span className="text-wood-400 ml-2 font-mono text-[10px]">{h.sku}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-wood-500">{fmt(h.previous_cost)} → <span className="font-bold text-wood-900">{fmt(h.new_cost)}</span></span>
                    <span className={`text-[10px] font-bold ${h.change_percent > 0 ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                      {h.change_percent > 0 ? '+' : ''}{fmtPct(h.change_percent)}
                    </span>
                    <span className="text-[10px] text-wood-400">{fmtDate(h.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Valuation by category */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-5">
        <h4 className="text-sm font-bold text-wood-900 mb-4">Valoración por Categoría</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={summary.byCategory} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
            <XAxis dataKey="category" tick={{ fontSize: 9 }} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => fmt(Number(v ?? 0))} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="cost" name="Costo" fill="#C5A065" radius={[4, 4, 0, 0]} />
            <Bar dataKey="retail" name="Retail" fill="#2d2419" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Item valuation table */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-wood-100">
          <h4 className="text-sm font-bold text-wood-900">Detalle de Valoración por Producto</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Costo Ud.</th>
                <th className="px-4 py-3 text-right">Precio Ud.</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Valor Costo</th>
                <th className="px-4 py-3 text-right">Valor Retail</th>
                <th className="px-4 py-3 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {valuationItems.map(item => (
                <tr key={item.variant_id} className="hover:bg-sand-50/50">
                  <td className="px-4 py-3 text-xs text-wood-900">{item.title}</td>
                  <td className="px-4 py-3 text-xs text-wood-500 font-mono">{item.sku}</td>
                  <td className="px-4 py-3 text-xs text-right text-wood-600">{fmt(item.unit_cost)}</td>
                  <td className="px-4 py-3 text-xs text-right text-wood-900">{fmt(item.unit_price)}</td>
                  <td className="px-4 py-3 text-xs text-right font-bold text-wood-900">{item.current_stock}</td>
                  <td className="px-4 py-3 text-xs text-right text-wood-600">{fmt(item.total_cost)}</td>
                  <td className="px-4 py-3 text-xs text-right text-wood-900 font-bold">{fmt(item.total_retail)}</td>
                  <td className="px-4 py-3 text-xs text-right">
                    <span className={`font-bold ${item.margin_pct > 40 ? 'text-[var(--success)]' : item.margin_pct > 20 ? 'text-amber-600' : 'text-[var(--error)]'}`}>
                      {fmtPct(item.margin_pct)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-sand-50 text-xs font-bold text-wood-900 border-t border-wood-200">
                <td colSpan={5} className="px-4 py-3">TOTAL</td>
                <td className="px-4 py-3 text-right">{fmt(summary.totalCost)}</td>
                <td className="px-4 py-3 text-right">{fmt(summary.totalRetail)}</td>
                <td className="px-4 py-3 text-right">{fmtPct(summary.marginPercent)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm p-4">
    <div className={`w-8 h-8 rounded-[var(--radius-card)] flex items-center justify-center ${color} mb-2`}>{icon}</div>
    <p className="text-xl font-sans text-wood-900">{value}</p>
    <p className="text-[10px] text-wood-400 uppercase tracking-wider mt-0.5">{label}</p>
  </div>
);

export default ValuationTab;
