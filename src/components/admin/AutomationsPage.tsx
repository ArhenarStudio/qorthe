"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Plus, Search, Filter, Play, Pause, Trash2, Copy, MoreHorizontal,
  ChevronRight, ChevronDown, Check, X, Clock, TrendingUp, Mail, Bell as BellIcon,
  Tag, Gift, Users, ShoppingCart, Package, Star, FileText, Truck, Megaphone,
  DollarSign, ShoppingBag, Heart, AlertTriangle, ArrowRight, Settings,
  Eye, BarChart3, Webhook, MessageSquare, Timer, Edit3, Activity
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type AutoStatus = 'active' | 'paused' | 'draft';
type NodeType = 'trigger' | 'condition' | 'action' | 'delay';
type ViewMode = 'list' | 'templates' | 'editor';

interface WorkflowNode {
  id: string;
  type: NodeType;
  category: string;
  label: string;
  icon: React.ElementType;
  config?: Record<string, string>;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutoStatus;
  nodes: WorkflowNode[];
  executions: number;
  executions30d: number;
  lastRun: string;
  lastResult: 'success' | 'error' | 'none';
  successRate: number;
  impact: string;
  createdAt: string;
  isTemplate?: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  popular?: boolean;
}

// ===== DATA =====
const statusCfg: Record<AutoStatus, { label: string; cls: string; dotCls: string }> = {
  active: { label: 'Activa', cls: 'bg-green-50 text-green-700 border-green-200', dotCls: 'bg-green-500' },
  paused: { label: 'Pausada', cls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-500' },
  draft: { label: 'Borrador', cls: 'bg-wood-50 text-wood-500 border-wood-200', dotCls: 'bg-wood-400' },
};

const nodeCfg: Record<NodeType, { label: string; color: string; bg: string; border: string }> = {
  trigger: { label: 'Trigger', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
  condition: { label: 'Condicion', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  action: { label: 'Accion', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
  delay: { label: 'Esperar', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300' },
};

// Trigger options
const triggerOptions = [
  { cat: 'Pedido', items: [
    { id: 't_order_new', label: 'Nuevo pedido', icon: ShoppingCart },
    { id: 't_order_paid', label: 'Pedido pagado', icon: DollarSign },
    { id: 't_order_shipped', label: 'Pedido enviado', icon: Truck },
    { id: 't_order_delivered', label: 'Pedido entregado', icon: Check },
    { id: 't_order_cancelled', label: 'Pedido cancelado', icon: X },
  ]},
  { cat: 'Producto', items: [
    { id: 't_stock_low', label: 'Stock bajo', icon: AlertTriangle },
    { id: 't_stock_out', label: 'Producto agotado', icon: Package },
    { id: 't_price_changed', label: 'Precio cambiado', icon: DollarSign },
  ]},
  { cat: 'Cliente', items: [
    { id: 't_customer_new', label: 'Cliente registrado', icon: Users },
    { id: 't_customer_first', label: 'Primera compra', icon: ShoppingBag },
    { id: 't_customer_tier_up', label: 'Subio de tier', icon: TrendingUp },
    { id: 't_customer_inactive', label: 'Inactivo X dias', icon: Clock },
    { id: 't_customer_birthday', label: 'Cumpleanos', icon: Gift },
  ]},
  { cat: 'Cotizacion', items: [
    { id: 't_quote_new', label: 'Nueva cotizacion', icon: FileText },
    { id: 't_quote_approved', label: 'Cotizacion aprobada', icon: Check },
    { id: 't_quote_expired', label: 'Cotizacion vencida', icon: Clock },
  ]},
  { cat: 'Review', items: [
    { id: 't_review_new', label: 'Nueva review', icon: Star },
    { id: 't_review_negative', label: 'Review negativa (1-2)', icon: AlertTriangle },
  ]},
  { cat: 'Carrito', items: [
    { id: 't_cart_abandoned', label: 'Carrito abandonado', icon: ShoppingCart },
  ]},
];

const conditionOptions = [
  { id: 'c_tier', label: 'Tier del cliente es...', icon: Users },
  { id: 'c_total', label: 'Total del pedido >...', icon: DollarSign },
  { id: 'c_category', label: 'Categoria del producto es...', icon: Tag },
  { id: 'c_engraving', label: 'Tiene grabado laser', icon: Edit3 },
  { id: 'c_segment', label: 'Segmento del cliente es...', icon: Users },
  { id: 'c_city', label: 'Ciudad del cliente es...', icon: Truck },
  { id: 'c_time', label: 'Hora entre X-Y', icon: Clock },
  { id: 'c_spend', label: 'Gasto total del cliente >...', icon: DollarSign },
];

const actionOptions = [
  { id: 'a_email_client', label: 'Enviar email al cliente', icon: Mail },
  { id: 'a_email_admin', label: 'Enviar email al admin', icon: Mail },
  { id: 'a_notify', label: 'Notificar admin (in-app)', icon: BellIcon },
  { id: 'a_tag', label: 'Agregar tag', icon: Tag },
  { id: 'a_points', label: 'Agregar/quitar puntos', icon: Gift },
  { id: 'a_coupon', label: 'Generar cupon personalizado', icon: Megaphone },
  { id: 'a_assign', label: 'Asignar a vendedor/usuario', icon: Users },
  { id: 'a_webhook', label: 'Enviar webhook', icon: Webhook },
  { id: 'a_update_field', label: 'Actualizar campo', icon: Edit3 },
  { id: 'a_delay', label: 'Esperar X horas/dias', icon: Timer },
];

// Example automation templates — visual reference for future workflow engine
const exampleAutomations: Automation[] = [
  {
    id: 'auto1', name: 'Bienvenida VIP', description: 'Cuando un cliente sube a Oro, envia email de felicitacion + 500 puntos bonus',
    status: 'active',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Cliente', label: 'Subio de tier', icon: TrendingUp },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Tier = Oro', icon: Users },
      { id: 'n3', type: 'action', category: 'Email', label: 'Email felicitacion VIP', icon: Mail },
      { id: 'n4', type: 'action', category: 'Puntos', label: '+500 puntos bonus', icon: Gift },
    ],
    executions: 47, executions30d: 12, lastRun: 'Hace 3 dias', lastResult: 'success',
    successRate: 100, impact: '23,500 puntos otorgados', createdAt: '15 Ene 2025',
  },
  {
    id: 'auto2', name: 'Recuperar carrito', description: 'Carrito abandonado 24h con total >$500 → email con 10% desc',
    status: 'active',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Carrito', label: 'Carrito abandonado 24h', icon: ShoppingCart },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Total > $500 MXN', icon: DollarSign },
      { id: 'n3', type: 'action', category: 'Cupon', label: 'Generar cupon -10%', icon: Megaphone },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email recuperacion', icon: Mail },
    ],
    executions: 183, executions30d: 34, lastRun: 'Hace 6h', lastResult: 'success',
    successRate: 94, impact: '$18,420 en ventas recuperadas', createdAt: '01 Feb 2025',
  },
  {
    id: 'auto3', name: 'Alerta stock bajo', description: 'Stock <3 unidades → notificar admin + email proveedor',
    status: 'active',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Producto', label: 'Stock < 3 unidades', icon: AlertTriangle },
      { id: 'n2', type: 'action', category: 'Notificacion', label: 'Notificar admin urgente', icon: BellIcon },
      { id: 'n3', type: 'action', category: 'Email', label: 'Email a proveedor', icon: Mail },
    ],
    executions: 28, executions30d: 5, lastRun: 'Hace 2 dias', lastResult: 'success',
    successRate: 100, impact: '0 agotados este mes', createdAt: '10 Ene 2025',
  },
  {
    id: 'auto4', name: 'Review negativa → Alerta', description: 'Review 1-2 estrellas → notificar admin urgente + asignar a atencion',
    status: 'active',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Review', label: 'Review negativa (1-2★)', icon: Star },
      { id: 'n2', type: 'action', category: 'Notificacion', label: 'Notificar admin urgente', icon: BellIcon },
      { id: 'n3', type: 'action', category: 'Asignar', label: 'Asignar a Atencion al cliente', icon: Users },
    ],
    executions: 8, executions30d: 2, lastRun: 'Hace 5 dias', lastResult: 'success',
    successRate: 100, impact: '100% reviews respondidas < 24h', createdAt: '20 Ene 2025',
  },
  {
    id: 'auto5', name: 'Cliente dormido 60d', description: 'Inactivo 60 dias + Plata o mas → email "te extranamos" + cupon 15%',
    status: 'paused',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Cliente', label: 'Inactivo 60 dias', icon: Clock },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Tier >= Plata', icon: Users },
      { id: 'n3', type: 'action', category: 'Cupon', label: 'Generar cupon -15%', icon: Megaphone },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email "te extranamos"', icon: Mail },
    ],
    executions: 31, executions30d: 0, lastRun: 'Hace 45 dias', lastResult: 'success',
    successRate: 87, impact: '$9,200 en reactivaciones', createdAt: '05 Feb 2025',
  },
  {
    id: 'auto6', name: 'Pedido VIP rush', description: 'Pedido de cliente Platino → notificar taller prioridad + email especial',
    status: 'draft',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Pedido', label: 'Nuevo pedido', icon: ShoppingCart },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Cliente es Platino', icon: Users },
      { id: 'n3', type: 'action', category: 'Notificacion', label: 'Notificar taller: PRIORIDAD', icon: BellIcon },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email confirmacion VIP', icon: Mail },
    ],
    executions: 0, executions30d: 0, lastRun: 'Nunca', lastResult: 'none',
    successRate: 0, impact: '—', createdAt: '28 Feb 2026',
  },
];

