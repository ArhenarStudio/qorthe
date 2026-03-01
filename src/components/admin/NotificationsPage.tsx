"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Mail, Layout, Clock, Settings2,
  ShoppingCart, Package, Star, FileText, Users, DollarSign, AlertTriangle,
  Truck, BarChart3, ChevronRight, Check, CheckCheck, Eye,
  Send, RotateCcw, Save, Filter, Search, MailOpen, MousePointerClick,
  XCircle, ArrowRight, Palette, Plus, X, Upload
} from 'lucide-react';
import { toast } from 'sonner';

// ===== TYPES =====
type NTab = 'center' | 'emails' | 'templates' | 'history' | 'config';

const tabItems: Array<{ id: NTab; label: string; icon: React.ElementType }> = [
  { id: 'center', label: 'Centro de Notificaciones', icon: Bell },
  { id: 'emails', label: 'Emails al Cliente', icon: Mail },
  { id: 'templates', label: 'Plantillas', icon: Palette },
  { id: 'history', label: 'Historial', icon: Clock },
  { id: 'config', label: 'Configuracion', icon: Settings2 },
];

// ===== SHARED =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-white rounded-xl border border-wood-100 shadow-sm ' + className}>{children}</div>;
}

function STitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-medium text-wood-900 uppercase tracking-wider border-b border-wood-100 pb-2 mb-4">{children}</h4>;
}

function Badge({ text, variant = 'green' }: { text: string; variant?: 'green' | 'gray' | 'amber' | 'blue' | 'red' | 'purple' }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    gray: 'bg-wood-50 text-wood-500',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-500',
    purple: 'bg-purple-50 text-purple-600',
  };
  return <span className={'text-[10px] font-medium px-2 py-0.5 rounded-full ' + cls[variant]}>{text}</span>;
}

// ===== MOCK DATA =====
type NotifCategory = 'order' | 'shipping' | 'stock' | 'review' | 'quote' | 'customer' | 'finance' | 'marketing' | 'system';

interface Notification {
  id: string;
  time: string;
  category: NotifCategory;
  title: string;
  detail: string;
  action: string;
  read: boolean;
  priority?: boolean;
}

const categoryConfig: Record<NotifCategory, { icon: React.ElementType; cls: string; label: string }> = {
  order: { icon: ShoppingCart, cls: 'bg-blue-50 text-blue-600', label: 'Pedidos' },
  shipping: { icon: Truck, cls: 'bg-indigo-50 text-indigo-600', label: 'Envios' },
  stock: { icon: Package, cls: 'bg-red-50 text-red-500', label: 'Stock' },
  review: { icon: Star, cls: 'bg-amber-50 text-amber-600', label: 'Reviews' },
  quote: { icon: FileText, cls: 'bg-purple-50 text-purple-600', label: 'Cotizaciones' },
  customer: { icon: Users, cls: 'bg-emerald-50 text-emerald-600', label: 'Clientes' },
  finance: { icon: DollarSign, cls: 'bg-green-50 text-green-600', label: 'Finanzas' },
  marketing: { icon: Mail, cls: 'bg-pink-50 text-pink-600', label: 'Marketing' },
  system: { icon: AlertTriangle, cls: 'bg-gray-100 text-gray-500', label: 'Sistema' },
};

const todayNotifs: Notification[] = [
  { id: 'n1', time: '10:30', category: 'order', title: 'Nuevo pedido #165 - David Perez - $3,280 MXN', detail: 'Tabla Parota + Grabado Laser | Tier: Oro', action: 'Ver pedido', read: false },
  { id: 'n2', time: '10:15', category: 'review', title: 'Nueva review pendiente - 2 estrellas - PRIORIDAD', detail: 'Roberto Sanchez en Tabla Cedro Rojo - queja de envio', action: 'Moderar review', read: false, priority: true },
  { id: 'n3', time: '09:45', category: 'quote', title: 'Nueva cotizacion COT-2026-145 - Corp. Hermosillo', detail: '15 tablas + 30 grabados | Est: $52,000 | B2B', action: 'Revisar cotizacion', read: false },
  { id: 'n4', time: '09:00', category: 'stock', title: 'Stock bajo - Tabla Rosa Morada: 2 unidades restantes', detail: 'Velocidad de venta: 1 cada 4 dias -> se agota en ~8 dias', action: 'Ver inventario', read: true },
  { id: 'n5', time: '08:30', category: 'finance', title: 'Anticipo recibido - COT-2026-142 - David Perez - $15,428', detail: 'Transferencia bancaria confirmada', action: 'Iniciar produccion', read: true },
];

