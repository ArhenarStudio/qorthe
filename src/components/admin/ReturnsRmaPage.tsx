"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw, Search, Eye, MessageSquare,
  Camera, Clock, CheckCircle, XCircle, AlertTriangle,
  ArrowLeft, DollarSign, Settings, TrendingDown, BarChart3, X
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type RmaStatus = 'requested' | 'reviewing' | 'approved' | 'rejected' | 'pickup' | 'inspection' | 'refunded' | 'exchanged' | 'credit';
type RmaTab = 'list' | 'policies' | 'metrics';

interface RmaRequest {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  status: RmaStatus;
  amount: string;
  date: string;
  hasPhotos: boolean;
  hasEngraving: boolean;
  resolution: 'refund' | 'exchange' | 'credit' | null;
  notes: string;
}

const statusConfig: Record<RmaStatus, { label: string; color: string; bg: string }> = {
  requested: { label: 'Solicitada', color: 'text-blue-600', bg: 'bg-blue-50' },
  reviewing: { label: 'En revision', color: 'text-amber-600', bg: 'bg-amber-50' },
  approved: { label: 'Aprobada', color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: 'Rechazada', color: 'text-red-500', bg: 'bg-red-50' },
  pickup: { label: 'Recoleccion', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  inspection: { label: 'En inspeccion', color: 'text-purple-600', bg: 'bg-purple-50' },
  refunded: { label: 'Reembolsado', color: 'text-green-700', bg: 'bg-green-50' },
  exchanged: { label: 'Cambiado', color: 'text-teal-600', bg: 'bg-teal-50' },
  credit: { label: 'Credito otorgado', color: 'text-cyan-600', bg: 'bg-cyan-50' },
};

const mockRmas: RmaRequest[] = [
  { id: 'RMA-001', orderId: '#162', customer: 'Maria Garcia', product: 'Tabla Parota Rustica', reason: 'Producto danado en envio', status: 'reviewing', amount: '$2,450', date: '28 Feb 2026', hasPhotos: true, hasEngraving: false, resolution: null, notes: 'Esquina astillada, fotos adjuntas' },
  { id: 'RMA-002', orderId: '#158', customer: 'Carlos Mendez', product: 'Set Cubiertos Nogal', reason: 'No cumple expectativas', status: 'requested', amount: '$1,890', date: '27 Feb 2026', hasPhotos: false, hasEngraving: false, resolution: null, notes: '' },
  { id: 'RMA-003', orderId: '#155', customer: 'Ana Lopez', product: 'Bowl Artesanal Maple', reason: 'Producto defectuoso', status: 'approved', amount: '$780', date: '25 Feb 2026', hasPhotos: true, hasEngraving: false, resolution: 'exchange', notes: 'Grieta en la base, se aprueba cambio' },
  { id: 'RMA-004', orderId: '#150', customer: 'Roberto Diaz', product: 'Caja Joyero Cerezo', reason: 'Error en pedido', status: 'pickup', amount: '$1,350', date: '22 Feb 2026', hasPhotos: false, hasEngraving: false, resolution: 'refund', notes: 'Se envio color incorrecto' },
  { id: 'RMA-005', orderId: '#148', customer: 'Sofia Ruiz', product: 'Tabla Nogal Premium', reason: 'Producto danado en envio', status: 'refunded', amount: '$3,200', date: '20 Feb 2026', hasPhotos: true, hasEngraving: true, resolution: 'refund', notes: 'Danada en transito, reembolso completo' },
  { id: 'RMA-006', orderId: '#145', customer: 'Miguel Torres', product: 'Portavinos Parota', reason: 'No cumple expectativas', status: 'rejected', amount: '$1,650', date: '18 Feb 2026', hasPhotos: false, hasEngraving: true, resolution: null, notes: 'Producto con grabado personalizado, no aplica devolucion' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className}>{children}</div>;
}

function Badge({ text, variant = 'gray' }: { text: string; variant?: string }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-600', red: 'bg-red-50 text-red-500', amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600', gray: 'bg-wood-50 text-wood-500', purple: 'bg-purple-50 text-purple-600',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + (cls[variant] || cls.gray)}>{text}</span>;
}

