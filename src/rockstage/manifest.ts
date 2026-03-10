/**
 * RockSage Commerce — Module Manifest
 *
 * Inventario canónico de todos los módulos disponibles en la plataforma.
 * Cada módulo tiene un ID único, metadatos, plan mínimo requerido,
 * y referencia a su implementación.
 *
 * STATUS:
 *   'stable'      — Producción, feature-complete
 *   'beta'        — Funcional, puede cambiar
 *   'planned'     — En roadmap, no implementado
 *   'deprecated'  — No usar en tenants nuevos
 */

export type ModuleStatus = 'stable' | 'beta' | 'planned' | 'deprecated';
export type ModuleCategory =
  | 'core'        // Necesario para operar (catalog, checkout, orders)
  | 'commerce'    // Ventas avanzadas (pos, b2b, quotes)
  | 'marketing'   // Adquisición y retención
  | 'operations'  // Logística y administración
  | 'analytics'   // Reportes y métricas
  | 'platform';   // Infraestructura SaaS (themes, cms, api)

import type { TenantPlan } from './tenant';

export interface RockSageModule {
  /** ID único — kebab-case, estable en el tiempo */
  id: string;
  /** Nombre visible en el marketplace */
  name: string;
  /** Descripción corta (≤120 chars) */
  description: string;
  /** Versión semántica */
  version: string;
  /** Estado de implementación */
  status: ModuleStatus;
  /** Categoría para el marketplace */
  category: ModuleCategory;
  /** Plan mínimo que incluye este módulo */
  minPlan: TenantPlan;
  /** Módulos requeridos como dependencia */
  requires: string[];
  /** Módulos incompatibles */
  conflicts: string[];
  /** Ruta al admin panel de este módulo (relativa a /admin) */
  adminPath?: string;
  /** Ruta pública del módulo (relativa a /) */
  publicPath?: string;
}

// ─── Módulos del sistema ───────────────────────────────────────────────────────

