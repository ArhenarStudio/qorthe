// ═══════════════════════════════════════════════════════════════
// Admin Navigation — Separated from UI rendering
// Themes render this data but do NOT define it
// ═══════════════════════════════════════════════════════════════

import {
  LayoutDashboard, ShoppingBag, Truck, Package, FolderTree, Boxes,
  Users, Star, FileText, Megaphone, DollarSign,
  BarChart3, FileEdit, Bell, Settings,
  Zap, Plug, Palette, RotateCcw, Headphones, ArrowUpDown,
  Target, MessageSquare, Monitor,
  type LucideIcon,
} from 'lucide-react';

export type AdminPage =
  | 'dashboard' | 'orders' | 'shipping' | 'products' | 'categories' | 'inventory'
  | 'customers' | 'reviews' | 'quotes' | 'marketing' | 'chat'
  | 'finances' | 'reports' | 'cms' | 'notifications' | 'automations'
  | 'integrations' | 'theme' | 'appearance' | 'returns' | 'helpdesk'
  | 'importexport' | 'goals' | 'settings' | 'pos' | 'users';

export interface NavItem {
  id: AdminPage;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// Icon registry — themes can swap icons via this map
export const adminIcons: Record<AdminPage, LucideIcon> = {
  dashboard: LayoutDashboard,
  pos: Zap,
  orders: ShoppingBag,
  shipping: Truck,
  quotes: FileText,
  returns: RotateCcw,
  products: Package,
  inventory: Boxes,
  categories: FolderTree,
  customers: Users,
  reviews: Star,
  chat: MessageSquare,
  helpdesk: Headphones,
  marketing: Megaphone,
  goals: Target,
  finances: DollarSign,
  reports: BarChart3,
  cms: FileEdit,
  theme: Palette,
  appearance: Monitor,
  automations: Zap,
  integrations: Plug,
  importexport: ArrowUpDown,
  notifications: Bell,
  users: Users,
  settings: Settings,
};

export const adminNavigation: NavGroup[] = [
  {
    id: 'general',
    label: '',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: adminIcons.dashboard },
    ],
  },
  {
    id: 'ventas',
    label: 'Ventas',
    items: [
      { id: 'pos', label: 'Punto de Venta', icon: adminIcons.pos },
      { id: 'orders', label: 'Pedidos', icon: adminIcons.orders },
      { id: 'shipping', label: 'Envios', icon: adminIcons.shipping },
      { id: 'quotes', label: 'Cotizaciones', icon: adminIcons.quotes },
      { id: 'returns', label: 'Devoluciones', icon: adminIcons.returns },
    ],
  },
  {
    id: 'catalogo',
    label: 'Catalogo',
    items: [
      { id: 'products', label: 'Productos', icon: adminIcons.products },
      { id: 'inventory', label: 'Inventario', icon: adminIcons.inventory },
      { id: 'categories', label: 'Categorias', icon: adminIcons.categories },
    ],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    items: [
      { id: 'customers', label: 'Clientes', icon: adminIcons.customers },
      { id: 'reviews', label: 'Reviews', icon: adminIcons.reviews },
      { id: 'chat', label: 'Chat en Vivo', icon: adminIcons.chat },
      { id: 'helpdesk', label: 'Soporte', icon: adminIcons.helpdesk },
    ],
  },
  {
    id: 'crecimiento',
    label: 'Crecimiento',
    items: [
      { id: 'marketing', label: 'Marketing', icon: adminIcons.marketing },
      { id: 'goals', label: 'Metas y OKRs', icon: adminIcons.goals },
    ],
  },
  {
    id: 'finanzas',
    label: 'Finanzas',
    items: [
      { id: 'finances', label: 'Finanzas', icon: adminIcons.finances },
      { id: 'reports', label: 'Reportes', icon: adminIcons.reports },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    items: [
      { id: 'cms', label: 'CMS', icon: adminIcons.cms },
      { id: 'theme', label: 'Editor de Tema', icon: adminIcons.theme },
      { id: 'appearance', label: 'Apariencia del Panel', icon: adminIcons.appearance },
    ],
  },
  {
    id: 'sistema',
    label: 'Sistema',
    items: [
      { id: 'automations', label: 'Automatizaciones', icon: adminIcons.automations },
      { id: 'integrations', label: 'Integraciones', icon: adminIcons.integrations },
      { id: 'importexport', label: 'Importar / Exportar', icon: adminIcons.importexport },
      { id: 'notifications', label: 'Notificaciones', icon: adminIcons.notifications },
      { id: 'users', label: 'Equipo', icon: adminIcons.users },
      { id: 'settings', label: 'Configuracion', icon: adminIcons.settings },
    ],
  },
];

// Flat list for search
export const allNavItems: NavItem[] = adminNavigation.flatMap(g => g.items);
