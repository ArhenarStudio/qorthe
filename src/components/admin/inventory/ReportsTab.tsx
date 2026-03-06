"use client";

// ═══════════════════════════════════════════════════════════════
// ReportsTab — ABC Analysis, rotation reports, stagnant products
// ═══════════════════════════════════════════════════════════════

import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, AlertTriangle, TrendingUp, Package, Download } from "lucide-react";
import {
  InventoryItem, StockMovement, ABCCategory, ABCItem,
  ABC_CONFIG, fmt, fmtPct,
} from "./types";

const COLORS_ABC = { A: '#22c55e', B: '#f59e0b', C: '#ef4444' };

interface Props {
  items: InventoryItem[];
  movements: StockMovement[];
}

export const ReportsTab: React.FC<Props> = ({ items, movements }) => {
  const [reportView, setReportView] = useState<"abc" | "stagnant" | "rotation">("abc");

  // ── Calculate sales per variant (last 90 days) ──
  const salesMap90d = useMemo(() => {
    const map = new Map<string, number>();
    const cutoff = Date.now() - 90 * 86400000;
    movements.forEach(m => {
      if (m.type !== 'sale') return;
      if (new Date(m.created_at).getTime() < cutoff) return;
      map.set(m.inventory_item_id, (map.get(m.inventory_item_id) || 0) + Math.abs(m.quantity));
    });
    return map;
  }, [movements]);

  // ── ABC Analysis ──
  const abcData = useMemo(() => {
    const enriched: ABCItem[] = items.map(item => {
      const sold90d = salesMap90d.get(item.variant_id) || 0;
      const revenue = sold90d * item.unit_price;
      const avgDaily = sold90d / 90;
      const doi = avgDaily > 0 ? Math.round(item.current_stock / avgDaily) : 999;
      return {
        variant_id: item.variant_id,
        product_title: item.title,
        sku: item.sku,
        category: 'C' as ABCCategory,
        total_sold_90d: sold90d,
        revenue_90d: revenue,
        revenue_pct: 0,
        cumulative_pct: 0,
        days_of_inventory: doi,
        avg_daily_sales: avgDaily,
        is_stagnant: sold90d === 0 && item.current_stock > 0,
      };
    }).sort((a, b) => b.revenue_90d - a.revenue_90d);

    const totalRevenue = enriched.reduce((s, i) => s + i.revenue_90d, 0);
    let cumPct = 0;

    enriched.forEach(item => {
      item.revenue_pct = totalRevenue > 0 ? (item.revenue_90d / totalRevenue * 100) : 0;
      cumPct += item.revenue_pct;
      item.cumulative_pct = cumPct;

      if (cumPct <= 80) item.category = 'A';
      else if (cumPct <= 95) item.category = 'B';
      else item.category = 'C';
    });

    const aItems = enriched.filter(i => i.category === 'A');
    const bItems = enriched.filter(i => i.category === 'B');
    const cItems = enriched.filter(i => i.category === 'C');

    return {
      items: enriched,
      summary: {
        a_count: aItems.length,
        a_revenue_pct: aItems.reduce((s, i) => s + i.revenue_pct, 0),
        b_count: bItems.length,
        b_revenue_pct: bItems.reduce((s, i) => s + i.revenue_pct, 0),
        c_count: cItems.length,
        c_revenue_pct: cItems.reduce((s, i) => s + i.revenue_pct, 0),
      },
      pieData: [
        { name: `A (${aItems.length})`, value: aItems.reduce((s, i) => s + i.revenue_90d, 0), fill: COLORS_ABC.A },
        { name: `B (${bItems.length})`, value: bItems.reduce((s, i) => s + i.revenue_90d, 0), fill: COLORS_ABC.B },
        { name: `C (${cItems.length})`, value: cItems.reduce((s, i) => s + i.revenue_90d, 0), fill: COLORS_ABC.C },
      ],
    };
  }, [items, salesMap90d]);

  // ── Stagnant products (no sales in 90 days, stock > 0) ──
  const stagnantItems = useMemo(() => abcData.items.filter(i => i.is_stagnant), [abcData]);

  // ── Rotation data ──
  const rotationData = useMemo(() => {
    return abcData.items
      .filter(i => i.avg_daily_sales > 0)
      .map(i => ({
        name: i.sku,
        doi: i.days_of_inventory,
        daily: Math.round(i.avg_daily_sales * 100) / 100,
      }))
      .sort((a, b) => a.doi - b.doi);
  }, [abcData]);

  const exportCSV = () => {
    const rows = abcData.items.map(i =>
      `${i.sku},"${i.product_title}",${i.category},${i.total_sold_90d},${i.revenue_90d.toFixed(2)},${i.revenue_pct.toFixed(1)},${i.cumulative_pct.toFixed(1)},${i.days_of_inventory},${i.avg_daily_sales.toFixed(2)},${i.is_stagnant}`
    );
    const csv = ['SKU,Producto,Categoría ABC,Vendidos 90d,Ingreso 90d,% Ingreso,% Acumulado,Días Inv,Ventas/día,Estancado', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte-abc-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const viewButtons: { id: typeof reportView; label: string }[] = [
    { id: "abc", label: "Análisis ABC" },
    { id: "stagnant", label: `Estancados (${stagnantItems.length})` },
    { id: "rotation", label: "Rotación" },
  ];

  return (
    <div className="space-y-6">
      {/* View selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {viewButtons.map(v => (
          <button key={v.id} onClick={() => setReportView(v.id)}
            className={`px-4 py-2 text-xs rounded-lg transition-colors ${
              reportView === v.id ? 'bg-wood-900 text-sand-100' : 'bg-white text-wood-600 border border-wood-100 hover:border-wood-300'
            }`}>
            {v.label}
          </button>
        ))}
        <button onClick={exportCSV}
          className="px-4 py-2 text-xs rounded-lg bg-white text-wood-600 border border-wood-100 hover:border-wood-300 flex items-center gap-1.5 ml-auto">
          <Download size={12} /> Exportar CSV
        </button>
      </div>

      {/* ABC View */}
      {reportView === "abc" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {(["A", "B", "C"] as ABCCategory[]).map(cat => {
              const cfg = ABC_CONFIG[cat];
              const count = cat === 'A' ? abcData.summary.a_count : cat === 'B' ? abcData.summary.b_count : abcData.summary.c_count;
              const pct = cat === 'A' ? abcData.summary.a_revenue_pct : cat === 'B' ? abcData.summary.b_revenue_pct : abcData.summary.c_revenue_pct;
              return (
                <div key={cat} className={`rounded-xl border p-4 ${cfg.cls}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-bold mt-1">{cfg.label}</p>
                  <p className="text-[10px] mt-0.5">{fmtPct(pct)} del ingreso</p>
                  <p className="text-[10px] opacity-70">{cfg.description}</p>
                </div>
              );
            })}
          </div>

          {/* Pie chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
              <h4 className="text-sm font-bold text-wood-900 mb-4">Distribución de Ingreso ABC</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={abcData.pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                    paddingAngle={3} dataKey="value" nameKey="name"
                    label={({ name, value }: { name?: string; value?: number }) => `${name}: ${fmt(value || 0)}`}
                    labelLine={{ strokeWidth: 0.5 }}>
                    {abcData.pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => fmt(Number(v ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top A products */}
            <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
              <h4 className="text-sm font-bold text-wood-900 mb-3">Top Productos A</h4>
              <div className="space-y-2">
                {abcData.items.filter(i => i.category === 'A').slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-wood-50 last:border-0">
                    <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 text-[10px] flex items-center justify-center font-bold">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-wood-900 truncate">{item.product_title}</p>
                      <p className="text-[10px] text-wood-400">{item.total_sold_90d} vendidos · {item.days_of_inventory} días inv.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-wood-900">{fmt(item.revenue_90d)}</p>
                      <p className="text-[10px] text-green-600">{fmtPct(item.revenue_pct)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full ABC table */}
          <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-wood-100">
              <h4 className="text-sm font-bold text-wood-900">Clasificación ABC Completa</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-4 py-3">Cat.</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Vendidos (90d)</th>
                    <th className="px-4 py-3 text-right">Ingreso (90d)</th>
                    <th className="px-4 py-3 text-right">% Ingreso</th>
                    <th className="px-4 py-3 text-right">% Acum.</th>
                    <th className="px-4 py-3 text-right">Días Inv.</th>
                    <th className="px-4 py-3 text-right">Ventas/día</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {abcData.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sand-50/50">
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${ABC_CONFIG[item.category].cls}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-wood-900">{item.product_title}</td>
                      <td className="px-4 py-2.5 text-xs text-wood-500 font-mono">{item.sku}</td>
                      <td className="px-4 py-2.5 text-xs text-right font-bold text-wood-900">{item.total_sold_90d}</td>
                      <td className="px-4 py-2.5 text-xs text-right text-wood-900">{fmt(item.revenue_90d)}</td>
                      <td className="px-4 py-2.5 text-xs text-right text-wood-600">{fmtPct(item.revenue_pct)}</td>
                      <td className="px-4 py-2.5 text-xs text-right text-wood-400">{fmtPct(item.cumulative_pct)}</td>
                      <td className="px-4 py-2.5 text-xs text-right">
                        <span className={`font-bold ${item.days_of_inventory > 90 ? 'text-red-500' : item.days_of_inventory > 30 ? 'text-amber-600' : 'text-green-600'}`}>
                          {item.days_of_inventory >= 999 ? '∞' : item.days_of_inventory}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-right text-wood-500">
                        {item.avg_daily_sales > 0 ? item.avg_daily_sales.toFixed(2) : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Stagnant view */}
      {reportView === "stagnant" && (
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-wood-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h4 className="text-sm font-bold text-wood-900">Productos Estancados (0 ventas en 90 días)</h4>
          </div>
          {stagnantItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-wood-400">Sin productos estancados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-right">Valor Costo</th>
                    <th className="px-4 py-3 text-right">Valor Retail</th>
                    <th className="px-4 py-3 text-right">Capital Inmovilizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {stagnantItems.map((item, idx) => {
                    const matchingItem = items.find(i => i.variant_id === item.variant_id);
                    const cost = (matchingItem?.unit_cost || 0) * (matchingItem?.current_stock || 0);
                    const retail = (matchingItem?.unit_price || 0) * (matchingItem?.current_stock || 0);
                    return (
                      <tr key={idx} className="hover:bg-amber-50/30">
                        <td className="px-4 py-3 text-xs text-wood-900 font-medium">{item.product_title}</td>
                        <td className="px-4 py-3 text-xs text-wood-500 font-mono">{item.sku}</td>
                        <td className="px-4 py-3 text-xs text-right font-bold text-wood-900">{matchingItem?.current_stock || 0}</td>
                        <td className="px-4 py-3 text-xs text-right text-wood-600">{fmt(cost)}</td>
                        <td className="px-4 py-3 text-xs text-right text-wood-900">{fmt(retail)}</td>
                        <td className="px-4 py-3 text-xs text-right text-red-500 font-bold">{fmt(cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {stagnantItems.length > 0 && (
            <div className="px-4 py-3 bg-amber-50 border-t border-amber-200">
              <p className="text-xs text-amber-700">
                Capital total inmovilizado: <strong>
                  {fmt(stagnantItems.reduce((s, i) => {
                    const match = items.find(it => it.variant_id === i.variant_id);
                    return s + (match ? match.unit_cost * match.current_stock : 0);
                  }, 0))}
                </strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rotation view */}
      {reportView === "rotation" && (
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-5">
          <h4 className="text-sm font-bold text-wood-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-gold" /> Días de Inventario por Producto
          </h4>
          {rotationData.length === 0 ? (
            <p className="text-xs text-wood-400 text-center py-8">Sin datos de rotación suficientes</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, rotationData.length * 35)}>
              <BarChart data={rotationData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} tickLine={false} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  formatter={(v, name) => [name === 'doi' ? `${v} días` : String(v), name === 'doi' ? 'Días inventario' : 'Ventas/día']} />
                <Bar dataKey="doi" name="Días de inventario" fill="#C5A065" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
