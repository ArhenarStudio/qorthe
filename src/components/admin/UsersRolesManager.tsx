"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, ScrollText, Plus, Search, ChevronDown, ChevronRight,
  Eye, Edit3, Settings, Ban, Check, X, Mail, Copy, Trash2,
  MoreHorizontal, Clock, Filter, Download, UserPlus, Lock, Unlock,
  AlertTriangle, Globe, ShoppingCart, Truck, Package, Tag, Star,
  FileText, Megaphone, DollarSign, BarChart3, Layout, Bell, Wrench, Zap, Plug,
  RotateCcw, Headphones, ArrowUpDown, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useThemeComponents } from '@/src/admin/hooks/useThemeComponents';

// ===== TYPES =====
type SubTab = 'users' | 'roles' | 'audit';

type AccessLevel = 'none' | 'read' | 'edit' | 'full';

interface ModulePermission {
  moduleId: string;
  moduleName: string;
  moduleIcon: React.ElementType;
  access: AccessLevel;
  actions: Array<{ id: string; label: string; enabled: boolean; sensitive?: boolean }>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  isDefault: boolean;
  userCount: number;
  permissions: ModulePermission[];
  scope: 'all' | 'own' | 'team';
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  roleColor: string;
  status: 'active' | 'inactive' | 'invited';
  lastAccess: string;
  createdAt: string;
  scope: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
}

