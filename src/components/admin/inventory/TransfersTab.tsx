"use client";

// ═══════════════════════════════════════════════════════════════
// TransfersTab — Stock transfers between locations
// Create, ship, receive, cancel transfers with full tracking
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowRightLeft, Plus, Truck, CheckCircle, X, Loader2, ChevronDown, ChevronUp, Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  StockTransfer, TransferItem, TransferStatus, InventoryItem,
  TRANSFER_STATUS_CONFIG, fmt, fmtDateTime,
} from "./types";

interface Props {
  items: InventoryItem[];
  locations: string[];
  onRefresh: () => void;
}

export const TransfersTab: React.FC<Props> = ({ items, locations, onRefresh }) => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create form state
  const [fromLoc, setFromLoc] = useState(locations[0] || "");
  const [toLoc, setToLoc] = useState(locations[1] || "");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [addSku, setAddSku] = useState("");

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory?action=transfers");
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers || []);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const addItemToTransfer = () => {
    if (!addSku.trim()) return;
    const item = items.find(i => i.sku.toLowerCase() === addSku.toLowerCase() || i.title.toLowerCase().includes(addSku.toLowerCase()));
    if (!item) { toast.error("Producto no encontrado"); return; }
    if (transferItems.some(t => t.variant_id === item.variant_id)) { toast.error("Ya agregado"); return; }
    setTransferItems(prev => [...prev, {
      variant_id: item.variant_id,
      product_title: item.title,
      sku: item.sku,
      quantity: 1,
    }]);
    setAddSku("");
  };

  const createTransfer = async () => {
    if (fromLoc === toLoc) { toast.error("Origen y destino deben ser diferentes"); return; }
    if (transferItems.length === 0) { toast.error("Agrega al menos un producto"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_transfer",
          from_location: fromLoc,
          to_location: toLoc,
          items: transferItems,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Transferencia ${data.transfer_number} creada`);
        setShowCreate(false);
        setTransferItems([]);
        setNotes("");
        fetchTransfers();
        onRefresh();
      } else {
        toast.error(data.error || "Error al crear transferencia");
      }
    } catch { toast.error("Error de conexión"); }
    finally { setSubmitting(false); }
  };

  const updateTransferStatus = async (id: string, newStatus: TransferStatus) => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_transfer", transfer_id: id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Transferencia actualizada a: ${TRANSFER_STATUS_CONFIG[newStatus].label}`);
        fetchTransfers();
        onRefresh();
      }
    } catch { toast.error("Error al actualizar"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-wood-900 flex items-center gap-2">
          <ArrowRightLeft size={16} className="text-accent-gold" /> Transferencias entre Ubicaciones
        </h4>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 text-sand-100 text-xs rounded-[var(--radius-card)] hover:bg-wood-800">
          <Plus size={14} /> Nueva Transferencia
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-accent-gold/30 shadow-sm p-5 space-y-4">
          <h5 className="text-xs font-bold text-wood-900 uppercase tracking-wider">Nueva Transferencia</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Origen</label>
              <select value={fromLoc} onChange={e => setFromLoc(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none">
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Destino</label>
              <select value={toLoc} onChange={e => setToLoc(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none">
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Add items */}
          <div>
            <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Agregar producto (SKU o nombre)</label>
            <div className="flex gap-2">
              <input value={addSku} onChange={e => setAddSku(e.target.value)} placeholder="Buscar producto..."
                onKeyDown={e => e.key === 'Enter' && addItemToTransfer()}
                className="flex-1 px-3 py-2 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none" />
              <button onClick={addItemToTransfer} className="px-3 py-2 bg-accent-gold/15 text-accent-gold text-xs rounded-[var(--radius-card)] hover:bg-accent-gold/25">
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Items list */}
          {transferItems.length > 0 && (
            <div className="space-y-2">
              {transferItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-sand-50 rounded-[var(--radius-card)]">
                  <Package size={14} className="text-wood-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-wood-900 truncate">{item.product_title}</p>
                    <p className="text-[10px] text-wood-400 font-mono">{item.sku}</p>
                  </div>
                  <input type="number" min={1} value={item.quantity}
                    onChange={e => setTransferItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: parseInt(e.target.value) || 1 } : it))}
                    className="w-16 px-2 py-1 text-xs text-center bg-[var(--surface)] border border-wood-200 rounded" />
                  <button onClick={() => setTransferItems(prev => prev.filter((_, i) => i !== idx))}
                    className="text-wood-300 hover:text-[var(--error)]"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Notas</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observaciones..."
              className="w-full px-3 py-2 text-sm bg-sand-50 border border-wood-200 rounded-[var(--radius-card)] outline-none" />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-wood-500">Cancelar</button>
            <button onClick={createTransfer} disabled={submitting || transferItems.length === 0}
              className="px-4 py-2 text-xs bg-wood-900 text-sand-100 rounded-[var(--radius-card)] hover:bg-wood-800 disabled:opacity-50">
              {submitting ? "Creando..." : "Crear Transferencia"}
            </button>
          </div>
        </div>
      )}

      {/* Transfers list */}
      <div className="bg-[var(--surface)] rounded-[var(--radius-card)] border border-wood-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-wood-300" /></div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowRightLeft size={32} className="text-wood-200 mx-auto mb-3" />
            <p className="text-xs text-wood-400">Sin transferencias registradas</p>
          </div>
        ) : (
          <div className="divide-y divide-wood-50">
            {transfers.map(t => {
              const isExpanded = expandedId === t.id;
              const statusCfg = TRANSFER_STATUS_CONFIG[t.status];
              const totalItems = (t.items || []).reduce((s, i) => s + i.quantity, 0);
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-sand-50/50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                    <div className="w-8 h-8 rounded-[var(--radius-card)] bg-indigo-50 flex items-center justify-center">
                      <ArrowRightLeft size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-wood-900">{t.transfer_number}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-[var(--radius-badge)] font-bold ${statusCfg.cls}`}>{statusCfg.label}</span>
                      </div>
                      <p className="text-[11px] text-wood-500 mt-0.5">
                        {t.from_location} → {t.to_location} · {totalItems} unidades · {(t.items || []).length} productos
                      </p>
                    </div>
                    <span className="text-[10px] text-wood-400">{fmtDateTime(t.created_at)}</span>
                    {isExpanded ? <ChevronUp size={14} className="text-wood-400" /> : <ChevronDown size={14} className="text-wood-400" />}
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-sand-50/50">
                      <div className="space-y-2 mb-3">
                        {(t.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2 bg-[var(--surface)] rounded-[var(--radius-card)] text-xs">
                            <div>
                              <span className="text-wood-900 font-medium">{item.product_title}</span>
                              <span className="text-wood-400 font-mono ml-2">{item.sku}</span>
                            </div>
                            <span className="text-wood-900 font-bold">{item.quantity} uds</span>
                          </div>
                        ))}
                      </div>
                      {t.notes && <p className="text-[11px] text-wood-500 mb-3">Notas: {t.notes}</p>}
                      <div className="flex gap-2">
                        {t.status === 'pending' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); updateTransferStatus(t.id, 'in_transit'); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--info-subtle)] text-[var(--info)] text-[10px] font-bold rounded-[var(--radius-card)] hover:bg-[var(--info-subtle)]">
                              <Truck size={12} /> Marcar En Tránsito
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); updateTransferStatus(t.id, 'cancelled'); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--error-subtle)] text-[var(--error)] text-[10px] font-bold rounded-[var(--radius-card)] hover:bg-[var(--error-subtle)]">
                              <X size={12} /> Cancelar
                            </button>
                          </>
                        )}
                        {t.status === 'in_transit' && (
                          <button onClick={(e) => { e.stopPropagation(); updateTransferStatus(t.id, 'completed'); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--success-subtle)] text-[var(--success)] text-[10px] font-bold rounded-[var(--radius-card)] hover:bg-[var(--success-subtle)]">
                            <CheckCircle size={12} /> Confirmar Recepción
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

export default TransfersTab;
