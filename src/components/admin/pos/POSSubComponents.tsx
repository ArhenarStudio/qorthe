"use client";

// ═══════════════════════════════════════════════════════════════
// POS Sub-Components — OrderConfirmation, OrderHistory, printReceipt
// ═══════════════════════════════════════════════════════════════

import React from "react";
import {
  Plus, DollarSign, Search, CheckCircle, Receipt, FileText,
  Copy, Globe, Zap, BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  POSOrderResult, POSOrderHistoryItem, POSDailyStats, POSCustomer,
  Channel, channelConfig, fmtMXN,
} from "./types";

// ═══════ Print Receipt ═══════

export const printReceipt = (order: POSOrderResult, total: number, customer: POSCustomer) => {
  const w = window.open("", "_blank", "width=380,height=600");
  if (!w) return;
  const date = new Date().toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
  const orderNum = order.display_id
    ? `<div class="row"><span>Pedido:</span><span class="bold">#${order.display_id}</span></div>` : "";
  const clientName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "—";
  const html = [
    "<!DOCTYPE html><html><head><title>Recibo POS</title>",
    "<style>",
    "* { margin: 0; padding: 0; box-sizing: border-box; }",
    "body { font-family: monospace; font-size: 12px; width: 300px; padding: 16px; color: #111; }",
    ".center { text-align: center; } .bold { font-weight: bold; }",
    ".line { border-top: 1px dashed #999; margin: 8px 0; }",
    ".row { display: flex; justify-content: space-between; margin: 3px 0; }",
    ".total { font-size: 15px; font-weight: bold; }",
    "@media print { .no-print { display: none; } }",
    "</style></head><body>",
    '<div class="center bold" style="font-size:14px;margin-bottom:4px">DavidSon\'s Design</div>',
    '<div class="center" style="color:#666;margin-bottom:12px">davidsonsdesign.com</div>',
    '<div class="line"></div>',
    `<div class="row"><span>Fecha:</span><span>${date}</span></div>`,
    orderNum,
    `<div class="row"><span>Cliente:</span><span>${clientName}</span></div>`,
    '<div class="line"></div>',
    `<div class="row bold"><span>TOTAL</span><span class="total">$${total.toFixed(0)} MXN</span></div>`,
    '<div class="line"></div>',
    '<div class="center" style="color:#666;margin-top:12px;font-size:10px">Gracias por su compra!</div>',
    '<div class="no-print center" style="margin-top:16px">',
    '<button onclick="window.print()" style="padding:8px 20px;cursor:pointer">Imprimir</button>',
    "</div></body></html>",
  ].join("\n");
  w.document.write(html);
  w.document.close();
};

// ═══════ OrderConfirmation ═══════