const templates: Template[] = [
  { id: 'tpl1', name: 'Bienvenida VIP', description: 'Cliente sube a Oro → Email felicitacion + 500 puntos bonus', category: 'Lealtad', popular: true,
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Cliente', label: 'Subio de tier', icon: TrendingUp },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Tier = Oro', icon: Users },
      { id: 'n3', type: 'action', category: 'Email', label: 'Email felicitacion', icon: Mail },
      { id: 'n4', type: 'action', category: 'Puntos', label: '+500 puntos', icon: Gift },
    ],
  },
  { id: 'tpl2', name: 'Recuperar carrito', description: 'Carrito abandonado 24h + total >$500 → Email con 10% desc', category: 'Ventas', popular: true,
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Carrito', label: 'Abandonado 24h', icon: ShoppingCart },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Total > $500', icon: DollarSign },
      { id: 'n3', type: 'action', category: 'Cupon', label: 'Generar -10%', icon: Megaphone },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email recuperacion', icon: Mail },
    ],
  },
  { id: 'tpl3', name: 'Alerta stock bajo', description: 'Stock <3 unidades → Notificar admin + Email proveedor', category: 'Inventario',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Producto', label: 'Stock < 3', icon: AlertTriangle },
      { id: 'n2', type: 'action', category: 'Notificacion', label: 'Alerta admin', icon: BellIcon },
      { id: 'n3', type: 'action', category: 'Email', label: 'Email proveedor', icon: Mail },
    ],
  },
  { id: 'tpl4', name: 'Review follow-up', description: 'Review negativa → Notificar admin urgente + Asignar atencion', category: 'Atencion',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Review', label: 'Review negativa', icon: Star },
      { id: 'n2', type: 'action', category: 'Notificacion', label: 'Alerta urgente', icon: BellIcon },
      { id: 'n3', type: 'action', category: 'Asignar', label: 'Asignar a atencion', icon: Users },
    ],
  },
  { id: 'tpl5', name: 'Upsell grabado', description: 'Pedido sin grabado + total >$800 → Email sugiriendo grabado laser', category: 'Ventas',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Pedido', label: 'Pedido pagado', icon: DollarSign },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Sin grabado + total >$800', icon: Edit3 },
      { id: 'n3', type: 'delay', category: 'Esperar', label: 'Esperar 2 horas', icon: Timer },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email upsell grabado', icon: Mail },
    ],
  },
  { id: 'tpl6', name: 'Cliente dormido', description: 'Inactivo 60d + tier Plata+ → Email "te extranamos" + cupon 15%', category: 'Retencion',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Cliente', label: 'Inactivo 60d', icon: Clock },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Tier >= Plata', icon: Users },
      { id: 'n3', type: 'action', category: 'Cupon', label: 'Generar -15%', icon: Megaphone },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email reactivacion', icon: Mail },
    ],
  },
  { id: 'tpl7', name: 'B2B nurture', description: 'Cotizacion corporativa aprobada → Tag "B2B" + Asignar vendedor', category: 'B2B',
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Cotizacion', label: 'Cotizacion aprobada', icon: Check },
      { id: 'n2', type: 'action', category: 'Tag', label: 'Agregar tag "B2B"', icon: Tag },
      { id: 'n3', type: 'action', category: 'Asignar', label: 'Asignar vendedor', icon: Users },
    ],
  },
  { id: 'tpl8', name: 'Pedido VIP rush', description: 'Pedido de Platino → Notificar taller "prioridad" + Email especial', category: 'VIP', popular: true,
    nodes: [
      { id: 'n1', type: 'trigger', category: 'Pedido', label: 'Nuevo pedido', icon: ShoppingCart },
      { id: 'n2', type: 'condition', category: 'Filtro', label: 'Cliente = Platino', icon: Users },
      { id: 'n3', type: 'action', category: 'Notificacion', label: 'Taller: PRIORIDAD', icon: BellIcon },
      { id: 'n4', type: 'action', category: 'Email', label: 'Email VIP', icon: Mail },
    ],
  },
];

