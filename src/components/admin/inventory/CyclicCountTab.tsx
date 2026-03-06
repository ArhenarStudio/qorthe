"use client";

// ═══════════════════════════════════════════════════════════════
// CyclicCountTab — Schedule and execute inventory cycle counts
// Partial counts, discrepancy reports, auto-adjustments
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Plus, Play, CheckCircle, AlertTriangle, X, Loader2,
  ChevronDown, ChevronUp, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  CyclicCount, CountItem, CountStatus, InventoryItem,
  COUNT_STATUS_CONFIG, fmtDate, fmtDateTime,
} from "./types";

interface Props {
  items: InventoryItem[];
  locations: string[];
  onRefresh: () => void;
}

export const CyclicCountTab: React.FC<Props> = ({ items, locations, onRefresh }) => {
  const [counts, setCounts] = useState<CyclicCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState<CyclicCount | null>(null);

  // Create form
  const [location, setLocation] = useState(locations[0] || "");
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [countNotes, setCountNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory?action=counts");
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const createCount = async () => {
    if (!location) return;
    setSubmitting(true);
    try {
      // Items filtered by location
      const locationItems = items.filter(i => i.location === location);
      const countItems: CountItem[] = locationItems.map(i => ({
        variant_id: i.variant_id,
        product_title: i.title,
        sku: i.sku,
        system_stock: i.current_stock,
        counted_stock: null,
        discrepancy: null,
        adjusted: false,
        notes: "",
      }));

      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_count",
          location,
          scheduled_date: scheduledDate,
          items: countItems,
          notes: countNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Conteo ${data.count_number} programado`);
        setShowCreate(false);
        setCountNotes("");
        fetchCounts();
      } else {
        toast.error(data.error || "Error al crear conteo");
      }
    } catch { toast.error("Error de conexión"); }
    finally { setSubmitting(false); }
  };

  const startCount = async (id: string) => {
    const count = counts.find(c => c.id === id);
    if (!count) return;
    try {
      await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_count", count_id: id, status: "in_progress" }),
      });
      toast.success("Conteo iniciado");
      fetchCounts();
      setActiveCount({ ...count, status: "in_progress" });
    } catch { toast.error("Error"); }
  };

  const updateCountItem = (variantId: string, countedStock: number | null) => {
    if (!activeCount) return;
    setActiveCount(prev => {
      if (!prev) return prev;
      const updatedItems = prev.items.map(item =>
        item.variant_id === variantId
          ? {
              ...item,
              counted_stock: countedStock,
              discrepancy: countedStock !== null ? countedStock - item.system_stock : null,
            }
          : item
      );
      return {
        ...prev,
        items: updatedItems,
        counted_items: updatedItems.filter(i => i.counted_stock !== null).length,
        discrepancies: updatedItems.filter(i => i.discrepancy !== null && i.discrepancy !== 0).length,
      };
    });
  };

  const tryCompleteCount = () => {
    if (!activeCount) return;
    const uncounted = activeCount.items.filter(i => i.counted_stock === null).length;
    if (uncounted > 0) {
      setShowCompleteConfirm(true);
      return;
    }
    completeCount();
  };

  const completeCount = async () => {
    if (!activeCount) return;
    setShowCompleteConfirm(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete_count",
          count_id: activeCount.id,
          items: activeCount.items,
          auto_adjust: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Conteo completado. ${data.adjustments || 0} ajustes aplicados`);
        setActiveCount(null);
        fetchCounts();
        onRefresh();
      }
    } catch { toast.error("Error"); }
    finally { setSubmitting(false); }
  };

  // ── Active count view ──
  if (activeCount) {
    const progress = activeCount.total_items > 0
      ? Math.round((activeCount.counted_items / activeCount.total_items) * 100)
      : 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-wood-900">
            Conteo Activo: {activeCount.count_number} — {activeCount.location}
          </h4>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveCount(null)} className="px-3 py-1.5 text-xs text-wood-500 border border-wood-200 rounded-lg">
              Volver
            </button>
            <button onClick={tryCompleteCount} disabled={submitting}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50">
              <CheckCircle size={14} /> {submitting ? "Guardando..." : "Completar Conteo"}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-wood-600">Progreso: {activeCount.counted_items}/{activeCount.total_items}</span>
            <span className="text-xs font-bold text-wood-900">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-wood-100 rounded-full overflow-hidden">
            <div className="h-full bg-accent-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          {activeCount.discrepancies > 0 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} /> {activeCount.discrepancies} discrepancias encontradas
            </p>
          )}
        </div>

        {/* Count items */}
        <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-center">Sistema</th>
                <th className="px-4 py-3 text-center">Conteo</th>
                <th className="px-4 py-3 text-center">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {activeCount.items.map((item, idx) => {
                const hasDiscrepancy = item.discrepancy !== null && item.discrepancy !== 0;
                return (
                  <tr key={idx} className={`hover:bg-sand-50/50 ${hasDiscrepancy ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-4 py-3 text-xs text-wood-900">{item.product_title}</td>
                    <td className="px-4 py-3 text-xs text-wood-500 font-mono">{item.sku}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-wood-700">{item.system_stock}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min={0}
                        value={item.counted_stock ?? ""}
                        onChange={e => updateCountItem(item.variant_id, e.target.value === "" ? null : parseInt(e.target.value))}
                        className="w-20 px-2 py-1.5 text-xs text-center bg-white border border-wood-200 rounded-lg outline-none focus:border-accent-gold"
                        placeholder="—"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.discrepancy !== null ? (
                        <span className={`text-xs font-bold ${item.discrepancy === 0 ? 'text-green-600' : item.discrepancy > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                          {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                        </span>
                      ) : (
                        <span className="text-xs text-wood-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {showCompleteConfirm && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-wood-900">Productos sin contar</p>
              <p className="text-xs text-wood-600 mt-1">
                Hay {activeCount.items.filter(i => i.counted_stock === null).length} productos sin contar.
                ¿Completar el conteo de todos modos? Los productos sin contar no generarán ajustes.
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setShowCompleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-wood-500 border border-wood-200 rounded-lg hover:bg-white">
                  Cancelar
                </button>
                <button onClick={completeCount}
                  className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-bold">
                  Sí, completar conteo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Default: list of counts ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-wood-900 flex items-center gap-2">
          <ClipboardList size={16} className="text-accent-gold" /> Conteos Cíclicos
        </h4>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800">
          <Plus size={14} /> Programar Conteo
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border border-accent-gold/30 shadow-sm p-5 space-y-4">
          <h5 className="text-xs font-bold text-wood-900 uppercase tracking-wider">Nuevo Conteo</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Ubicación</label>
              <select value={location} onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none">
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Fecha programada</label>
              <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Notas</label>
              <input value={countNotes} onChange={e => setCountNotes(e.target.value)} placeholder="Opcional..."
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-wood-400">
              {items.filter(i => i.location === location).length} productos en {location}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-wood-500">Cancelar</button>
              <button onClick={createCount} disabled={submitting}
                className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-lg hover:bg-wood-800 disabled:opacity-50">
                {submitting ? "Creando..." : "Programar Conteo"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-wood-300" /></div>
        ) : counts.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={32} className="text-wood-200 mx-auto mb-3" />
            <p className="text-xs text-wood-400">Sin conteos programados</p>
          </div>
        ) : (
          <div className="divide-y divide-wood-50">
            {counts.map(c => {
              const isExpanded = expandedId === c.id;
              const statusCfg = COUNT_STATUS_CONFIG[c.status];
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-sand-50/50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <ClipboardList size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wood-900">{c.count_number}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </div>
                      <p className="text-[11px] text-wood-500 mt-0.5">
                        {c.location} · {c.total_items} productos · Programado: {fmtDate(c.scheduled_date)}
                      </p>
                    </div>
                    {c.discrepancies > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold">
                        {c.discrepancies} disc.
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} className="text-wood-400" /> : <ChevronDown size={14} className="text-wood-400" />}
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-sand-50/50 space-y-3">
                      {c.notes && <p className="text-[11px] text-wood-500">Notas: {c.notes}</p>}
                      <div className="flex gap-2">
                        {c.status === 'scheduled' && (
                          <button onClick={(e) => { e.stopPropagation(); startCount(c.id); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-accent-gold text-wood-900 text-[10px] font-bold rounded-lg hover:shadow-md">
                            <Play size={12} /> Iniciar Conteo
                          </button>
                        )}
                        {c.status === 'in_progress' && (
                          <button onClick={(e) => { e.stopPropagation(); setActiveCount(c); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg hover:bg-blue-100">
                            <ClipboardList size={12} /> Continuar Conteo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CyclicCountTab;