const yesterdayNotifs: Notification[] = [
  { id: 'n6', time: '18:00', category: 'system', title: 'Resumen del dia: 6 pedidos, $5,280, 2 reviews, 1 cotizacion', detail: '', action: 'Ver dashboard', read: true },
  { id: 'n7', time: '16:30', category: 'shipping', title: 'Problema de envio - Pedido #162 - DHL reporta retraso', detail: 'Tracking: en hub 48h sin movimiento', action: 'Ver envio', read: true },
  { id: 'n8', time: '15:00', category: 'customer', title: 'David Perez subio a tier Oro', detail: 'Gasto acumulado: $10,420 -> Beneficios Oro activados', action: 'Ver cliente', read: true },
  { id: 'n9', time: '14:00', category: 'marketing', title: 'Campana "Puntos por vencer" enviada - 45 destinatarios', detail: '', action: 'Ver resultados', read: true },
  { id: 'n10', time: '08:00', category: 'quote', title: '5 cotizaciones sin responder hace +48h', detail: 'COT-2026-140, 139, 137, 136, 134', action: 'Ver cotizaciones pendientes', read: true },
];

const weekNotifs: Notification[] = [
  { id: 'n11', time: '26 Feb', category: 'stock', title: 'Producto agotado - Set 3 Tablas Colores', detail: '3 pedidos pendientes sin stock', action: 'Ver producto', read: true },
  { id: 'n12', time: '25 Feb', category: 'finance', title: 'Declaracion IVA en 20 dias - Estimado: $18,400', detail: '', action: 'Ver finanzas', read: true },
  { id: 'n13', time: '25 Feb', category: 'customer', title: '8 clientes Plata a menos de $1,000 de subir a Oro', detail: 'Oportunidad de campana con incentivo', action: 'Crear campana', read: true },
];

const mockEmails = {
  orders: [
    { id: 'e1', name: 'Confirmacion de pedido', trigger: 'Al pagar', enabled: true },
    { id: 'e2', name: 'Pedido en produccion', trigger: 'Admin cambia', enabled: true },
    { id: 'e3', name: 'Pedido con grabado recibido', trigger: 'Archivo validado', enabled: true },
    { id: 'e4', name: 'Pedido enviado + tracking', trigger: 'Guia generada', enabled: true },
    { id: 'e5', name: 'Pedido entregado', trigger: 'Carrier confirma', enabled: true },
    { id: 'e6', name: 'Pedido retrasado (disculpa)', trigger: '>2 dias retraso', enabled: false },
  ],
  account: [
    { id: 'e7', name: 'Bienvenida al registrarse', trigger: 'Registro', enabled: true },
    { id: 'e8', name: 'Verificacion de email', trigger: 'Registro', enabled: true },
    { id: 'e9', name: 'Reseteo de contrasena', trigger: 'Solicitud', enabled: true },
  ],
  loyalty: [
    { id: 'e10', name: 'Bienvenida al programa', trigger: 'Primera compra', enabled: true },
    { id: 'e11', name: 'Puntos ganados', trigger: 'Compra completada', enabled: true },
    { id: 'e12', name: 'Subiste de tier', trigger: 'Cambio de tier', enabled: true },
    { id: 'e13', name: 'Puntos por vencer (30d)', trigger: '30d antes venc.', enabled: true },
    { id: 'e14', name: 'Puntos por vencer (7d)', trigger: '7d antes venc.', enabled: true },
  ],
  reviews: [
    { id: 'e15', name: 'Solicitar review', trigger: '7d post-entrega', enabled: true },
    { id: 'e16', name: 'Recordatorio review', trigger: '14d sin review', enabled: true },
    { id: 'e17', name: 'Respuesta a tu review', trigger: 'Admin responde', enabled: true },
  ],
  quotes: [
    { id: 'e18', name: 'Cotizacion recibida', trigger: 'Cliente envia', enabled: true },
    { id: 'e19', name: 'Cotizacion lista (PDF)', trigger: 'Admin envia', enabled: true },
    { id: 'e20', name: 'Cotizacion aprobada', trigger: 'Cliente acepta', enabled: true },
    { id: 'e21', name: 'Cotizacion por vencer', trigger: '3d antes venc.', enabled: true },
  ],
  marketing: [
    { id: 'e22', name: 'Carrito abandonado', trigger: '24h sin completar', enabled: false },
    { id: 'e23', name: 'Te extranamos (reactivacion)', trigger: '>90d sin compra', enabled: false },
    { id: 'e24', name: 'Referido: tu amigo se registro', trigger: 'Referido registra', enabled: true },
    { id: 'e25', name: 'Referido: ganaste puntos', trigger: 'Referido compra', enabled: true },
  ],
};