// ===== SHARED COMPONENTS =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className}>{children}</div>;
}

function WorkflowPreview({ nodes, compact = false }: { nodes: WorkflowNode[]; compact?: boolean }) {
  return (
    <div className={'flex items-center gap-1 ' + (compact ? 'flex-wrap' : 'overflow-x-auto pb-1')}>
      {nodes.map((node, i) => {
        const cfg = nodeCfg[node.type];
        const Icon = node.icon;
        return (
          <React.Fragment key={node.id}>
            <div className={
              'flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] whitespace-nowrap shrink-0 ' +
              cfg.bg + ' ' + cfg.border + ' ' + cfg.color
            }>
              <Icon size={10} />
              <span>{node.label}</span>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight size={10} className="text-wood-300 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ===== LIST VIEW =====
function AutomationsList({ automations, onEdit, onToggle }: {
  automations: Automation[];
  onEdit: (a: Automation) => void;
  onToggle: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AutoStatus>('all');

  const filtered = automations.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount = automations.filter(a => a.status === 'active').length;
  const totalExec30d = automations.reduce((s, a) => s + a.executions30d, 0);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total automatizaciones', value: automations.length.toString(), sub: `${activeCount} activas` },
          { label: 'Ejecuciones (30d)', value: totalExec30d.toString(), sub: 'Ultimos 30 dias' },
          { label: 'Tasa de exito', value: '96%', sub: 'Promedio global' },
          { label: 'Impacto estimado', value: '$27,620', sub: 'Ingresos atribuidos' },
        ].map(k => (
          <Card key={k.label} className="p-3">
            <p className="text-lg font-serif text-wood-900">{k.value}</p>
            <p className="text-[10px] text-wood-400">{k.label}</p>
            <p className="text-[9px] text-accent-gold mt-0.5">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar automatizaciones..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-wood-200 rounded-lg outline-none focus:border-accent-gold/50 bg-white"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'paused', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                'px-2.5 py-1.5 text-[10px] rounded-lg border transition-colors ' +
                (statusFilter === s ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-medium' : 'border-wood-200 text-wood-500 hover:bg-wood-50')
              }
            >
              {s === 'all' ? 'Todas' : statusCfg[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Automations list */}
      <div className="space-y-3">
        {filtered.map(auto => {
          const sCfg = statusCfg[auto.status];
          return (
            <Card key={auto.id} className="p-4 hover:border-wood-200 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-accent-gold/10 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-accent-gold" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-medium text-wood-900 truncate">{auto.name}</h4>
                        <span className={'text-[9px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ' + sCfg.cls}>
                          <span className={'w-1.5 h-1.5 rounded-full ' + sCfg.dotCls} />
                          {sCfg.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-wood-400 truncate">{auto.description}</p>
                    </div>
                  </div>

                  {/* Workflow preview */}
                  <div className="mt-2">
                    <WorkflowPreview nodes={auto.nodes} />
                  </div>
                </div>

                {/* Right: metrics + actions */}
                <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-3 text-[10px] text-wood-400">
                    <span className="flex items-center gap-1">
                      <Activity size={9} /> {auto.executions30d} ejecuciones (30d)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={9} /> {auto.lastRun}
                    </span>
                    {auto.successRate > 0 && (
                      <span className={'flex items-center gap-1 ' + (auto.successRate >= 90 ? 'text-green-600' : 'text-amber-600')}>
                        <TrendingUp size={9} /> {auto.successRate}%
                      </span>
                    )}
                  </div>
                  {auto.impact !== '—' && (
                    <p className="text-[9px] text-accent-gold font-medium">{auto.impact}</p>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggle(auto.id)}
                      className={
                        'p-1.5 rounded-lg border transition-colors ' +
                        (auto.status === 'active' ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50')
                      }
                      title={auto.status === 'active' ? 'Pausar' : 'Activar'}
                    >
                      {auto.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button
                      onClick={() => onEdit(auto)}
                      className="p-1.5 rounded-lg border border-wood-200 text-wood-500 hover:bg-wood-50 transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => toast.success('Automatizacion duplicada')}
                      className="p-1.5 rounded-lg border border-wood-200 text-wood-500 hover:bg-wood-50 transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-xs text-wood-400">
            No se encontraron automatizaciones
          </div>
        )}
      </div>
    </div>
  );
}

// ===== TEMPLATES VIEW =====
function TemplatesView({ onUse }: { onUse: (t: Template) => void }) {
  const [catFilter, setCatFilter] = useState('all');
  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filtered = catFilter === 'all' ? templates : templates.filter(t => t.category === catFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={
              'px-2.5 py-1.5 text-[10px] rounded-lg border transition-colors ' +
              (catFilter === c ? 'border-accent-gold bg-accent-gold/10 text-accent-gold font-medium' : 'border-wood-200 text-wood-500 hover:bg-wood-50')
            }
          >
            {c === 'all' ? 'Todas' : c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(tpl => (
          <Card key={tpl.id} className="p-4 hover:border-wood-200 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-medium text-wood-900">{tpl.name}</h4>
                  {tpl.popular && (
                    <span className="text-[8px] bg-accent-gold/15 text-accent-gold px-1.5 py-0.5 rounded-full font-medium">Popular</span>
                  )}
                </div>
                <p className="text-[10px] text-wood-400 mt-0.5">{tpl.description}</p>
              </div>
              <span className="text-[9px] bg-sand-100 text-wood-400 px-1.5 py-0.5 rounded shrink-0">{tpl.category}</span>
            </div>

            <div className="mt-3 mb-3">
              <WorkflowPreview nodes={tpl.nodes} compact />
            </div>

            <button
              onClick={() => onUse(tpl)}
              className="w-full text-center text-[10px] text-accent-gold font-medium border border-accent-gold/30 rounded-lg py-1.5 hover:bg-accent-gold/5 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={10} /> Usar template
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== WORKFLOW EDITOR =====
function WorkflowEditor({ automation, onBack }: { automation: Automation | null; onBack: () => void }) {
  const [name, setName] = useState(automation?.name || 'Nueva automatizacion');
  const [nodes, setNodes] = useState<WorkflowNode[]>(automation?.nodes || []);
  const [addingType, setAddingType] = useState<NodeType | null>(null);

  const addNode = (type: NodeType, label: string, icon: React.ElementType, category: string) => {
    const newNode: WorkflowNode = {
      id: 'n' + Date.now(),
      type,
      category,
      label,
      icon,
    };
    setNodes(prev => [...prev, newNode]);
    setAddingType(null);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    const newNodes = [...nodes];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newNodes.length) return;
    [newNodes[index], newNodes[targetIdx]] = [newNodes[targetIdx], newNodes[index]];
    setNodes(newNodes);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-wood-50 text-wood-400 hover:text-wood-600 transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <div className="w-9 h-9 rounded-lg bg-accent-gold/10 flex items-center justify-center">
            <Zap size={16} className="text-accent-gold" />
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="text-sm font-medium text-wood-900 bg-transparent border-b border-transparent hover:border-wood-200 focus:border-accent-gold outline-none px-1 py-0.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { toast.success('Automatizacion guardada como borrador'); onBack(); }} className="px-3 py-1.5 text-xs border border-wood-200 text-wood-500 rounded-lg hover:bg-wood-50 transition-colors">
            Guardar borrador
          </button>
          <button
            onClick={() => {
              if (nodes.length < 2 || !nodes.some(n => n.type === 'trigger')) {
                toast.error('Agrega al menos un Trigger y una Accion');
                return;
              }
              toast.success('Automatizacion activada!');
              onBack();
            }}
            className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1"
          >
            <Play size={10} /> Activar
          </button>
        </div>
      </div>

      {/* Visual Workflow Builder */}
      <Card className="p-6">
        <h4 className="text-[10px] text-wood-400 uppercase tracking-wider font-medium mb-4">Constructor de Workflow</h4>

        {nodes.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
              <Zap size={24} className="text-green-600" />
            </div>
            <p className="text-xs text-wood-600 mb-1">Comienza agregando un Trigger</p>
            <p className="text-[10px] text-wood-400">El trigger es el evento que inicia la automatizacion</p>
            <button
              onClick={() => setAddingType('trigger')}
              className="mt-3 px-4 py-2 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <Plus size={12} /> Agregar Trigger
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {nodes.map((node, i) => {
              const cfg = nodeCfg[node.type];
              const Icon = node.icon;
              return (
                <div key={node.id}>
                  {/* Node */}
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={'relative flex items-center gap-3 p-3 rounded-xl border-2 ' + cfg.bg + ' ' + cfg.border}
                  >
                    {/* Node number */}
                    <div className={'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ' + cfg.border + ' ' + cfg.color + ' bg-white'}>
                      {i + 1}
                    </div>

                    <div className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white border ' + cfg.border}>
                      <Icon size={14} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={'text-[9px] font-bold uppercase tracking-wider ' + cfg.color}>{cfg.label}</span>
                        <span className="text-[9px] text-wood-400">/ {node.category}</span>
                      </div>
                      <p className={'text-xs font-medium ' + cfg.color}>{node.label}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      {i > 0 && (
                        <button onClick={() => moveNode(i, 'up')} className="p-1 rounded hover:bg-white/50 text-wood-400" title="Mover arriba">
                          <ChevronRight size={10} className="-rotate-90" />
                        </button>
                      )}
                      {i < nodes.length - 1 && (
                        <button onClick={() => moveNode(i, 'down')} className="p-1 rounded hover:bg-white/50 text-wood-400" title="Mover abajo">
                          <ChevronRight size={10} className="rotate-90" />
                        </button>
                      )}
                      <button onClick={() => removeNode(node.id)} className="p-1 rounded hover:bg-red-50 text-wood-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <X size={10} />
                      </button>
                    </div>
                  </motion.div>

                  {/* Connector arrow */}
                  {i < nodes.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      <div className="w-0.5 h-4 bg-wood-200" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add step buttons */}
            <div className="pt-3">
              <div className="flex items-center justify-center py-1">
                <div className="w-0.5 h-4 bg-wood-200" />
              </div>
              <div className="flex items-center justify-center gap-2">
                {!nodes.some(n => n.type === 'trigger') && (
                  <button
                    onClick={() => setAddingType('trigger')}
                    className="px-3 py-1.5 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Plus size={10} /> Trigger
                  </button>
                )}
                <button
                  onClick={() => setAddingType('condition')}
                  className="px-3 py-1.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> Condicion
                </button>
                <button
                  onClick={() => setAddingType('action')}
                  className="px-3 py-1.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> Accion
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Palette: add node panel */}
      <AnimatePresence>
        {addingType && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-medium text-wood-900 flex items-center gap-1.5">
                  <span className={'w-2 h-2 rounded-full ' + (addingType === 'trigger' ? 'bg-green-500' : addingType === 'condition' ? 'bg-amber-500' : 'bg-blue-500')} />
                  Selecciona un {nodeCfg[addingType].label}
                </h4>
                <button onClick={() => setAddingType(null)} className="p-1 rounded hover:bg-wood-50 text-wood-400">
                  <X size={12} />
                </button>
              </div>

              {addingType === 'trigger' && (
                <div className="space-y-3">
                  {triggerOptions.map(cat => (
                    <div key={cat.cat}>
                      <p className="text-[9px] text-wood-400 uppercase tracking-wider font-medium mb-1">{cat.cat}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.items.map(item => {
                          const TIcon = item.icon;
                          return (
                            <button
                              key={item.id}
                              onClick={() => addNode('trigger', item.label, item.icon, cat.cat)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <TIcon size={10} /> {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {addingType === 'condition' && (
                <div className="flex flex-wrap gap-1.5">
                  {conditionOptions.map(item => {
                    const CIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addNode('condition', item.label, item.icon, 'Filtro')}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        <CIcon size={10} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {addingType === 'action' && (
                <div className="flex flex-wrap gap-1.5">
                  {actionOptions.map(item => {
                    const AIcon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => addNode(item.id === 'a_delay' ? 'delay' : 'action', item.label, item.icon, item.label.split(' ')[0])}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <AIcon size={10} /> {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution history */}
      {automation && automation.executions > 0 && (
        <Card className="p-4">
          <h4 className="text-xs font-medium text-wood-900 mb-3 flex items-center gap-1.5">
            <Activity size={12} className="text-accent-gold" /> Historial de ejecuciones
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div className="bg-sand-50 rounded-lg p-2.5 text-center">
              <p className="text-sm font-serif text-wood-900">{automation.executions}</p>
              <p className="text-[9px] text-wood-400">Total</p>
            </div>
            <div className="bg-sand-50 rounded-lg p-2.5 text-center">
              <p className="text-sm font-serif text-wood-900">{automation.executions30d}</p>
              <p className="text-[9px] text-wood-400">Ultimos 30d</p>
            </div>
            <div className="bg-sand-50 rounded-lg p-2.5 text-center">
              <p className="text-sm font-serif text-green-600">{automation.successRate}%</p>
              <p className="text-[9px] text-wood-400">Tasa exito</p>
            </div>
            <div className="bg-sand-50 rounded-lg p-2.5 text-center">
              <p className="text-sm font-serif text-accent-gold">{automation.impact}</p>
              <p className="text-[9px] text-wood-400">Impacto</p>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-2 py-1.5">Fecha</th>
                <th className="px-2 py-1.5">Resultado</th>
                <th className="px-2 py-1.5">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {[
                { date: '28 Feb 14:22', result: 'success', detail: 'Email enviado a cliente #248' },
                { date: '25 Feb 09:15', result: 'success', detail: 'Email enviado a cliente #231' },
                { date: '20 Feb 16:40', result: 'success', detail: '+500 puntos a cliente #219' },
              ].map((e, i) => (
                <tr key={i} className="hover:bg-sand-50/50 transition-colors">
                  <td className="px-2 py-1.5 text-[10px] text-wood-500 font-mono">{e.date}</td>
                  <td className="px-2 py-1.5">
                    <span className={'text-[9px] px-1.5 py-0.5 rounded-full ' + (e.result === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')}>
                      {e.result === 'success' ? 'Exitoso' : 'Error'}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-[10px] text-wood-500">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const AutomationsPage: React.FC = () => {

  // ── Live data from API ──
  const [liveAuto, setLiveAuto] = useState<any>(null);
  const [automationsLoading, setAutomationsLoading] = useState(true);
  const fetchAutomations = () => {
    fetch('/api/admin/automations').then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setLiveAuto(d);
        // Map rules from API to component format
        if (d.rules?.length > 0) {
          const mapped = d.rules.map((r: any) => ({
            ...exampleAutomations.find(ea => ea.name.toLowerCase().includes(r.name?.toLowerCase().split(' ')[0] || '')) || exampleAutomations[0],
            id: r.id,
            name: r.name,
            description: r.description,
            status: r.is_enabled ? 'active' as const : 'paused' as const,
            _dbId: r.id,
            _isRule: true,
          }));
          setAutomations(mapped);
        }
      }
    }).catch(() => {}).finally(() => setAutomationsLoading(false));
  };
  useEffect(() => { fetchAutomations(); }, []);

  const [view, setView] = useState<ViewMode>('list');
  const [automations, setAutomations] = useState(exampleAutomations);
  const [editingAuto, setEditingAuto] = useState<Automation | null>(null);

  const handleToggle = useCallback((id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id !== id) return a;
      const newStatus: AutoStatus = a.status === 'active' ? 'paused' : 'active';
      // Persist to Supabase if it's a DB rule
      if ((a as any)._dbId) {
        fetch('/api/admin/automations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: (a as any)._dbId, is_enabled: newStatus === 'active' }),
        }).catch(() => {});
      }
      toast.success(`Automatización ${newStatus === 'active' ? 'activada' : 'pausada'}: ${a.name}`);
      return { ...a, status: newStatus };
    }));
  }, []);

  const handleEdit = useCallback((auto: Automation) => {
    setEditingAuto(auto);
    setView('editor');
  }, []);

  const handleUseTemplate = useCallback((tpl: Template) => {
    const newAuto: Automation = {
      id: 'auto_' + Date.now(),
      name: tpl.name + ' (copia)',
      description: tpl.description,
      status: 'draft',
      nodes: tpl.nodes.map(n => ({ ...n, id: n.id + '_' + Date.now() })),
      executions: 0, executions30d: 0, lastRun: 'Nunca', lastResult: 'none',
      successRate: 0, impact: '—', createdAt: 'Hoy',
    };
    setEditingAuto(newAuto);
    setView('editor');
    toast.success('Template cargado en el editor');
  }, []);

  const handleNewAuto = useCallback(() => {
    setEditingAuto(null);
    setView('editor');
  }, []);

  if (view === 'editor') {
    return (
      <WorkflowEditor
        automation={editingAuto}
        onBack={() => { setView('list'); setEditingAuto(null); }}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-wood-900 flex items-center gap-2">
            <Zap size={20} className="text-accent-gold" /> Automatizaciones
          </h1>
          <p className="text-xs text-wood-400 mt-0.5">Workflows automaticos tipo Zapier/Shopify Flow — sin codigo</p>
        </div>
        <button
          onClick={handleNewAuto}
          className="px-3 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
        >
          <Plus size={12} /> Nueva automatizacion
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-wood-100">
        {([
          { id: 'list' as ViewMode, label: 'Mis automatizaciones', count: automations.length },
          { id: 'templates' as ViewMode, label: 'Templates', count: templates.length },
        ]).map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className={
              'flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors ' +
              (view === t.id
                ? 'border-accent-gold text-accent-gold font-medium'
                : 'border-transparent text-wood-500 hover:text-wood-700')
            }
          >
            {t.label}
            <span className="text-[9px] bg-sand-100 text-wood-400 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {view === 'list' && (
            <AutomationsList
              automations={automations}
              onEdit={handleEdit}
              onToggle={handleToggle}
            />
          )}
          {view === 'templates' && (
            <TemplatesView onUse={handleUseTemplate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