export const ROCKSAGE_MODULES: RockSageModule[] = [

  // ── CORE ────────────────────────────────────────────────────────────────────
  {
    id: 'catalog',
    name: 'Catálogo de Productos',
    description: 'Gestión de productos, categorías, variantes, imágenes y precios.',
    version: '1.0.0',
    status: 'stable',
    category: 'core',
    minPlan: 'starter',
    requires: [],
    conflicts: [],
    adminPath: '/products',
    publicPath: '/products',
  },
  {
    id: 'checkout',
    name: 'Checkout',
    description: 'Carrito de compra, dirección de envío y flujo de pago completo.',
    version: '1.0.0',
    status: 'stable',
    category: 'core',
    minPlan: 'starter',
    requires: ['catalog'],
    conflicts: [],
    publicPath: '/checkout',
  },
  {
    id: 'orders',
    name: 'Pedidos',
    description: 'Gestión completa de órdenes: estados, fulfillment, devoluciones.',
    version: '1.0.0',
    status: 'stable',
    category: 'core',
    minPlan: 'starter',
    requires: ['checkout'],
    conflicts: [],
    adminPath: '/orders',
  },
  {
    id: 'customers',
    name: 'Clientes',
    description: 'Base de datos de clientes, historial de compras y perfil.',
    version: '1.0.0',
    status: 'stable',
    category: 'core',
    minPlan: 'starter',
    requires: [],
    conflicts: [],
    adminPath: '/customers',
  },

  // ── COMMERCE ────────────────────────────────────────────────────────────────
  {
    id: 'quotes',
    name: 'Cotizador Pro',
    description: 'Wizard de cotización multi-paso con precios dinámicos y grabado láser.',
    version: '1.0.0',
    status: 'stable',
    category: 'commerce',
    minPlan: 'pro',
    requires: ['catalog'],
    conflicts: [],
    adminPath: '/quotes',
    publicPath: '/quote',
  },
  {
    id: 'pos',
    name: 'Punto de Venta (POS)',
    description: 'Terminal de ventas presenciales integrada con inventario y catálogo.',
    version: '1.0.0',
    status: 'stable',
    category: 'commerce',
    minPlan: 'pro',
    requires: ['catalog', 'orders'],
    conflicts: [],
    adminPath: '/pos',
  },
  {
    id: 'b2b',
    name: 'B2B / Mayoreo',
    description: 'Precios especiales por volumen, aprobación de cuentas y listas de precio.',
    version: '0.1.0',
    status: 'planned',
    category: 'commerce',
    minPlan: 'pro',
    requires: ['catalog', 'customers'],
    conflicts: [],
    adminPath: '/b2b',
  },
  {
    id: 'shipping_advanced',
    name: 'Envíos Avanzados',
    description: 'Multi-carrier (FedEx, DHL, Estafeta), cotización en tiempo real vía Envia.com.',
    version: '1.0.0',
    status: 'stable',
    category: 'commerce',
    minPlan: 'pro',
    requires: ['orders'],
    conflicts: [],
    adminPath: '/shipping',
  },
  {
    id: 'inventory',
    name: 'Inventario',
    description: 'Control de stock, alertas de reorden, múltiples ubicaciones.',
    version: '1.0.0',
    status: 'stable',
    category: 'commerce',
    minPlan: 'growth',
    requires: ['catalog'],
    conflicts: [],
    adminPath: '/inventory',
  },

  // ── MARKETING ───────────────────────────────────────────────────────────────
  {
    id: 'loyalty',
    name: 'Programa de Lealtad',
    description: '4 tiers (Pino/Nogal/Parota/Ébano), puntos y descuentos automáticos.',
    version: '1.0.0',
    status: 'stable',
    category: 'marketing',
    minPlan: 'growth',
    requires: ['customers'],
    conflicts: [],
    adminPath: '/loyalty',
  },
  {
    id: 'reviews',
    name: 'Reseñas',
    description: 'Reviews verificadas con foto, respuestas del vendedor y moderación.',
    version: '1.0.0',
    status: 'stable',
    category: 'marketing',
    minPlan: 'growth',
    requires: ['catalog', 'orders'],
    conflicts: [],
    adminPath: '/reviews',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Cupones, campañas de email, banners, flash sales y programa de referidos.',
    version: '1.0.0',
    status: 'beta',
    category: 'marketing',
    minPlan: 'growth',
    requires: ['customers'],
    conflicts: [],
    adminPath: '/marketing',
  },
  {
    id: 'automations',
    name: 'Automatizaciones',
    description: 'Reglas trigger→acción: emails, descuentos, alertas basadas en eventos.',
    version: '0.9.0',
    status: 'beta',
    category: 'marketing',
    minPlan: 'pro',
    requires: ['orders', 'customers'],
    conflicts: [],
    adminPath: '/automations',
  },

  // ── OPERATIONS ──────────────────────────────────────────────────────────────
  {
    id: 'support',
    name: 'Soporte al Cliente',
    description: 'Tickets de soporte con SLA, chat en vivo (Supabase Realtime) y auto-routing.',
    version: '1.0.0',
    status: 'stable',
    category: 'operations',
    minPlan: 'growth',
    requires: ['customers'],
    conflicts: [],
    adminPath: '/chat',
  },
  {
    id: 'warranty',
    name: 'Garantías',
    description: 'Gestión de reclamaciones de garantía, resolución y seguimiento.',
    version: '1.0.0',
    status: 'stable',
    category: 'operations',
    minPlan: 'pro',
    requires: ['orders'],
    conflicts: [],
    adminPath: '/warranties',
  },
  {
    id: 'notifications',
    name: 'Notificaciones',
    description: 'Templates de email transaccional, configuración de envíos y log.',
    version: '1.0.0',
    status: 'stable',
    category: 'operations',
    minPlan: 'starter',
    requires: [],
    conflicts: [],
    adminPath: '/notifications',
  },
  {
    id: 'invoicing',
    name: 'Facturación CFDI',
    description: 'Generación de facturas electrónicas CFDI 4.0 para México.',
    version: '0.1.0',
    status: 'planned',
    category: 'operations',
    minPlan: 'pro',
    requires: ['orders'],
    conflicts: [],
    adminPath: '/billing',
  },

  // ── ANALYTICS ───────────────────────────────────────────────────────────────
  {
    id: 'reports',
    name: 'Reportes',
    description: 'Dashboard de métricas: ventas, conversión, productos top, tendencias.',
    version: '1.0.0',
    status: 'stable',
    category: 'analytics',
    minPlan: 'growth',
    requires: ['orders'],
    conflicts: [],
    adminPath: '/reports',
  },
  {
    id: 'goals',
    name: 'Metas y OKRs',
    description: 'Definición y seguimiento de objetivos de negocio con progreso visual.',
    version: '1.0.0',
    status: 'beta',
    category: 'analytics',
    minPlan: 'pro',
    requires: ['reports'],
    conflicts: [],
    adminPath: '/goals',
  },
  {
    id: 'finances',
    name: 'Finanzas',
    description: 'Resumen financiero, proyecciones, costos y margen por producto.',
    version: '1.0.0',
    status: 'stable',
    category: 'analytics',
    minPlan: 'pro',
    requires: ['orders'],
    conflicts: [],
    adminPath: '/finances',
  },

  // ── PLATFORM ────────────────────────────────────────────────────────────────
  {
    id: 'cms',
    name: 'CMS',
    description: 'Editor de contenido: menús, homepage, blog, páginas legales, pop-ups.',
    version: '1.0.0',
    status: 'stable',
    category: 'platform',
    minPlan: 'growth',
    requires: [],
    conflicts: [],
    adminPath: '/cms',
  },
  {
    id: 'theme_engine',
    name: 'Editor de Tema',
    description: 'Personalización de colores, fuentes y aspecto visual de la tienda.',
    version: '1.0.0',
    status: 'beta',
    category: 'platform',
    minPlan: 'growth',
    requires: [],
    conflicts: [],
    adminPath: '/theme',
  },
  {
    id: 'integrations',
    name: 'Integraciones',
    description: 'Marketplace de apps: pasarelas de pago, carriers, analytics, ERPs.',
    version: '1.0.0',
    status: 'stable',
    category: 'platform',
    minPlan: 'pro',
    requires: [],
    conflicts: [],
    adminPath: '/integrations',
  },
  {
    id: 'import_export',
    name: 'Importar / Exportar',
    description: 'Migración de catálogo, pedidos y clientes en CSV/JSON.',
    version: '1.0.0',
    status: 'stable',
    category: 'platform',
    minPlan: 'growth',
    requires: [],
    conflicts: [],
    adminPath: '/import-export',
  },
  {
    id: 'users_roles',
    name: 'Usuarios y Roles',
    description: 'Gestión de equipo, permisos granulares y control de acceso al panel.',
    version: '1.0.0',
    status: 'stable',
    category: 'platform',
    minPlan: 'starter',
    requires: [],
    conflicts: [],
    adminPath: '/users',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Busca un módulo por ID. Lanza si no existe. */
export function getModule(id: string): RockSageModule {
  const mod = ROCKSAGE_MODULES.find(m => m.id === id);
  if (!mod) throw new Error(`[RockSage] Module not found: ${id}`);
  return mod;
}

/** Filtra módulos por categoría */
export function getModulesByCategory(category: ModuleCategory): RockSageModule[] {
  return ROCKSAGE_MODULES.filter(m => m.category === category);
}

/** Filtra módulos disponibles para un plan dado */
export function getModulesForPlan(plan: TenantPlan): RockSageModule[] {
  const order: TenantPlan[] = ['starter', 'growth', 'pro', 'full'];
  const planIndex = order.indexOf(plan);
  return ROCKSAGE_MODULES.filter(m => order.indexOf(m.minPlan) <= planIndex);
}