const mockHistory = [
  { id: 'h1', date: '28 Feb 10:31', type: 'Confirmacion pedido', recipient: 'David Perez', subject: 'Tu pedido #165...', status: 'opened' as const },
  { id: 'h2', date: '28 Feb 10:15', type: 'Solicitar review', recipient: 'Maria Lopez', subject: 'Que te parecio...', status: 'clicked' as const },
  { id: 'h3', date: '27 Feb 18:00', type: 'Pedido enviado', recipient: 'Ana Garcia', subject: 'Tu pedido #163 va...', status: 'opened' as const },
  { id: 'h4', date: '27 Feb 14:00', type: 'Puntos ganados', recipient: 'David Perez', subject: 'Ganaste 1,000 puntos', status: 'sent' as const },
  { id: 'h5', date: '27 Feb 10:00', type: 'Campana: Primavera', recipient: '248 destinat.', subject: 'Descubre nuestra...', status: 'campaign' as const },
  { id: 'h6', date: '26 Feb 17:00', type: 'Subiste a Oro', recipient: 'David Perez', subject: 'Felicidades!', status: 'clicked' as const },
  { id: 'h7', date: '26 Feb 09:00', type: 'Cotizacion lista', recipient: 'Pedro Sanchez', subject: 'Tu cotizacion COT...', status: 'opened' as const },
];

const mockNotifPrefs = [
  { name: 'Nuevo pedido', inApp: true, email: true, push: true, priority: 'Alta' },
  { name: 'Pedido con grabado (archivo)', inApp: true, email: false, push: false, priority: 'Normal' },
  { name: 'Problema de envio', inApp: true, email: true, push: true, priority: 'Alta' },
  { name: 'Stock bajo', inApp: true, email: true, push: false, priority: 'Normal' },
  { name: 'Producto agotado', inApp: true, email: true, push: true, priority: 'Alta' },
  { name: 'Nueva review pendiente', inApp: true, email: false, push: false, priority: 'Normal' },
  { name: 'Review negativa (1-2 estrellas)', inApp: true, email: true, push: true, priority: 'Alta' },
  { name: 'Nueva cotizacion', inApp: true, email: true, push: false, priority: 'Normal' },
  { name: 'Cotizacion sin responder +48h', inApp: true, email: true, push: false, priority: 'Alta' },
  { name: 'Anticipo recibido', inApp: true, email: true, push: false, priority: 'Normal' },
  { name: 'Nuevo cliente registrado', inApp: true, email: false, push: false, priority: 'Baja' },
  { name: 'Cliente subio de tier', inApp: true, email: false, push: false, priority: 'Baja' },
  { name: 'Cliente inactivo +90d', inApp: true, email: false, push: false, priority: 'Baja' },
  { name: 'Reembolso procesado', inApp: true, email: true, push: false, priority: 'Normal' },
  { name: 'Meta de ingresos alcanzada', inApp: true, email: true, push: false, priority: 'Baja' },
  { name: 'Error de sistema / API caida', inApp: true, email: true, push: true, priority: 'Critica' },
];