export const OrderConfirmation: React.FC<{
  order: POSOrderResult;
  total: number;
  customer: POSCustomer;
  onNewOrder: () => void;
}> = ({ order, total, customer, onNewOrder }) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-[var(--success-subtle)] rounded-none flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-[var(--success)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Pedido Creado</h2>
      <p className="text-[var(--text-secondary)] mb-1">{customer.first_name} {customer.last_name}</p>
      <p className="text-3xl font-bold text-[var(--accent)] mb-6">{fmtMXN(total)}</p>
      {order.id && (
        <p className="text-xs text-[var(--text-muted)] bg-[var(--surface2)] px-4 py-2 rounded-none inline-block mb-6 font-mono">
          ID: {order.id}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={onNewOrder}
          className="px-6 py-3 text-white rounded-none text-sm font-bold flex items-center gap-2"
          style={{ background: "var(--primary)" }}>
          <Plus size={16} /> Nuevo Pedido
        </button>
        <button onClick={() => printReceipt(order, total, customer)}
          className="px-4 py-3 rounded-none text-sm font-medium border flex items-center gap-2"
          style={{ background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          <FileText size={14} /> Recibo
        </button>
        <button onClick={() => { if (order.id) { navigator.clipboard.writeText(order.id); toast.success("ID copiado"); } }}
          className="px-4 py-3 rounded-none text-sm font-medium border flex items-center gap-2"
          style={{ background: "var(--surface)", color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          <Copy size={14} /> Copiar ID
        </button>
      </div>
    </div>
  </div>
);

// ═══════ OrderHistory ═══════

export const OrderHistory: React.FC<{ orders: POSOrderHistoryItem[]; stats?: POSDailyStats }> = ({ orders, stats }) => {
  const [histSearch, setHistSearch] = React.useState("");
  const [histChannel, setHistChannel] = React.useState<string>("all");
  const [histPeriod, setHistPeriod] = React.useState<string>("all");

  const filteredOrders = React.useMemo(() => {
    let result = orders;
    if (histSearch.trim()) {
      const q = histSearch.toLowerCase();
      result = result.filter(o =>
        o.customer_name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        String(o.display_id).includes(q)
      );
    }
    if (histChannel !== "all") result = result.filter(o => o.channel === histChannel);
    if (histPeriod !== "all") {
      const cutoff = new Date();
      if (histPeriod === "today") cutoff.setHours(0, 0, 0, 0);
      else if (histPeriod === "week") cutoff.setDate(cutoff.getDate() - 7);
      else if (histPeriod === "month") cutoff.setDate(cutoff.getDate() - 30);
      result = result.filter(o => new Date(o.created_at) >= cutoff);
    }
    return result;
  }, [orders, histSearch, histChannel, histPeriod]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input type="text" value={histSearch} onChange={e => setHistSearch(e.target.value)}
            placeholder="Buscar por nombre, email o #pedido..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
        </div>
        <select value={histChannel} onChange={e => setHistChannel(e.target.value)}
          className="px-2 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
          <option value="all">Todos los canales</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Teléfono</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="in_person">En persona</option>
          <option value="other">Otro</option>
        </select>
        <select value={histPeriod} onChange={e => setHistPeriod(e.target.value)}
          className="px-2 py-2 text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
          <option value="all">Todo el tiempo</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Último mes</option>
        </select>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Ventas hoy", value: fmtMXN(stats.today_revenue), icon: DollarSign, color: "text-[var(--success)]" },
            { label: "Pedidos hoy", value: stats.today_count, icon: Receipt, color: "text-[var(--info)]" },
            { label: "Pedidos POS", value: stats.pos_count, icon: Zap, color: "text-[var(--accent)]" },
            { label: "Total histórico", value: stats.total_count, icon: BarChart3, color: "text-[var(--text-secondary)]" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] rounded-none border border-[var(--border)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} className={s.color} />
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">{s.label}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Orders table */}
      <div className="bg-[var(--surface)] rounded-none border border-[var(--border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--text)]">Pedidos recientes</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)] text-sm">
              {orders.length === 0 ? "No hay pedidos aún" : "Sin resultados para el filtro"}
            </div>
          ) : (
            filteredOrders.map((o) => {
              const isPos = o.source === "pos";
              const chCfg = channelConfig[o.channel as Channel] || channelConfig.other;
              const ChIcon = chCfg.icon;
              return (
                <div key={o.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface2)]/50 transition-colors">
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center ${
                    isPos ? "bg-[var(--accent)]/10" : o.source === "quote" ? "bg-[var(--accent-subtle)]" : "bg-[var(--info-subtle)]"
                  }`}>
                    {isPos ? <Zap size={14} className="text-[var(--accent)]" /> :
                     o.source === "quote" ? <FileText size={14} className="text-[var(--accent)]" /> :
                     <Globe size={14} className="text-[var(--info)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text)]">#{o.display_id}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{o.customer_name || o.email}</span>
                      {isPos && (
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium ${chCfg.color}`}>
                          <ChIcon size={8} /> {chCfg.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {new Date(o.created_at).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      {" · "}{o.items_count} items
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[var(--text)]">{fmtMXN(o.total)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
