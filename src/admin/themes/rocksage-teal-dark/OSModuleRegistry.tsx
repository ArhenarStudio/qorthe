"use client";
// ═══════════════════════════════════════════════════════════════
// OSModuleRegistry.tsx — Mapa AdminPage → componente de ventana OS
//
// Cada entrada define:
//   component : React.ComponentType montado dentro de OSWindow
//   subtitle  : texto bajo el título en la chrome de la ventana
//   width     : ancho de la OSWindow (default "920px")
//
// Regla: siempre usar el componente real existente.
// Fallback solo para módulos sin componente aún implementado.
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import type { AdminPage } from '@/src/admin/navigation';
import { useAdmin } from '@/contexts/AdminContext';

// ── Imports de componentes reales ────────────────────────────
import { DashboardHome }          from '@/components/admin/DashboardHome';
import { POSPage }                from '@/src/components/admin/pos/POSPage';
import { OrdersPage }             from '@/components/admin/OrdersPage';
import ShippingPageLive            from '@/components/admin/ShippingPageLive';
import { ProductsPage }           from '@/components/admin/ProductsPage';
import { CategoriesPage }         from '@/components/admin/CategoriesPage';
import { InventoryPage }          from '@/components/admin/InventoryPage';
import { CustomersPage }          from '@/components/admin/CustomersPage';
import { ReviewsPage }            from '@/components/admin/ReviewsPage';
import { QuotesPage }             from '@/components/admin/QuotesPage';
import { MarketingPage }          from '@/components/admin/MarketingPage';
import { AdminChatPage }          from '@/components/admin/AdminChatPage';
import { FinancesPage }           from '@/components/admin/FinancesPage';
import { ReportsAnalyticsPage }   from '@/components/admin/ReportsAnalyticsPage';
import { CmsPage }                from '@/components/admin/CmsPage';
import { NotificationsPage }      from '@/components/admin/NotificationsPage';
import { AutomationsPage }        from '@/components/admin/AutomationsPage';
import { IntegrationsStorePage }  from '@/components/admin/IntegrationsStorePage';
import { ThemeEditorPage }        from '@/components/admin/ThemeEditorPage';
import { AdminThemeSelector }     from '@/components/admin/AdminThemeSelector';
import { ReturnsRmaPage }         from '@/components/admin/ReturnsRmaPage';
import { HelpDeskPage }           from '@/components/admin/HelpDeskPage';
import { ImportExportPage }       from '@/components/admin/ImportExportPage';
import { GoalsOkrsPage }          from '@/components/admin/GoalsOkrsPage';
import { SettingsPage }           from '@/components/admin/SettingsPage';
import { UsersPage }              from '@/components/admin/UsersPage';
import { LoyaltyConfigPanel }     from '@/components/admin/LoyaltyConfigPanel';

// ── Tipo de entrada ──────────────────────────────────────────
interface OSModuleEntry {
  component: React.ComponentType;
  subtitle: string;
  width?: string;
}

// ── Wrappers para componentes con props requeridas ───────────
function DashboardWrapper() {
  const { period, navigate } = useAdmin();
  return <DashboardHome period={period} onNavigate={navigate} />;
}

function POSWrapper() {
  return <POSPage windowMode />;
}

// ── Registry completo ────────────────────────────────────────
const REGISTRY: Record<AdminPage, OSModuleEntry> = {
  dashboard:    { component: DashboardWrapper,         subtitle: 'Resumen general del negocio',         width: '1100px' },
  pos:          { component: POSWrapper,            subtitle: 'Venta directa y presencial',          width: '1100px' },
  orders:       { component: OrdersPage,            subtitle: 'Gestión de órdenes',                  width: '1100px' },
  shipping:     { component: ShippingPageLive,      subtitle: 'Envíos y configuración de zonas',     width: '1100px' },
  products:     { component: ProductsPage,          subtitle: 'Catálogo de productos',               width: '1100px' },
  categories:   { component: CategoriesPage,        subtitle: 'Categorías y colecciones',            width: '960px'  },
  inventory:    { component: InventoryPage,         subtitle: 'Control de stock e inventario',       width: '1100px' },
  customers:    { component: CustomersPage,         subtitle: 'Clientes y segmentos',                width: '1100px' },
  reviews:      { component: ReviewsPage,           subtitle: 'Reseñas y calificaciones',            width: '960px'  },
  quotes:       { component: QuotesPage,            subtitle: 'Cotizaciones y presupuestos',         width: '1100px' },
  marketing:    { component: MarketingPage,         subtitle: 'Campañas y descuentos',               width: '1100px' },
  chat:         { component: AdminChatPage,         subtitle: 'Chat en vivo con clientes',           width: '1100px' },
  finances:     { component: FinancesPage,          subtitle: 'Finanzas y flujo de caja',            width: '1100px' },
  reports:      { component: ReportsAnalyticsPage,  subtitle: 'Analíticas y reportes',               width: '1100px' },
  cms:          { component: CmsPage,               subtitle: 'Contenido y páginas del sitio',       width: '1100px' },
  notifications:{ component: NotificationsPage,     subtitle: 'Notificaciones y alertas',            width: '860px'  },
  automations:  { component: AutomationsPage,       subtitle: 'Flujos automáticos y triggers',       width: '1100px' },
  integrations: { component: IntegrationsStorePage, subtitle: 'Integraciones y apps externas',       width: '1100px' },
  theme:        { component: ThemeEditorPage,       subtitle: 'Editor visual de temas',              width: '1100px' },
  appearance:   { component: AdminThemeSelector,    subtitle: 'Apariencia del panel admin',          width: '960px'  },
  returns:      { component: ReturnsRmaPage,        subtitle: 'Devoluciones y garantías',            width: '1100px' },
  helpdesk:     { component: HelpDeskPage,          subtitle: 'Soporte y tickets',                   width: '1100px' },
  importexport: { component: ImportExportPage,      subtitle: 'Importar y exportar datos',           width: '960px'  },
  goals:        { component: GoalsOkrsPage,         subtitle: 'Objetivos y metas OKR',               width: '960px'  },
  settings:     { component: SettingsPage,          subtitle: 'Configuración general',               width: '960px'  },
  users:        { component: UsersPage,             subtitle: 'Usuarios y roles de acceso',          width: '960px'  },
  loyalty:      { component: LoyaltyConfigPanel,    subtitle: 'Programa de lealtad y membresías',    width: '1100px' },
};

export const OSModuleRegistry = REGISTRY;
