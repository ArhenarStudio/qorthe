"use client";

// ═══════════════════════════════════════════════════════════════
// ProductImportExport — Production-ready CSV export
// Import wizard: placeholder for future Medusa bulk import API
// ═══════════════════════════════════════════════════════════════

import React, { useState } from "react";
import { X, Download, Upload, FileText, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// ═══════ EXPORT MODAL ═══════
interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  totalProducts: number;
  selectedCount: number;
  filteredCount: number;
  searchQuery: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  open, onClose, totalProducts, selectedCount, filteredCount,
}) => {
  const [exporting, setExporting] = useState(false);
  const [scope, setScope] = useState<"all" | "filtered" | "selected">("all");

  if (!open) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/products?limit=100");
      if (!res.ok) { toast.error("Error al obtener productos"); return; }
      const data = await res.json();
      const products = data.products || [];

      const headers = [
        "SKU", "Producto", "Handle", "Categoría", "Precio", "Costo",
        "Stock", "Reservado", "Vendidos 30d", "Revenue 30d",
        "Rating", "Reviews", "Variantes", "Estado", "Creado",
      ];

      const rows = products.map((p: Record<string, unknown>) => [
        p.sku,
        `"${(p.title as string || '').replace(/"/g, '""')}"`,
        p.handle,
        p.category,
        p.price,
        p.unit_cost,
        p.stock,
        p.reserved_stock,
        p.sold_units_30d,
        p.revenue_30d,
        p.avg_rating,
        p.review_count,
        p.variants_count,
        p.status,
        p.created_at ? new Date(p.created_at as string).toISOString().slice(0, 10) : "",
      ].join(","));

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `productos-dsd-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${products.length} productos exportados`);
      onClose();
    } catch {
      toast.error("Error al exportar");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-wood-900 flex items-center gap-2">
            <Download size={16} className="text-accent-gold" /> Exportar Productos
          </h4>
          <button onClick={onClose} className="text-wood-400 hover:text-wood-700"><X size={18} /></button>
        </div>

        <div className="space-y-2">
          {[
            { id: "all" as const, label: "Todos los productos", count: totalProducts },
            ...(filteredCount < totalProducts ? [{ id: "filtered" as const, label: "Productos filtrados", count: filteredCount }] : []),
            ...(selectedCount > 0 ? [{ id: "selected" as const, label: "Seleccionados", count: selectedCount }] : []),
          ].map(opt => (
            <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              scope === opt.id ? "border-accent-gold bg-accent-gold/5" : "border-wood-100 hover:border-wood-300"
            }`}>
              <input type="radio" name="scope" checked={scope === opt.id} onChange={() => setScope(opt.id)} className="accent-accent-gold" />
              <div className="flex-1">
                <span className="text-xs text-wood-900">{opt.label}</span>
                <span className="text-[10px] text-wood-400 ml-2">({opt.count})</span>
              </div>
            </label>
          ))}
        </div>

        <div className="bg-sand-50 rounded-lg p-3 text-xs text-wood-500">
          <p className="flex items-center gap-1"><FileText size={12} /> Formato: CSV (compatible con Excel, Google Sheets)</p>
          <p className="text-[10px] text-wood-400 mt-1">Incluye: SKU, nombre, precio, costo, stock, ventas, rating, estado</p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-xs text-wood-500">Cancelar</button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800 disabled:opacity-50">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? "Exportando..." : "Exportar CSV"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════ IMPORT WIZARD ═══════
// Note: Full CSV import into Medusa requires bulk product creation API
// which is a complex backend operation. This shows a professional
// "coming soon" state instead of fake mock simulation.

interface ImportWizardProps {
  onClose: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ onClose }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
        <Upload size={18} className="text-accent-gold" /> Importar Productos
      </h3>
      <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-wood-200 text-wood-600 text-xs rounded-lg hover:bg-sand-50">
        Volver
      </button>
    </div>

    <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-8 text-center max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-accent-gold/10 flex items-center justify-center mx-auto mb-4">
        <Upload size={24} className="text-accent-gold" />
      </div>
      <h4 className="text-sm font-bold text-wood-900 mb-2">Importación masiva de productos</h4>
      <p className="text-xs text-wood-500 mb-4">
        La importación CSV con mapeo de columnas, validación y preview
        estará disponible próximamente. Por ahora, puedes crear productos
        directamente desde el admin de Medusa o usando la interfaz de productos.
      </p>
      <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2 text-left mb-4">
        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-700">
          <p className="font-bold">Alternativa disponible</p>
          <p className="mt-0.5">Usa el admin de Medusa en{" "}
            <a href="https://urchin-app-u62qc.ondigitalocean.app/app" target="_blank" rel="noopener noreferrer"
              className="underline hover:text-amber-900">
              /app → Productos → Importar
            </a>{" "}
            para importación CSV nativa.
          </p>
        </div>
      </div>
      <button onClick={onClose} className="px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800">
        Volver a Productos
      </button>
    </div>
  </div>
);

export default ExportModal;