// ===== TAB 1: CENTER =====
function CenterTab() {
  const [filter, setFilter] = useState<string>('all');
  const [notifications, setNotifications] = useState({
    today: todayNotifs,
    yesterday: yesterdayNotifs,
    week: weekNotifs,
  });

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'Todas' },
    { id: 'order', label: 'Pedidos' },
    { id: 'shipping', label: 'Envios' },
    { id: 'stock', label: 'Stock' },
    { id: 'review', label: 'Reviews' },
    { id: 'quote', label: 'Cotizaciones' },
    { id: 'customer', label: 'Clientes' },
    { id: 'finance', label: 'Finanzas' },
    { id: 'system', label: 'Sistema' },
  ];

  function filterNotifs(list: Notification[]) {
    if (filter === 'all') return list;
    return list.filter((n) => n.category === filter);
  }

  function markAllRead() {
    setNotifications({
      today: notifications.today.map((n) => ({ ...n, read: true })),
      yesterday: notifications.yesterday.map((n) => ({ ...n, read: true })),
      week: notifications.week.map((n) => ({ ...n, read: true })),
    });
    toast.success('Todas las notificaciones marcadas como leidas');
  }

  function NotifItem({ n }: { n: Notification }) {
    const cfg = categoryConfig[n.category];
    const Icon = cfg.icon;
    return (
      <div className={'flex items-start gap-3 p-4 hover:bg-sand-50/50 transition-colors border-b border-wood-50 last:border-0 ' + (!n.read ? 'bg-accent-gold/5' : '')}>
        <div className={'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ' + cfg.cls}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className={'text-xs text-wood-900 flex-1 ' + (!n.read ? 'font-medium' : '')}>
              {n.title}
            </p>
            {!n.read && <span className="w-2 h-2 rounded-full bg-accent-gold shrink-0 mt-1" />}
            {n.priority && <Badge text="PRIORIDAD" variant="red" />}
          </div>
          {n.detail && <p className="text-[11px] text-wood-500 mt-0.5">{n.detail}</p>}
          <button className="text-[10px] text-accent-gold hover:underline mt-1 flex items-center gap-0.5">
            {n.action} <ArrowRight size={8} />
          </button>
        </div>
        <span className="text-[10px] text-wood-400 shrink-0 mt-0.5">{n.time}</span>
      </div>
    );
  }

  function NotifGroup({ title, items }: { title: string; items: Notification[] }) {
    const filtered = filterNotifs(items);
    if (filtered.length === 0) return null;
    return (
      <div>
        <p className="text-[10px] text-wood-400 uppercase tracking-wider font-medium px-4 py-2 bg-sand-50/80">{title}</p>
        {filtered.map((n) => <NotifItem key={n.id} n={n} />)}
      </div>
    );
  }

  const unreadCount = [...notifications.today, ...notifications.yesterday, ...notifications.week].filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-wood-500">Filtros:</span>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={'px-2.5 py-1 text-[10px] rounded-full transition-colors ' + (filter === c.id ? 'bg-accent-gold text-white' : 'bg-sand-50 text-wood-500 hover:bg-sand-100')}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={markAllRead} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5">
          <CheckCheck size={12} /> Marcar todo como leido {unreadCount > 0 && <Badge text={String(unreadCount)} variant="red" />}
        </button>
      </div>

      <Card className="overflow-hidden">
        <NotifGroup title="Hoy" items={notifications.today} />
        <NotifGroup title="Ayer" items={notifications.yesterday} />
        <NotifGroup title="Esta semana" items={notifications.week} />
      </Card>

      <div className="flex items-center gap-3 text-[10px] text-wood-400">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-gold" /> No leida</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-wood-200" /> Leida</span>
        <span className="ml-auto">Cada notificacion tiene link directo a la pantalla relevante</span>
      </div>
    </div>
  );
}