// ===== DATA =====
const accessLabels: Record<AccessLevel, { label: string; icon: React.ElementType; cls: string }> = {
  none: { label: 'Sin acceso', icon: Ban, cls: 'bg-red-50 text-red-500 border-red-200' },
  read: { label: 'Lectura', icon: Eye, cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  edit: { label: 'Editar', icon: Edit3, cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  full: { label: 'Completo', icon: Settings, cls: 'bg-green-50 text-green-600 border-green-200' },
};

const moduleTemplates: Array<{ id: string; name: string; icon: React.ElementType; actions: Array<{ id: string; label: string; sensitive?: boolean }> }> = [
  { id: 'dashboard', name: 'Dashboard', icon: Globe, actions: [
    { id: 'view_kpis', label: 'Ver KPIs' },
    { id: 'view_charts', label: 'Ver graficas' },
    { id: 'view_activity', label: 'Ver actividad' },
    { id: 'view_goals', label: 'Ver metas' },
    { id: 'view_margins', label: 'Ver margenes', sensitive: true },
  ]},
  { id: 'orders', name: 'Pedidos', icon: ShoppingCart, actions: [
    { id: 'view', label: 'Ver pedidos' },
    { id: 'change_status', label: 'Cambiar estado' },
    { id: 'process_engraving', label: 'Procesar grabado' },
    { id: 'generate_guides', label: 'Generar guias' },
    { id: 'communicate', label: 'Comunicar con cliente' },
    { id: 'view_margin', label: 'Ver margen financiero', sensitive: true },
    { id: 'cancel_refund', label: 'Cancelar/reembolsar' },
  ]},
  { id: 'shipping', name: 'Envios', icon: Truck, actions: [
    { id: 'view', label: 'Ver envios' },
    { id: 'generate_guides', label: 'Generar guias' },
    { id: 'print_labels', label: 'Imprimir etiquetas' },
    { id: 'mark_delivered', label: 'Marcar entregado' },
    { id: 'report_problem', label: 'Reportar problema' },
    { id: 'view_costs', label: 'Ver costos', sensitive: true },
  ]},
  { id: 'products', name: 'Productos', icon: Package, actions: [
    { id: 'view', label: 'Ver productos' },
    { id: 'create_edit', label: 'Crear/editar' },
    { id: 'delete', label: 'Eliminar' },
    { id: 'edit_prices', label: 'Editar precios' },
    { id: 'edit_costs', label: 'Editar costos/margen', sensitive: true },
    { id: 'manage_stock', label: 'Gestionar stock' },
    { id: 'import_export', label: 'Importacion masiva' },
  ]},
  { id: 'categories', name: 'Categorias', icon: Tag, actions: [
    { id: 'view', label: 'Ver' },
    { id: 'create_edit', label: 'Crear/editar' },
    { id: 'delete', label: 'Eliminar' },
    { id: 'collections', label: 'Gestionar colecciones' },
    { id: 'seo', label: 'Editar SEO' },
  ]},
  { id: 'customers', name: 'Clientes y Membresias', icon: Users, actions: [
    { id: 'view', label: 'Ver clientes' },
    { id: 'edit_profile', label: 'Editar perfil' },
    { id: 'view_history', label: 'Ver historial' },
    { id: 'manage_points', label: 'Gestionar puntos' },
    { id: 'change_tier', label: 'Cambiar tier' },
    { id: 'create_segments', label: 'Crear segmentos' },
    { id: 'export_data', label: 'Exportar datos', sensitive: true },
  ]},
  { id: 'reviews', name: 'Reviews', icon: Star, actions: [
    { id: 'view', label: 'Ver reviews' },
    { id: 'moderate', label: 'Moderar (aprobar/rechazar)' },
    { id: 'respond', label: 'Responder' },
    { id: 'highlight', label: 'Marcar destacada' },
    { id: 'view_analysis', label: 'Ver analisis' },
    { id: 'config_requests', label: 'Configurar solicitudes' },
  ]},
  { id: 'quotes', name: 'Cotizaciones', icon: FileText, actions: [
    { id: 'view', label: 'Ver cotizaciones' },
    { id: 'respond', label: 'Responder' },
    { id: 'adjust_prices', label: 'Ajustar precios' },
    { id: 'send_pdf', label: 'Enviar PDF' },
    { id: 'register_payment', label: 'Registrar anticipo' },
    { id: 'convert_order', label: 'Convertir a pedido' },
    { id: 'view_margin', label: 'Ver margen', sensitive: true },
  ]},
  { id: 'marketing', name: 'Marketing', icon: Megaphone, actions: [
    { id: 'view', label: 'Ver campanas' },
    { id: 'create_coupons', label: 'Crear/editar cupones' },
    { id: 'manage_banners', label: 'Gestionar banners' },
    { id: 'flash_sales', label: 'Crear ventas flash' },
    { id: 'referrals', label: 'Gestionar referidos' },
    { id: 'view_roi', label: 'Ver ROI', sensitive: true },
  ]},
  { id: 'finances', name: 'Finanzas', icon: DollarSign, actions: [
    { id: 'view_pnl', label: 'Ver P&L', sensitive: true },
    { id: 'view_income', label: 'Ver ingresos', sensitive: true },
    { id: 'view_costs', label: 'Ver costos', sensitive: true },
    { id: 'edit_costs', label: 'Editar costos operativos', sensitive: true },
    { id: 'view_inventory', label: 'Ver inventario' },
    { id: 'view_payments', label: 'Ver pagos/comisiones', sensitive: true },
    { id: 'generate_reports', label: 'Generar reportes', sensitive: true },
    { id: 'view_cashflow', label: 'Ver flujo de efectivo', sensitive: true },
  ]},
  { id: 'reports', name: 'Reportes & Analytics', icon: BarChart3, actions: [
    { id: 'view_dashboards', label: 'Ver dashboards' },
    { id: 'create_custom', label: 'Crear dashboards custom' },
    { id: 'export_reports', label: 'Exportar reportes' },
  ]},
  { id: 'cms', name: 'CMS', icon: Layout, actions: [
    { id: 'edit_pages', label: 'Editar paginas' },
    { id: 'manage_menus', label: 'Gestionar menus' },
    { id: 'edit_homepage', label: 'Editar homepage' },
    { id: 'blog', label: 'Crear blog posts' },
    { id: 'popups', label: 'Gestionar pop-ups' },
    { id: 'media', label: 'Gestionar media' },
    { id: 'texts', label: 'Editar textos' },
    { id: 'seo', label: 'Configurar SEO' },
  ]},
  { id: 'notifications', name: 'Notificaciones', icon: Bell, actions: [
    { id: 'view', label: 'Ver notificaciones' },
    { id: 'config_emails', label: 'Configurar emails al cliente' },
    { id: 'edit_templates', label: 'Editar plantillas' },
    { id: 'view_history', label: 'Ver historial' },
  ]},
  { id: 'automations', name: 'Automatizaciones', icon: Zap, actions: [
    { id: 'view', label: 'Ver automatizaciones' },
    { id: 'create_edit', label: 'Crear/editar workflows' },
    { id: 'activate', label: 'Activar/pausar' },
    { id: 'delete', label: 'Eliminar' },
    { id: 'view_metrics', label: 'Ver metricas' },
  ]},
  { id: 'integrations', name: 'Integraciones', icon: Plug, actions: [
    { id: 'view', label: 'Ver marketplace' },
    { id: 'install', label: 'Instalar/desinstalar apps' },
    { id: 'configure', label: 'Configurar apps' },
    { id: 'view_logs', label: 'Ver logs' },
    { id: 'manage_keys', label: 'Gestionar API keys', sensitive: true },
  ]},
  { id: 'theme', name: 'Editor de Tema', icon: Layout, actions: [
    { id: 'view', label: 'Ver tema actual' },
    { id: 'edit_branding', label: 'Editar branding/colores' },
    { id: 'edit_typography', label: 'Editar tipografia' },
    { id: 'edit_layout', label: 'Editar layout' },
    { id: 'edit_components', label: 'Editar componentes' },
    { id: 'publish', label: 'Publicar cambios' },
  ]},
  { id: 'returns', name: 'Devoluciones / RMA', icon: RotateCcw, actions: [
    { id: 'view', label: 'Ver solicitudes' },
    { id: 'review', label: 'Revisar/aprobar/rechazar' },
    { id: 'process_refund', label: 'Procesar reembolso' },
    { id: 'edit_policies', label: 'Editar politicas' },
    { id: 'view_metrics', label: 'Ver metricas' },
  ]},
  { id: 'helpdesk', name: 'Centro de Soporte', icon: Headphones, actions: [
    { id: 'view', label: 'Ver tickets' },
    { id: 'reply', label: 'Responder tickets' },
    { id: 'assign', label: 'Asignar tickets' },
    { id: 'manage_faq', label: 'Gestionar FAQ' },
    { id: 'view_metrics', label: 'Ver metricas' },
    { id: 'configure_sla', label: 'Configurar SLAs' },
  ]},
  { id: 'importexport', name: 'Importar / Exportar', icon: ArrowUpDown, actions: [
    { id: 'import', label: 'Importar datos' },
    { id: 'export', label: 'Exportar datos' },
    { id: 'migrate', label: 'Migrar plataforma' },
    { id: 'view_history', label: 'Ver historial' },
    { id: 'backup', label: 'Backup completo', sensitive: true },
  ]},
  { id: 'goals', name: 'Metas y OKRs', icon: Target, actions: [
    { id: 'view', label: 'Ver metas' },
    { id: 'create_edit', label: 'Crear/editar metas' },
    { id: 'assign', label: 'Asignar metas' },
    { id: 'view_ranking', label: 'Ver ranking equipo' },
    { id: 'view_history', label: 'Ver historial' },
  ]},
  { id: 'settings', name: 'Configuracion', icon: Wrench, actions: [
    { id: 'general', label: 'General' },
    { id: 'store', label: 'Tienda' },
    { id: 'payments', label: 'Pagos' },
    { id: 'shipping', label: 'Envios' },
    { id: 'taxes', label: 'Impuestos' },
    { id: 'users_roles', label: 'Usuarios/Roles' },
    { id: 'integrations', label: 'Integraciones' },
    { id: 'developer', label: 'Desarrollador', sensitive: true },
  ]},
];

function buildPerms(config: Record<string, { access: AccessLevel; enabledActions?: string[] }>): ModulePermission[] {
  return moduleTemplates.map(m => {
    const c = config[m.id] || { access: 'none' as AccessLevel };
    const allEnabled = c.access === 'full';
    return {
      moduleId: m.id,
      moduleName: m.name,
      moduleIcon: m.icon,
      access: c.access,
      actions: m.actions.map(a => ({
        ...a,
        enabled: c.access === 'none' ? false : allEnabled ? true : (c.enabledActions?.includes(a.id) ?? false),
      })),
    };
  });
}

const defaultRoles: Role[] = [
  {
    id: 'super_admin', name: 'Super Admin', description: 'Acceso completo a todas las pestanas y configuracion', color: 'var(--admin-accent)',
    isDefault: true, userCount: 1, scope: 'all',
    permissions: buildPerms(Object.fromEntries(moduleTemplates.map(m => [m.id, { access: 'full' as AccessLevel }]))),
  },
  {
    id: 'manager', name: 'Gerente', description: 'Todo excepto Configuracion, Usuarios, Integraciones, Desarrollador', color: '#3B82F6',
    isDefault: true, userCount: 0, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'full' }, orders: { access: 'full' }, shipping: { access: 'full' },
      products: { access: 'full' }, categories: { access: 'full' }, customers: { access: 'full' },
      reviews: { access: 'full' }, quotes: { access: 'full' }, marketing: { access: 'full' },
      finances: { access: 'read' }, reports: { access: 'full' }, cms: { access: 'edit' },
      notifications: { access: 'edit' }, settings: { access: 'none' },
    }),
  },
  {
    id: 'operations', name: 'Operaciones', description: 'Pedidos, Envios, Inventario (vista), Cotizaciones, Reviews', color: '#10B981',
    isDefault: true, userCount: 0, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'read' }, orders: { access: 'edit', enabledActions: ['view', 'change_status', 'process_engraving', 'generate_guides', 'communicate'] },
      shipping: { access: 'edit' }, products: { access: 'read', enabledActions: ['view'] },
      categories: { access: 'none' }, customers: { access: 'read' },
      reviews: { access: 'edit', enabledActions: ['view', 'moderate', 'respond'] },
      quotes: { access: 'edit', enabledActions: ['view', 'respond', 'send_pdf'] },
      marketing: { access: 'none' }, finances: { access: 'none' }, reports: { access: 'none' },
      cms: { access: 'none' }, notifications: { access: 'read' }, settings: { access: 'none' },
    }),
  },
  {
    id: 'marketing_role', name: 'Marketing', description: 'Marketing, Campanas, Banners, Reviews, CMS, Clientes (vista)', color: '#8B5CF6',
    isDefault: true, userCount: 0, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'read' }, orders: { access: 'none' }, shipping: { access: 'none' },
      products: { access: 'read' }, categories: { access: 'read' }, customers: { access: 'read' },
      reviews: { access: 'edit', enabledActions: ['view', 'respond'] },
      quotes: { access: 'none' },
      marketing: { access: 'full' }, finances: { access: 'none' },
      reports: { access: 'read' }, cms: { access: 'full' }, notifications: { access: 'edit' },
      settings: { access: 'none' },
    }),
  },
  {
    id: 'workshop', name: 'Taller', description: 'Pedidos (vista produccion), Grabado laser, Inventario (actualizar stock)', color: '#F59E0B',
    isDefault: true, userCount: 0, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'read', enabledActions: ['view_kpis'] },
      orders: { access: 'edit', enabledActions: ['view', 'change_status', 'process_engraving'] },
      shipping: { access: 'none' },
      products: { access: 'edit', enabledActions: ['view', 'manage_stock'] },
      categories: { access: 'none' }, customers: { access: 'none' }, reviews: { access: 'none' },
      quotes: { access: 'none' }, marketing: { access: 'none' }, finances: { access: 'none' },
      reports: { access: 'none' }, cms: { access: 'none' }, notifications: { access: 'read' },
      settings: { access: 'none' },
    }),
  },
  {
    id: 'accountant', name: 'Contador', description: 'Finanzas (solo lectura), Reportes (generar/exportar), Impuestos (vista)', color: '#06B6D4',
    isDefault: true, userCount: 0, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'read' }, orders: { access: 'read' }, shipping: { access: 'none' },
      products: { access: 'none' }, categories: { access: 'none' }, customers: { access: 'none' },
      reviews: { access: 'none' }, quotes: { access: 'read' }, marketing: { access: 'none' },
      finances: { access: 'read' }, reports: { access: 'edit', enabledActions: ['view_dashboards', 'export_reports'] },
      cms: { access: 'none' }, notifications: { access: 'none' },
      settings: { access: 'read', enabledActions: ['taxes'] },
    }),
  },
  {
    id: 'developer', name: 'Desarrollador', description: 'Integraciones, API Keys, Webhooks, Logs, Configuracion tecnica', color: '#EF4444',
    isDefault: true, userCount: 1, scope: 'all',
    permissions: buildPerms({
      dashboard: { access: 'read' }, orders: { access: 'none' }, shipping: { access: 'none' },
      products: { access: 'none' }, categories: { access: 'none' }, customers: { access: 'none' },
      reviews: { access: 'none' }, quotes: { access: 'none' }, marketing: { access: 'none' },
      finances: { access: 'none' }, reports: { access: 'read' }, cms: { access: 'read' },
      notifications: { access: 'read' },
      settings: { access: 'full' },
    }),
  },
  {
    id: 'seller', name: 'Vendedor', description: 'KPIs ventas, Pedidos asignados, Cotizaciones (sin margenes), Clientes (vista)', color: '#EC4899',
    isDefault: true, userCount: 0, scope: 'own',
    permissions: buildPerms({
      dashboard: { access: 'read', enabledActions: ['view_kpis', 'view_charts', 'view_activity'] },
      orders: { access: 'edit', enabledActions: ['view', 'change_status', 'communicate'] },
      shipping: { access: 'none' },
      products: { access: 'read', enabledActions: ['view'] },
      categories: { access: 'none' },
      customers: { access: 'read', enabledActions: ['view', 'view_history'] },
      reviews: { access: 'none' },
      quotes: { access: 'edit', enabledActions: ['view', 'respond', 'send_pdf'] },
      marketing: { access: 'none' }, finances: { access: 'none' }, reports: { access: 'none' },
      cms: { access: 'none' }, notifications: { access: 'read' }, settings: { access: 'none' },
    }),
  },
];