function StatCard({ label, value, icon: Icon, trend, trendLabel }: { label: string; value: string; icon: React.ElementType; trend?: string; trendLabel?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center">
          <Icon size={14} className="text-accent-gold" />
        </div>
        {trend && <span className={'text-[10px] font-medium ' + (trend.startsWith('-') ? 'text-green-600' : 'text-red-500')}>{trend}</span>}
      </div>
      <p className="text-lg font-serif text-wood-900">{value}</p>
      <p className="text-[10px] text-wood-400">{label}</p>
      {trendLabel && <p className="text-[9px] text-wood-300 mt-0.5">{trendLabel}</p>}
    </Card>
  );
}

// ===== DETAIL MODAL =====
function RmaDetail({ rma, onClose }: { rma: RmaRequest; onClose: () => void }) {
  const st = statusConfig[rma.status];
  const timeline = [
    { label: 'Solicitud recibida', date: rma.date, done: true },
    { label: 'En revision', date: rma.status !== 'requested' ? '1 dia despues' : '', done: ['reviewing','approved','rejected','pickup','inspection','refunded','exchanged','credit'].includes(rma.status) },
    { label: rma.status === 'rejected' ? 'Rechazada' : 'Aprobada', date: '', done: ['approved','rejected','pickup','inspection','refunded','exchanged','credit'].includes(rma.status) },
    { label: 'Producto recogido', date: '', done: ['pickup','inspection','refunded','exchanged','credit'].includes(rma.status) },
    { label: 'Inspeccion', date: '', done: ['inspection','refunded','exchanged','credit'].includes(rma.status) },
    { label: 'Resolucion', date: '', done: ['refunded','exchanged','credit'].includes(rma.status) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-12 px-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl border border-wood-100 shadow-xl w-full max-w-2xl mb-12">
        <div className="flex items-center justify-between px-5 py-4 border-b border-wood-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-wood-400 hover:text-wood-600"><ArrowLeft size={16} /></button>
            <div>
              <h3 className="text-sm font-serif text-wood-900">{rma.id}</h3>
              <p className="text-[10px] text-wood-400">Pedido {rma.orderId} · {rma.date}</p>
            </div>
          </div>
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-1">Cliente</p>
              <p className="text-xs text-wood-900 font-medium">{rma.customer}</p>
            </div>
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-1">Producto</p>
              <p className="text-xs text-wood-900 font-medium">{rma.product}</p>
              {rma.hasEngraving && <Badge text="Con grabado" variant="amber" />}
            </div>
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-1">Motivo</p>
              <p className="text-xs text-wood-700">{rma.reason}</p>
            </div>
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-1">Monto</p>
              <p className="text-xs text-wood-900 font-bold">{rma.amount} MXN</p>
            </div>
          </div>

          {/* Photos */}
          {rma.hasPhotos && (
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-2">Fotos del cliente</p>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-20 h-20 rounded-lg bg-wood-100 flex items-center justify-center">
                    <Camera size={14} className="text-wood-300" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {rma.notes && (
            <div>
              <p className="text-[10px] text-wood-400 uppercase mb-1">Notas</p>
              <p className="text-xs text-wood-600 bg-sand-50 rounded-lg p-3">{rma.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-[10px] text-wood-400 uppercase mb-3">Progreso</p>
            <div className="space-y-0">
              {timeline.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={'w-5 h-5 rounded-full flex items-center justify-center ' + (step.done ? 'bg-accent-gold text-white' : 'bg-wood-100 text-wood-300')}>
                      {step.done ? <CheckCircle size={10} /> : <div className="w-2 h-2 rounded-full bg-wood-200" />}
                    </div>
                    {i < timeline.length - 1 && <div className={'w-0.5 h-6 ' + (step.done ? 'bg-accent-gold/30' : 'bg-wood-100')} />}
                  </div>
                  <div className="pb-4">
                    <p className={'text-xs ' + (step.done ? 'text-wood-900 font-medium' : 'text-wood-400')}>{step.label}</p>
                    {step.date && <p className="text-[10px] text-wood-400">{step.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {(rma.status === 'requested' || rma.status === 'reviewing') && (
            <div className="flex gap-2 pt-2 border-t border-wood-100">
              <button onClick={() => { toast.success('Devolucion aprobada'); onClose(); }} className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5">
                <CheckCircle size={12} /> Aprobar
              </button>
              <button onClick={() => { toast.success('Devolucion rechazada'); onClose(); }} className="px-4 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1.5">
                <XCircle size={12} /> Rechazar
              </button>
              <button className="px-4 py-2 text-xs border border-wood-200 text-wood-500 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
                <MessageSquare size={12} /> Solicitar mas info
              </button>
            </div>
          )}

          {/* Resolution */}
          {rma.status === 'approved' && (
            <div className="border-t border-wood-100 pt-4">
              <p className="text-[10px] text-wood-400 uppercase mb-2">Seleccionar resolucion</p>
              <div className="flex gap-2">
                {[{ v: 'refund', l: 'Reembolso completo', ic: DollarSign }, { v: 'exchange', l: 'Cambio de producto', ic: RotateCcw }, { v: 'credit', l: 'Credito en tienda', ic: DollarSign }].map(r => (
                  <button key={r.v} onClick={() => toast.success(`Resolucion: ${r.l}`)} className="flex-1 flex flex-col items-center gap-1.5 p-3 border border-wood-200 rounded-lg hover:border-accent-gold hover:bg-accent-gold/5 transition-colors">
                    <r.ic size={14} className="text-wood-400" />
                    <span className="text-[10px] text-wood-600">{r.l}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===== POLICIES TAB =====
function PoliciesTab() {
  const policies = [
    { type: 'Productos estandar', days: 15, refundable: true, notes: 'Sin usar, empaque original' },
    { type: 'Productos con grabado laser', days: 0, refundable: false, notes: 'Personalizados — no devolucion' },
    { type: 'Servicio de grabado', days: 0, refundable: false, notes: 'No reembolsable' },
    { type: 'Cotizaciones custom', days: 0, refundable: false, notes: 'No reembolsable despues de iniciar produccion' },
    { type: 'Danado en envio', days: 30, refundable: true, notes: 'Reembolso completo o reenvio — fotos obligatorias' },
    { type: 'Producto defectuoso', days: 90, refundable: true, notes: 'Cambio gratuito + envio DSD' },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider border-b border-wood-100 pb-2 mb-4">Politicas de devolucion DSD</h4>
        <div className="space-y-3">
          {policies.map(p => (
            <div key={p.type} className="flex items-center gap-4 p-3 bg-sand-50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-medium text-wood-900">{p.type}</p>
                <p className="text-[10px] text-wood-400 mt-0.5">{p.notes}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-wood-700">{p.days > 0 ? `${p.days} dias` : 'N/A'}</p>
                {p.refundable ? <Badge text="Reembolsable" variant="green" /> : <Badge text="No reembolsable" variant="red" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider border-b border-wood-100 pb-2 mb-4">Configuracion general</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-wood-700">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
            Requiere fotos obligatorias para danos en envio
          </label>
          <label className="flex items-center gap-2 text-xs text-wood-700">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
            Enviar email automatico al recibir solicitud
          </label>
          <label className="flex items-center gap-2 text-xs text-wood-700">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
            Notificar al admin de solicitudes nuevas
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-wood-600">Tiempo maximo de respuesta:</span>
            <input defaultValue="48" className="w-14 border border-wood-200 rounded-lg px-2 py-1 text-xs text-center" />
            <span className="text-xs text-wood-400">horas</span>
          </div>
        </div>
      </Card>

      <button onClick={() => toast.success('Politicas guardadas')} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors">
        Guardar politicas
      </button>
    </div>
  );
}

// ===== METRICS TAB =====
function MetricsTab() {
  const reasons = [
    { reason: 'Danado en envio', count: 12, pct: 40 },
    { reason: 'No cumple expectativas', count: 8, pct: 27 },
    { reason: 'Producto defectuoso', count: 5, pct: 17 },
    { reason: 'Error en pedido', count: 3, pct: 10 },
    { reason: 'Otro', count: 2, pct: 6 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total devoluciones (30d)" value="30" icon={RotateCcw} trend="-12%" trendLabel="vs mes anterior" />
        <StatCard label="Tasa de devolucion" value="3.2%" icon={TrendingDown} trend="-0.5%" />
        <StatCard label="Costo total reembolsos" value="$18,500" icon={DollarSign} />
        <StatCard label="Tiempo promedio resolucion" value="2.4 dias" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider mb-4">Motivos mas frecuentes</h4>
          <div className="space-y-3">
            {reasons.map(r => (
              <div key={r.reason}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-wood-700">{r.reason}</span>
                  <span className="text-[10px] text-wood-400">{r.count} ({r.pct}%)</span>
                </div>
                <div className="h-1.5 bg-wood-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-gold rounded-full" style={{ width: r.pct + '%' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h4 className="text-xs font-medium text-wood-900 uppercase tracking-wider mb-4">Resoluciones aplicadas</h4>
          <div className="space-y-3">
            {[
              { type: 'Reembolso completo', count: 15, pct: 50, color: 'bg-green-500' },
              { type: 'Cambio de producto', count: 9, pct: 30, color: 'bg-blue-500' },
              { type: 'Credito en tienda', count: 4, pct: 13, color: 'bg-purple-500' },
              { type: 'Rechazadas', count: 2, pct: 7, color: 'bg-red-400' },
            ].map(r => (
              <div key={r.type} className="flex items-center gap-3">
                <div className={'w-2 h-2 rounded-full ' + r.color} />
                <span className="text-xs text-wood-700 flex-1">{r.type}</span>
                <span className="text-xs font-medium text-wood-900">{r.count}</span>
                <span className="text-[10px] text-wood-400 w-8 text-right">{r.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ===== MAIN =====
export const ReturnsRmaPage: React.FC = () => {
  const [tab, setTab] = useState<RmaTab>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RmaStatus | 'all'>('all');
  const [selectedRma, setSelectedRma] = useState<RmaRequest | null>(null);

  const filtered = mockRmas.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.customer.toLowerCase().includes(search.toLowerCase()) && !r.product.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabs: Array<{ id: RmaTab; label: string; icon: React.ElementType }> = [
    { id: 'list', label: 'Solicitudes', icon: RotateCcw },
    { id: 'policies', label: 'Politicas', icon: Settings },
    { id: 'metrics', label: 'Metricas', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-wood-900 flex items-center gap-2">
            <RotateCcw size={20} className="text-accent-gold" /> Devoluciones y Garantias
          </h1>
          <p className="text-xs text-wood-400 mt-0.5">Gestiona solicitudes de devolucion, cambios y reembolsos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-wood-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 ' + (tab === t.id ? 'border-accent-gold text-accent-gold font-medium' : 'border-transparent text-wood-500 hover:text-wood-700')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por ID, cliente o producto..." className="w-full pl-9 pr-3 py-2 border border-wood-200 rounded-lg text-xs outline-none focus:border-accent-gold/50" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white">
              <option value="all">Todos los estados</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Pedido</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-50">
                  {filtered.map(r => {
                    const st = statusConfig[r.status];
                    return (
                      <tr key={r.id} className="hover:bg-sand-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono font-medium text-wood-900">{r.id}</td>
                        <td className="px-4 py-3 text-xs text-accent-gold cursor-pointer hover:underline">{r.orderId}</td>
                        <td className="px-4 py-3 text-xs text-wood-700">{r.customer}</td>
                        <td className="px-4 py-3 text-xs text-wood-700">
                          <span>{r.product}</span>
                          {r.hasEngraving && <span className="ml-1 text-[9px] text-amber-500">★ Grabado</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-wood-500">{r.reason}</td>
                        <td className="px-4 py-3 text-xs font-medium text-wood-900">{r.amount}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span></td>
                        <td className="px-4 py-3 text-xs text-wood-400">{r.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {r.hasPhotos && <Camera size={12} className="text-wood-400" />}
                            <button onClick={() => setSelectedRma(r)} className="p-1 rounded hover:bg-wood-100 text-wood-400 hover:text-accent-gold transition-colors">
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === 'policies' && <PoliciesTab />}
      {tab === 'metrics' && <MetricsTab />}

      <AnimatePresence>
        {selectedRma && <RmaDetail rma={selectedRma} onClose={() => setSelectedRma(null)} />}
      </AnimatePresence>
    </div>
  );
};