// ===== TAB 2: CLIENT EMAILS =====
function EmailsTab() {
  const [editingEmail, setEditingEmail] = useState<string | null>(null);

  if (editingEmail) {
    const allEmails = Object.values(mockEmails).flat();
    const email = allEmails.find((e) => e.id === editingEmail);
    if (!email) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditingEmail(null)} className="text-xs text-wood-500 hover:text-wood-700 transition-colors">Emails al Cliente</button>
          <ChevronRight size={12} className="text-wood-300" />
          <span className="text-xs font-medium text-wood-900">{email.name}</span>
        </div>

        <Card className="p-5 space-y-4">
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Asunto</label>
            <input defaultValue={'Tu pedido #{order_id} ha sido confirmado'} className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Preview text</label>
            <input defaultValue="Gracias por tu compra, {customer_name}" className="w-full border border-wood-200 rounded-lg px-3 py-2 text-xs bg-white" />
          </div>

          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-2">Variables disponibles</label>
            <div className="flex flex-wrap gap-1">
              {['{customer_name}', '{customer_email}', '{customer_tier}', '{customer_points}', '{order_id}', '{order_total}', '{order_items}', '{order_date}', '{shipping_address}', '{shipping_carrier}', '{shipping_tracking}', '{product_name}', '{product_image}', '{product_price}', '{coupon_code}', '{discount_amount}', '{store_name}', '{store_url}', '{store_phone}'].map((v) => (
                <button
                  key={v}
                  onClick={() => { navigator.clipboard.writeText(v); toast.success('Variable copiada: ' + v); }}
                  className="text-[9px] font-mono bg-sand-50 text-wood-600 px-1.5 py-0.5 rounded border border-wood-100 hover:bg-sand-100 transition-colors"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Editor placeholder */}
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-2">Contenido del email</label>
            <div className="flex flex-wrap gap-1.5 mb-3 p-2 bg-sand-50 rounded-lg border border-wood-100">
              {['Texto', 'Imagen', 'Boton', 'Producto', 'Separador', '2 columnas', 'Detalles pedido', 'Tracking info', 'Barra de puntos'].map((b) => (
                <button key={b} className="px-2 py-1 text-[10px] bg-white border border-wood-200 rounded text-wood-600 hover:border-wood-300 transition-colors">
                  <Plus size={8} className="inline mr-0.5" />{b}
                </button>
              ))}
            </div>
            <div className="border border-wood-200 rounded-lg overflow-hidden">
              {/* Mock email preview */}
              <div className="bg-[#2d2419] p-6 text-center">
                <div className="text-accent-gold text-sm font-serif">DavidSon's Design</div>
              </div>
              <div className="bg-[#F5F3F0] p-6 space-y-4">
                <div className="bg-white rounded-lg p-5 max-w-md mx-auto space-y-3">
                  <h3 className="text-sm font-serif text-[#2d2419] text-center">Pedido Confirmado</h3>
                  <p className="text-xs text-[#2d2419]/70">
                    Hola <span className="text-accent-gold">{'{customer_name}'}</span>, gracias por tu compra.
                    Tu pedido <span className="font-medium">{'{order_id}'}</span> ha sido confirmado y esta siendo preparado.
                  </p>
                  <div className="bg-sand-50 rounded p-3">
                    <p className="text-[10px] text-wood-400 uppercase tracking-wider mb-2">Resumen del pedido</p>
                    <div className="flex justify-between text-xs text-wood-700 border-b border-wood-100 pb-1.5 mb-1.5">
                      <span>{'{product_name}'}</span>
                      <span>{'{product_price}'}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-wood-900">
                      <span>Total</span>
                      <span>{'{order_total}'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <button className="bg-[#2d2419] text-[#F5F3F0] px-6 py-2 rounded-lg text-xs">
                      Ver mi pedido
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-[#2d2419] p-4 text-center space-y-1">
                <p className="text-[9px] text-[#F5F3F0]/50">DavidSon's Design | Hermosillo, Sonora, Mexico</p>
                <p className="text-[9px] text-accent-gold/50">Gestionar preferencias | Darse de baja</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => { toast.success('Plantilla guardada'); setEditingEmail(null); }} className="px-3 py-1.5 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1">
            <Save size={12} /> Guardar
          </button>
          <button onClick={() => toast.success('Email de prueba enviado')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
            <Send size={12} /> Enviar prueba a mi email
          </button>
          <button onClick={() => toast.success('Preview abierto')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
            <Eye size={12} /> Preview
          </button>
          <button onClick={() => toast.success('Restaurado a default')} className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
            <RotateCcw size={12} /> Restaurar default
          </button>
        </div>
      </div>
    );
  }

  function EmailSection({ title, emails }: { title: string; emails: Array<{ id: string; name: string; trigger: string; enabled: boolean }> }) {
    const [localEmails, setLocalEmails] = useState(emails);
    return (
      <div className="mb-1">
        <p className="text-[10px] text-wood-400 uppercase tracking-wider font-medium px-5 py-2 bg-sand-50/80 border-b border-wood-50">{title}</p>
        {localEmails.map((e) => (
          <div key={e.id} className="flex items-center gap-3 px-5 py-3 border-b border-wood-50 hover:bg-sand-50/30 transition-colors">
            <button
              onClick={() => {
                setLocalEmails(localEmails.map((le) => le.id === e.id ? { ...le, enabled: !le.enabled } : le));
                toast.success(e.enabled ? 'Email desactivado' : 'Email activado');
              }}
              className={'w-8 h-5 rounded-full p-0.5 transition-colors shrink-0 ' + (e.enabled ? 'bg-green-500' : 'bg-wood-200')}
            >
              <div className={'w-4 h-4 rounded-full bg-white shadow transition-transform ' + (e.enabled ? 'translate-x-3' : 'translate-x-0')} />
            </button>
            <span className="text-xs text-wood-900 flex-1">{e.name}</span>
            <span className="text-[10px] text-wood-400 hidden sm:block">Trigger: {e.trigger}</span>
            <button onClick={() => setEditingEmail(e.id)} className="p-1.5 rounded hover:bg-wood-50 text-wood-400 transition-colors" title="Editar">
              <Layout size={12} />
            </button>
            <button onClick={() => toast.success('Preview: ' + e.name)} className="p-1.5 rounded hover:bg-wood-50 text-wood-400 transition-colors" title="Preview">
              <Eye size={12} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100">
          <h4 className="text-sm font-medium text-wood-900">Emails Automaticos al Cliente</h4>
        </div>
        <EmailSection title="Pedidos" emails={mockEmails.orders} />
        <EmailSection title="Cuenta" emails={mockEmails.account} />
        <EmailSection title="Lealtad" emails={mockEmails.loyalty} />
        <EmailSection title="Reviews" emails={mockEmails.reviews} />
        <EmailSection title="Cotizaciones" emails={mockEmails.quotes} />
        <EmailSection title="Marketing / Recuperacion" emails={mockEmails.marketing} />
      </Card>
    </div>
  );
}

// ===== TAB 3: TEMPLATES =====
function TemplatesTab() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <STitle>Plantilla Base (branding)</STitle>
        <p className="text-[10px] text-wood-400 mb-4">Todos los emails heredan de esta plantilla base.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Config */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Logo</label>
                <button className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1">
                  <Upload size={12} /> Subir logo
                </button>
              </div>
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Posicion</label>
                <select className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option>Centro</option>
                  <option>Izquierda</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Tamano</label>
                <select className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option>180px</option>
                  <option>150px</option>
                  <option>120px</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Fondo header', value: '#2d2419', name: 'wood-900' },
                { label: 'Fondo body', value: '#F5F3F0', name: 'sand' },
                { label: 'Color texto', value: '#2d2419', name: 'wood-900' },
                { label: 'Color links', value: '#C5A065', name: 'gold' },
                { label: 'Fondo botones', value: '#2d2419', name: 'wood-900' },
                { label: 'Texto botones', value: '#F5F3F0', name: 'sand' },
              ].map((c) => (
                <div key={c.label}>
                  <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">{c.label}</label>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border border-wood-200" style={{ backgroundColor: c.value }} />
                    <input defaultValue={c.value} className="flex-1 border border-wood-200 rounded px-2 py-1 text-xs bg-white font-mono" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Tipografia titulos</label>
                <select className="w-full border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option>Playfair Display</option>
                  <option>Georgia</option>
                  <option>Times New Roman</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Tipografia body</label>
                <select className="w-full border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
                  <option>Inter</option>
                  <option>Arial</option>
                  <option>Helvetica</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Ancho maximo</label>
              <input defaultValue="600px" className="w-24 border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
            </div>

            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-2">Footer incluye</label>
              {[
                'Logo pequeno',
                'Direccion: Hermosillo, Sonora, Mexico',
                'Redes sociales: FB, IG, X',
                'Link "Gestionar preferencias de email"',
                'Link "Darse de baja"',
                'Texto legal: "Recibiste este email porque..."',
              ].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-xs text-wood-600 mb-1.5">
                  <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-2">Preview</label>
            <div className="border border-wood-200 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-[#2d2419] p-5 text-center">
                <div className="text-accent-gold font-serif">DavidSon's Design</div>
              </div>
              <div className="bg-[#F5F3F0] p-6">
                <div className="bg-white rounded-lg p-5 max-w-xs mx-auto space-y-3">
                  <h3 className="text-sm font-serif text-[#2d2419] text-center">[Titulo del email]</h3>
                  <p className="text-[11px] text-[#2d2419]/70 text-center">
                    Contenido del email con <span className="text-accent-gold">links dorados</span> y tipografia Inter para el body.
                  </p>
                  <div className="text-center">
                    <span className="inline-block bg-[#2d2419] text-[#F5F3F0] px-5 py-1.5 rounded text-[10px]">
                      Boton CTA
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-[#2d2419] p-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-3 mb-1">
                  {['FB', 'IG', 'X'].map((s) => (
                    <span key={s} className="w-5 h-5 rounded-full bg-[#F5F3F0]/10 flex items-center justify-center text-[8px] text-[#F5F3F0]/50">{s}</span>
                  ))}
                </div>
                <p className="text-[8px] text-[#F5F3F0]/40">DavidSon's Design | Hermosillo, Sonora, Mexico</p>
                <p className="text-[8px] text-accent-gold/40">Gestionar preferencias | Darse de baja</p>
                <p className="text-[8px] text-[#F5F3F0]/30">Recibiste este email porque eres cliente de DavidSon's Design</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <button onClick={() => toast.success('Plantilla base guardada')} className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5">
        <Save size={12} /> Guardar plantilla base
      </button>
    </div>
  );
}

// ===== TAB 4: HISTORY =====
function HistoryTab() {
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const statusConfig: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    sent: { label: 'No abierto', icon: Mail, cls: 'text-wood-400' },
    opened: { label: 'Abierto', icon: MailOpen, cls: 'text-green-600' },
    clicked: { label: 'Abierto+Clic', icon: MousePointerClick, cls: 'text-blue-600' },
    bounced: { label: 'Rebotado', icon: XCircle, cls: 'text-red-500' },
    campaign: { label: '42% apertura', icon: BarChart3, cls: 'text-purple-600' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-wood-500">Filtros:</span>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
          <option value="all">Tipo: Todos</option>
          <option>Confirmacion pedido</option>
          <option>Solicitar review</option>
          <option>Puntos ganados</option>
          <option>Campana</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white">
          <option value="all">Estado: Todos</option>
          <option value="sent">No abierto</option>
          <option value="opened">Abierto</option>
          <option value="clicked">Abierto+Clic</option>
          <option value="bounced">Rebotado</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-5 py-2">Fecha/Hora</th>
                <th className="px-5 py-2">Tipo</th>
                <th className="px-5 py-2">Destinatario</th>
                <th className="px-5 py-2">Asunto</th>
                <th className="px-5 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {mockHistory.map((h) => {
                const sc = statusConfig[h.status];
                return (
                  <tr key={h.id} className="hover:bg-sand-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-2.5 text-xs text-wood-500 whitespace-nowrap">{h.date}</td>
                    <td className="px-5 py-2.5 text-xs text-wood-700">{h.type}</td>
                    <td className="px-5 py-2.5 text-xs text-wood-600">{h.recipient}</td>
                    <td className="px-5 py-2.5 text-xs text-wood-900">{h.subject}</td>
                    <td className="px-5 py-2.5">
                      <span className={'flex items-center gap-1 text-[10px] font-medium ' + sc.cls}>
                        <sc.icon size={10} /> {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Metrics */}
      <Card className="p-5">
        <STitle>Metricas del periodo</STitle>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total enviados', value: '342' },
            { label: 'Tasa apertura', value: '52%' },
            { label: 'Tasa clic', value: '18%' },
            { label: 'Bounces', value: '3 (0.9%)' },
            { label: 'Unsubscribes', value: '1 (0.3%)' },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-lg font-serif text-wood-900">{m.value}</p>
              <p className="text-[10px] text-wood-400">{m.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-[10px] text-wood-400">Click en cualquier email para ver detalle: contenido completo, timeline (Enviado &rarr; Entregado &rarr; Abierto &rarr; Click), device, y opcion de reenviar.</p>
    </div>
  );
}

// ===== TAB 5: CONFIG =====
function ConfigTab() {
  const [prefs, setPrefs] = useState(mockNotifPrefs);

  function togglePref(idx: number, channel: 'inApp' | 'email' | 'push') {
    setPrefs(prefs.map((p, i) => i === idx ? { ...p, [channel]: !p[channel] } : p));
  }

  const priorityCls: Record<string, string> = {
    'Critica': 'bg-red-50 text-red-600',
    'Alta': 'bg-amber-50 text-amber-600',
    'Normal': 'bg-blue-50 text-blue-600',
    'Baja': 'bg-wood-50 text-wood-500',
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-wood-100 flex items-center justify-between">
          <h4 className="text-sm font-medium text-wood-900">Mis Preferencias de Notificacion</h4>
          <div className="flex items-center gap-3 text-[10px] text-wood-400">
            <span className="flex items-center gap-1"><Bell size={10} /> In-App</span>
            <span className="flex items-center gap-1"><Mail size={10} /> Email</span>
            <span className="flex items-center gap-1"><Send size={10} /> Push</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-50">
                <th className="px-5 py-2">Notificacion</th>
                <th className="px-5 py-2 text-center w-16">In-App</th>
                <th className="px-5 py-2 text-center w-16">Email</th>
                <th className="px-5 py-2 text-center w-16">Push</th>
                <th className="px-5 py-2 text-center w-24">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {prefs.map((p, idx) => (
                <tr key={p.name} className="hover:bg-sand-50/30 transition-colors">
                  <td className="px-5 py-2.5 text-xs text-wood-900">{p.name}</td>
                  {(['inApp', 'email', 'push'] as const).map((ch) => (
                    <td key={ch} className="px-5 py-2.5 text-center">
                      <button
                        onClick={() => togglePref(idx, ch)}
                        className={'w-8 h-5 rounded-full p-0.5 transition-colors mx-auto block ' + (p[ch] ? 'bg-green-500' : 'bg-wood-200')}
                      >
                        <div className={'w-4 h-4 rounded-full bg-white shadow transition-transform ' + (p[ch] ? 'translate-x-3' : 'translate-x-0')} />
                      </button>
                    </td>
                  ))}
                  <td className="px-5 py-2.5 text-center">
                    <span className={'text-[9px] font-medium px-2 py-0.5 rounded-full ' + (priorityCls[p.priority] || 'bg-wood-50 text-wood-500')}>
                      {p.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily summary */}
      <Card className="p-5">
        <STitle>Resumen diario</STitle>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs text-wood-700">
            <input type="checkbox" defaultChecked className="rounded border-wood-300 text-accent-gold" />
            Enviar resumen del dia
          </label>
          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Hora de envio</label>
              <input type="time" defaultValue="08:00" className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
            </div>
            <div>
              <label className="text-[10px] text-wood-400 uppercase tracking-wider block mb-1">Enviar a</label>
              <input defaultValue="admin@davidsonsdesign.com" className="w-full border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
            </div>
          </div>
          <p className="text-[10px] text-wood-400 pl-6">Incluye: pedidos, ingresos, reviews, cotizaciones, alertas</p>
        </div>
      </Card>

      {/* Quiet hours */}
      <Card className="p-5">
        <STitle>Horario silencioso (no enviar push)</STitle>
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] text-wood-400 block mb-1">Desde</label>
            <input type="time" defaultValue="22:00" className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
          </div>
          <div>
            <label className="text-[10px] text-wood-400 block mb-1">Hasta</label>
            <input type="time" defaultValue="07:00" className="border border-wood-200 rounded-lg px-2 py-1.5 text-xs bg-white" />
          </div>
        </div>
        <p className="text-[10px] text-wood-400 mt-2">(excepto prioridad Critica)</p>
      </Card>

      <button
        onClick={() => toast.success('Preferencias de notificacion guardadas')}
        className="px-4 py-2 text-xs bg-accent-gold text-white rounded-lg hover:bg-accent-gold/90 transition-colors flex items-center gap-1.5"
      >
        <Save size={12} /> Guardar preferencias
      </button>
    </div>
  );
}

// ===== MAIN =====
export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NTab>('center');

  const tabContent: Record<NTab, React.ReactNode> = {
    center: <CenterTab />,
    emails: <EmailsTab />,
    templates: <TemplatesTab />,
    history: <HistoryTab />,
    config: <ConfigTab />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
          <Bell size={20} className="text-accent-gold" /> Notificaciones
        </h3>
        <button
          onClick={() => setActiveTab('config')}
          className="px-3 py-1.5 text-xs border border-wood-200 rounded-lg hover:bg-wood-50 transition-colors flex items-center gap-1.5"
        >
          <Settings2 size={12} /> Configurar
        </button>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-1 min-w-max border-b border-wood-100">
          {tabItems.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={
                'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap ' +
                (activeTab === t.id
                  ? 'border-accent-gold text-accent-gold font-medium'
                  : 'border-transparent text-wood-500 hover:text-wood-700')
              }
            >
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