// Initial seed data — used as fallback only when API fails
const seedUsers: AdminUser[] = [
  { id: 'u1', name: 'David Perez', email: 'rocksagecapital@gmail.com', role: 'Super Admin', roleColor: 'var(--admin-accent)', status: 'active', lastAccess: 'Ahora', createdAt: '15 Ene 2025', scope: 'Todos' },
];

// ===== SHARED COMPONENTS =====
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm ' + className}>{children}</div>;
}

function Badge({ text, color }: { text: string; color?: string }) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
      style={color ? { backgroundColor: color + '15', color, borderColor: color + '30' } : undefined}
    >
      {text}
    </span>
  );
}

function StatusDot({ status }: { status: 'active' | 'inactive' | 'invited' }) {
  const cfg = { active: 'bg-green-500', inactive: 'bg-wood-300', invited: 'bg-amber-400' };
  const labels = { active: 'Activo', inactive: 'Inactivo', invited: 'Invitado' };
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-[var(--admin-text-secondary)]">
      <span className={'w-1.5 h-1.5 rounded-full ' + cfg[status]} />
      {labels[status]}
    </span>
  );
}

// ===== SUB-TAB 1: USERS =====
function UsersPanel() {
  const [showInvite, setShowInvite] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.users?.length > 0) {
          setUsers(d.users.map((u: any) => ({
            id: u.id,
            name: u.full_name || u.email?.split('@')[0] || 'Usuario',
            email: u.email || '',
            role: u.role_name || 'Sin rol',
            roleColor: u.role_color || '#94a3b8',
            status: u.status || 'active',
            lastAccess: u.last_access ? new Date(u.last_access).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Nunca',
            createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            scope: u.scope || 'Todos',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuarios..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[var(--admin-border)] rounded-lg outline-none focus:border-[var(--admin-accent)]/50 bg-[var(--admin-surface)]"
          />
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="px-3 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <UserPlus size={12} /> Invitar usuario
        </button>
      </div>

      {/* Invite form */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="p-4">
              <h4 className="text-xs font-medium text-[var(--admin-text)] mb-3 flex items-center gap-1.5">
                <Mail size={12} className="text-[var(--admin-accent)]" /> Invitar nuevo usuario
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Nombre</label>
                  <input placeholder="Nombre completo" className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Email</label>
                  <input placeholder="email@ejemplo.com" className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Rol</label>
                  <select className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]">
                    {defaultRoles.map(r => <option key={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Scope</label>
                  <select className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]">
                    <option>Todos los datos</option>
                    <option>Solo asignados</option>
                    <option>Equipo</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => { toast.success('Invitacion enviada'); setShowInvite(false); }} className="px-3 py-1.5 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90">
                  Enviar invitacion
                </button>
                <button onClick={() => setShowInvite(false)} className="px-3 py-1.5 text-xs border border-[var(--admin-border)] text-[var(--admin-text-secondary)] rounded-lg hover:bg-[var(--admin-surface2)]">
                  Cancelar
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
                <th className="px-4 py-2.5">Usuario</th>
                <th className="px-4 py-2.5">Rol</th>
                <th className="px-4 py-2.5">Scope</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5">Ultimo acceso</th>
                <th className="px-4 py-2.5">Desde</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--admin-surface2)] flex items-center justify-center text-xs font-medium text-[var(--admin-text-secondary)]">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[var(--admin-text)]">{u.name}</p>
                        <p className="text-[10px] text-[var(--admin-muted)] font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge text={u.role} color={u.roleColor} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{u.scope}</td>
                  <td className="px-4 py-3"><StatusDot status={u.status} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">{u.lastAccess}</td>
                  <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">{u.createdAt}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-[var(--admin-surface2)] text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total usuarios', value: users.length.toString() },
          { label: 'Activos', value: users.filter(u => u.status === 'active').length.toString() },
          { label: 'Invitaciones pendientes', value: users.filter(u => u.status === 'invited').length.toString() },
          { label: 'Roles en uso', value: new Set(users.map(u => u.role)).size.toString() },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-lg font-serif text-[var(--admin-text)]">{s.value}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== SUB-TAB 2: ROLES =====
function RolesPanel() {
  const [roles] = useState(defaultRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  if (selectedRole) {
    return <RoleDetail role={selectedRole} onBack={() => { setSelectedRole(null); setExpandedModule(null); }} expandedModule={expandedModule} setExpandedModule={setExpandedModule} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--admin-text-secondary)]">{roles.length} roles configurados</p>
        <button onClick={() => toast.success('Crear rol personalizado (proximamente)')} className="px-3 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors flex items-center gap-1.5">
          <Plus size={12} /> Crear rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {roles.map(role => {
          const moduleCount = role.permissions.filter(p => p.access !== 'none').length;
          return (
            <Card key={role.id} className="p-4 hover:border-[var(--admin-border)] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color + '15' }}>
                    <Shield size={16} style={{ color: role.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-medium text-[var(--admin-text)]">{role.name}</h4>
                      {role.isDefault && <span className="text-[8px] bg-[var(--admin-surface2)] text-[var(--admin-muted)] px-1.5 py-0.5 rounded">Default</span>}
                    </div>
                    <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{role.description}</p>
                  </div>
                </div>
              </div>

              {/* Access summary mini-bar */}
              <div className="flex items-center gap-0.5 mb-3">
                {role.permissions.map(p => (
                  <div
                    key={p.moduleId}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: p.access === 'full' ? '#10B981' : p.access === 'edit' ? '#F59E0B' : p.access === 'read' ? '#3B82F6' : '#E5E7EB',
                    }}
                    title={`${p.moduleName}: ${accessLabels[p.access].label}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-[var(--admin-muted)]">
                  <span>{moduleCount}/{moduleTemplates.length} modulos</span>
                  <span>{role.userCount} usuario{role.userCount !== 1 ? 's' : ''}</span>
                  <span className="capitalize">Scope: {role.scope === 'all' ? 'Todos' : role.scope === 'own' ? 'Propios' : 'Equipo'}</span>
                </div>
                <button
                  onClick={() => setSelectedRole(role)}
                  className="text-[10px] text-[var(--admin-accent)] font-medium hover:underline flex items-center gap-0.5"
                >
                  Ver permisos <ChevronRight size={10} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[10px] text-[var(--admin-muted)] font-medium">Leyenda:</span>
          {(['full', 'edit', 'read', 'none'] as AccessLevel[]).map(level => {
            const cfg = accessLabels[level];
            const Icon = cfg.icon;
            return (
              <span key={level} className="flex items-center gap-1.5 text-[10px] text-[var(--admin-text-secondary)]">
                <span className={'w-5 h-5 rounded flex items-center justify-center border ' + cfg.cls}>
                  <Icon size={10} />
                </span>
                {cfg.label}
              </span>
            );
          })}
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--admin-text-secondary)] ml-auto">
            <Lock size={10} className="text-red-400" /> Dato sensible
          </span>
        </div>
      </Card>
    </div>
  );
}

// ===== ROLE DETAIL with PERMISSIONS MATRIX =====
function RoleDetail({ role, onBack, expandedModule, setExpandedModule }: {
  role: Role;
  onBack: () => void;
  expandedModule: string | null;
  setExpandedModule: (id: string | null) => void;
}) {
  const [perms, setPerms] = useState(role.permissions);

  const handleAccessChange = (moduleId: string, newAccess: AccessLevel) => {
    setPerms(prev => prev.map(p => {
      if (p.moduleId !== moduleId) return p;
      return {
        ...p,
        access: newAccess,
        actions: p.actions.map(a => ({
          ...a,
          enabled: newAccess === 'none' ? false : newAccess === 'full' ? true : a.enabled,
        })),
      };
    }));
  };

  const handleActionToggle = (moduleId: string, actionId: string) => {
    setPerms(prev => prev.map(p => {
      if (p.moduleId !== moduleId) return p;
      return {
        ...p,
        actions: p.actions.map(a => a.id === actionId ? { ...a, enabled: !a.enabled } : a),
      };
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-[var(--admin-surface2)] text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] transition-colors">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color + '15' }}>
            <Shield size={16} style={{ color: role.color }} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--admin-text)]">{role.name}</h3>
            <p className="text-[10px] text-[var(--admin-muted)]">{role.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success('Permisos guardados para ' + role.name)} className="px-3 py-1.5 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 flex items-center gap-1">
            <Check size={12} /> Guardar
          </button>
        </div>
      </div>

      {/* Scope */}
      <Card className="p-3">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[var(--admin-muted)] font-medium uppercase tracking-wider">Scope de datos:</span>
          {[
            { value: 'all', label: 'Todos los datos', desc: 'Ve pedidos, cotizaciones y clientes de todos' },
            { value: 'own', label: 'Solo asignados', desc: 'Solo ve los registros que le fueron asignados' },
            { value: 'team', label: 'Equipo', desc: 'Ve los datos de su equipo' },
          ].map(s => (
            <label key={s.value} className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)] cursor-pointer" title={s.desc}>
              <input type="radio" name="scope" defaultChecked={role.scope === s.value} className="text-[var(--admin-accent)]" />
              {s.label}
            </label>
          ))}
        </div>
      </Card>

      {/* Permissions Matrix */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 bg-[var(--admin-surface2)]/50 border-b border-[var(--admin-border)]">
          <div className="flex items-center">
            <span className="text-[10px] text-[var(--admin-muted)] font-medium uppercase tracking-wider flex-1">Modulo</span>
            <div className="flex items-center gap-1 w-[280px] justify-end">
              {(['none', 'read', 'edit', 'full'] as AccessLevel[]).map(level => (
                <span key={level} className="w-16 text-center text-[9px] text-[var(--admin-muted)] uppercase">{accessLabels[level].label}</span>
              ))}
            </div>
            <span className="w-8" />
          </div>
        </div>

        <div className="divide-y divide-wood-50">
          {perms.map(perm => {
            const Icon = perm.moduleIcon;
            const isExpanded = expandedModule === perm.moduleId;
            const enabledCount = perm.actions.filter(a => a.enabled).length;
            const hasSensitive = perm.actions.some(a => a.sensitive);

            return (
              <div key={perm.moduleId}>
                {/* Module row */}
                <div className="flex items-center px-4 py-2.5 hover:bg-[var(--admin-surface2)]/30 transition-colors">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Icon size={14} className="text-[var(--admin-muted)] shrink-0" />
                    <span className="text-xs text-[var(--admin-text)] font-medium truncate">{perm.moduleName}</span>
                    {hasSensitive && perm.access !== 'none' && <Lock size={9} className="text-red-400 shrink-0" />}
                    {perm.access !== 'none' && (
                      <span className="text-[9px] text-[var(--admin-muted)]">{enabledCount}/{perm.actions.length}</span>
                    )}
                  </div>

                  {/* Access level radio buttons */}
                  <div className="flex items-center gap-1 w-[280px] justify-end">
                    {(['none', 'read', 'edit', 'full'] as AccessLevel[]).map(level => {
                      const cfg = accessLabels[level];
                      const LevelIcon = cfg.icon;
                      const isActive = perm.access === level;
                      return (
                        <button
                          key={level}
                          onClick={() => handleAccessChange(perm.moduleId, level)}
                          className={
                            'w-16 h-7 rounded flex items-center justify-center gap-1 text-[9px] border transition-all ' +
                            (isActive ? cfg.cls + ' font-medium' : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface2)]')
                          }
                        >
                          <LevelIcon size={10} />
                        </button>
                      );
                    })}
                  </div>

                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedModule(isExpanded ? null : perm.moduleId)}
                    className="w-8 flex items-center justify-center text-[var(--admin-muted)] hover:text-[var(--admin-text-secondary)]"
                    disabled={perm.access === 'none'}
                  >
                    {perm.access !== 'none' && (
                      <ChevronDown size={12} className={'transition-transform ' + (isExpanded ? 'rotate-180' : '')} />
                    )}
                  </button>
                </div>

                {/* Granular actions */}
                <AnimatePresence>
                  {isExpanded && perm.access !== 'none' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pr-4 pb-3 space-y-0.5">
                        {perm.actions.map(action => (
                          <label
                            key={action.id}
                            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[var(--admin-surface2)]/50 transition-colors cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={action.enabled}
                              onChange={() => handleActionToggle(perm.moduleId, action.id)}
                              className="rounded border-wood-300 text-[var(--admin-accent)] w-3.5 h-3.5"
                            />
                            <span className={'text-[11px] ' + (action.enabled ? 'text-[var(--admin-text)]' : 'text-[var(--admin-muted)]')}>
                              {action.label}
                            </span>
                            {action.sensitive && (
                              <span className="text-[8px] bg-red-50 text-red-500 px-1 py-0.5 rounded flex items-center gap-0.5">
                                <Lock size={7} /> Sensible
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sensitive data summary */}
      <Card className="p-4">
        <h4 className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider font-medium mb-2 flex items-center gap-1.5">
          <AlertTriangle size={10} className="text-amber-500" /> Datos sensibles expuestos para este rol
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {perms.flatMap(p => p.actions.filter(a => a.sensitive && a.enabled).map(a => (
            <span key={p.moduleId + '-' + a.id} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">
              {p.moduleName}: {a.label}
            </span>
          )))}
          {perms.flatMap(p => p.actions.filter(a => a.sensitive && a.enabled)).length === 0 && (
            <span className="text-[10px] text-green-600">Ningun dato sensible expuesto</span>
          )}
        </div>
      </Card>
    </div>
  );
}

// ===== SUB-TAB 3: AUDIT LOG =====
function AuditPanel() {
  const [moduleFilter, setModuleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users?type=audit')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.audit?.length > 0) {
          setAuditData(d.audit.map((a: any) => ({
            id: a.id,
            timestamp: a.created_at ? new Date(a.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
            user: a.user_name || a.user_email || 'Sistema',
            role: a.user_role || '',
            action: a.action || '',
            module: a.module || '',
            detail: a.detail || '',
            ip: a.ip_address || '',
          })));
        }
      })
      .catch(() => {})
      .finally(() => setAuditLoading(false));
  }, []);

  const filtered = auditData.filter(a => {
    if (moduleFilter !== 'all' && a.module !== moduleFilter) return false;
    if (userFilter !== 'all' && a.user !== userFilter) return false;
    return true;
  });

  const modules = [...new Set(auditData.map(a => a.module))];
  const users = [...new Set(auditData.map(a => a.user))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--admin-muted)]">
          <Filter size={10} /> Filtros:
        </div>
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="border border-[var(--admin-border)] rounded-lg px-2.5 py-1.5 text-xs bg-[var(--admin-surface)] outline-none"
        >
          <option value="all">Todos los modulos</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="border border-[var(--admin-border)] rounded-lg px-2.5 py-1.5 text-xs bg-[var(--admin-surface)] outline-none"
        >
          <option value="all">Todos los usuarios</option>
          {users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <button className="px-2.5 py-1.5 text-xs border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface2)] transition-colors flex items-center gap-1 ml-auto">
          <Download size={10} /> Exportar
        </button>
      </div>

      {/* Log entries */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider border-b border-[var(--admin-border)] bg-[var(--admin-surface2)]/50">
                <th className="px-4 py-2.5">Fecha/Hora</th>
                <th className="px-4 py-2.5">Usuario</th>
                <th className="px-4 py-2.5">Rol</th>
                <th className="px-4 py-2.5">Modulo</th>
                <th className="px-4 py-2.5">Accion</th>
                <th className="px-4 py-2.5">Detalle</th>
                <th className="px-4 py-2.5">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-[var(--admin-surface2)]/50 transition-colors">
                  <td className="px-4 py-2.5 text-[11px] text-[var(--admin-text-secondary)] whitespace-nowrap font-mono">{entry.timestamp}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[var(--admin-surface2)] flex items-center justify-center text-[8px] font-medium text-[var(--admin-text-secondary)]">
                        {entry.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-xs text-[var(--admin-text)]">{entry.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] text-[var(--admin-text-secondary)] bg-[var(--admin-surface2)] px-1.5 py-0.5 rounded">{entry.role}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--admin-text-secondary)]">{entry.module}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--admin-text)] font-medium">{entry.action}</td>
                  <td className="px-4 py-2.5 text-[11px] text-[var(--admin-text-secondary)]">{entry.detail}</td>
                  <td className="px-4 py-2.5 text-[10px] text-[var(--admin-muted)] font-mono">{entry.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-[var(--admin-muted)]">
            No se encontraron registros con los filtros aplicados
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total registros', value: auditData.length.toString() },
          { label: 'Hoy', value: auditData.filter(a => { const d = new Date(); return a.timestamp.includes(d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })); }).length.toString() },
          { label: 'Usuarios activos', value: new Set(auditData.map(a => a.user)).size.toString() },
          { label: 'Modulos con actividad', value: new Set(auditData.map(a => a.module)).size.toString() },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-lg font-serif text-[var(--admin-text)]">{s.value}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">{s.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ===== MAIN COMPONENT =====
export const UsersRolesManager: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('users');
  const { Card: TCard, Badge: TBadge, Button: TButton, Table: TTable, StatCard: TStatCard } = useThemeComponents();

  const subTabs: Array<{ id: SubTab; label: string; icon: React.ElementType; count?: number }> = [
    { id: 'users', label: 'Usuarios', icon: Users, count: seedUsers.length },
    { id: 'roles', label: 'Roles y Permisos', icon: Shield, count: defaultRoles.length },
    { id: 'audit', label: 'Registro de Actividad', icon: ScrollText },
  ];

  return (
    <div className="space-y-5">
      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-[var(--admin-border)]">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={
              'flex items-center gap-1.5 px-3 py-2 text-xs transition-colors border-b-2 ' +
              (subTab === t.id
                ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] font-medium'
                : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]')
            }
          >
            <t.icon size={13} />
            {t.label}
            {t.count !== undefined && (
              <span className="text-[9px] bg-[var(--admin-surface2)] text-[var(--admin-muted)] px-1.5 py-0.5 rounded-full">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={subTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {subTab === 'users' && <UsersPanel />}
          {subTab === 'roles' && <RolesPanel />}
          {subTab === 'audit' && <AuditPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};